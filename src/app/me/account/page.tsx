"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { BackLink } from "@/components/back-link"
import { SketchFrame } from "@/components/sketch-stroke"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AuthError, checkNicknameAvailable } from "@/lib/auth-api"
import { loginIdError as loginIdFieldError } from "@/lib/auth-validate"
import { SocialAuthButtons } from "@/components/social-auth-buttons"
import { readAvatarFile } from "@/lib/read-avatar"
import { useDadok } from "@/lib/store"
import { type Provider } from "@/lib/types"

const PROVIDER_NAME: Record<Provider, string> = {
  kakao: "카카오",
  google: "구글",
  naver: "네이버",
}

const PROVIDER_ORDER: Provider[] = ["kakao", "google", "naver"]

export default function AccountPage() {
  const { profile, session, setNickname, setLoginId, setAvatar, logout, refreshUser } = useDadok()
  const router = useRouter()
  const [loginIdDraft, setLoginIdDraft] = useState(session?.user.loginId ?? "")
  const [loginIdMessage, setLoginIdMessage] = useState("")
  const [nicknameOpen, setNicknameOpen] = useState(false)
  const [nicknameDraft, setNicknameDraft] = useState(profile.nickname)
  const [nicknameMessage, setNicknameMessage] = useState("")
  const [nicknameTaken, setNicknameTaken] = useState(false)
  const [nicknameSaving, setNicknameSaving] = useState(false)

  useEffect(() => {
    setLoginIdDraft(session?.user.loginId ?? "")
  }, [session?.user.loginId])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (!nicknameOpen) return
    const next = nicknameDraft.trim()
    if (!next || next === profile.nickname) {
      setNicknameTaken(false)
      return
    }
    const token = session?.token
    if (!token) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void checkNicknameAvailable(token, next).then((result) => {
        if (cancelled) return
        if (result.available) {
          setNicknameTaken(false)
          return
        }
        setNicknameTaken(true)
        setNicknameMessage(result.error || "이미 사용 중인 닉네임입니다.")
      })
    }, 280)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [nicknameDraft, nicknameOpen, profile.nickname, session?.token])

  function openNicknameModal() {
    setNicknameDraft(profile.nickname)
    setNicknameMessage("")
    setNicknameTaken(false)
    setNicknameOpen(true)
  }

  async function saveNickname() {
    const next = nicknameDraft.trim()
    if (!next) {
      setNicknameMessage("닉네임을 입력해 주세요.")
      return
    }
    if (next === profile.nickname) {
      setNicknameOpen(false)
      return
    }
    if (nicknameTaken) {
      setNicknameMessage("이미 사용 중인 닉네임입니다.")
      return
    }
    setNicknameSaving(true)
    try {
      await setNickname(next)
      setNicknameMessage("")
      setNicknameOpen(false)
    } catch (err) {
      setNicknameMessage(
        err instanceof AuthError ? err.message : "닉네임을 바꾸지 못했습니다."
      )
    } finally {
      setNicknameSaving(false)
    }
  }

  async function saveLoginId() {
    const next = loginIdDraft.trim()
    if (!next || next === loginId) {
      setLoginIdDraft(loginId)
      setLoginIdMessage("")
      return
    }
    const invalid = loginIdFieldError(next)
    if (invalid) {
      setLoginIdMessage(invalid)
      setLoginIdDraft(loginId)
      return
    }
    try {
      await setLoginId(next)
      setLoginIdMessage("")
    } catch (err) {
      setLoginIdDraft(loginId)
      setLoginIdMessage(
        err instanceof AuthError ? err.message : "아이디를 바꾸지 못했습니다."
      )
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      setAvatar(await readAvatarFile(file))
    } catch {
      // keep the previous photo
    }
  }

  const initial = profile.nickname.trim().slice(0, 1) || "다"
  const linked = session?.user.providers ?? []
  const loginId = session?.user.loginId ?? ""
  const emailLabel =
    session?.user.email ||
    profile.email ||
    (session?.user.hasPassword ? "" : "소셜 가입")

  return (
    <div className="space-y-6">
      <BackLink href="/me" />

      <div className="flex flex-col items-center gap-2">
        <div className="relative size-24">
          <div className="size-full overflow-hidden rounded-full bg-[#d8d4cf]">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center font-serif text-3xl text-[var(--wood)]">
                {initial}
              </span>
            )}
          </div>
          <label className="absolute right-0 bottom-0 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--wood)] bg-[var(--card)] text-[var(--wood)]">
            <Pencil className="size-3.5" strokeWidth={2.2} />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="프로필 사진 바꾸기"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div className="flex justify-center">
          <div className="inline-flex max-w-[14rem] items-center">
            <p className="truncate font-serif text-lg font-semibold">{profile.nickname}</p>
            <button
              type="button"
              className="ml-0.5 inline-flex shrink-0 p-0.5 text-[var(--wood)]"
              aria-label="닉네임 수정"
              onClick={openNicknameModal}
            >
              <Pencil className="size-3.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={nicknameOpen}
        onOpenChange={(next) => {
          setNicknameOpen(next)
          if (!next) {
            setNicknameDraft(profile.nickname)
            setNicknameMessage("")
            setNicknameTaken(false)
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="inset-0 m-auto h-fit max-h-[calc(100vh-2rem)] w-full max-w-[min(28rem,calc(100%-2rem))] translate-x-0 translate-y-0 overflow-visible border-0 bg-transparent p-4 shadow-none ring-0 sm:max-w-md"
        >
          <div className="sketch-frame relative min-w-0 overflow-visible rounded-[24px] bg-[var(--niche)] p-5">
            <DialogTitle className="font-serif text-lg">닉네임 수정</DialogTitle>
            <SketchFrame className="mt-4 rounded-[16px]">
              <Input
                value={nicknameDraft}
                maxLength={16}
                onChange={(event) => {
                  setNicknameDraft(event.target.value)
                  setNicknameMessage("")
                  setNicknameTaken(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void saveNickname()
                  }
                }}
                autoFocus
                aria-label="닉네임"
                aria-invalid={Boolean(nicknameMessage) || undefined}
                className="h-12 rounded-[16px] border-0 bg-transparent px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
              />
            </SketchFrame>
            {nicknameMessage ? (
              <p className="mt-3 text-sm text-[var(--destructive)]">{nicknameMessage}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-3xl"
                    disabled={nicknameSaving}
                  />
                }
              >
                닫기
              </DialogClose>
              <Button
                type="button"
                className="h-12 flex-1 rounded-3xl"
                disabled={nicknameSaving || nicknameTaken}
                onClick={() => void saveNickname()}
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mx-auto w-full max-w-[17.75rem] space-y-6">
      <section className="sketch-frame rounded-[18px] bg-[var(--niche)]">
        <div className="px-4 pt-5 pb-3.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="shrink-0 text-sm font-medium">아이디</h2>
            <Input
              value={loginIdDraft}
              onChange={(event) => {
                setLoginIdDraft(event.target.value)
                setLoginIdMessage("")
              }}
              onBlur={() => void saveLoginId()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur()
                }
              }}
              maxLength={20}
              aria-label="아이디"
              aria-invalid={Boolean(loginIdMessage) || undefined}
              className="h-8 min-w-0 max-w-[10rem] border-0 bg-transparent px-0 text-right text-sm text-muted-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          {loginIdMessage ? (
            <p className="mt-1 text-right text-xs text-[var(--destructive)]">{loginIdMessage}</p>
          ) : null}
        </div>
        <div className="sketch-line mx-4" />
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <h2 className="shrink-0 text-sm font-medium">이메일</h2>
          <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
            {emailLabel || "없음"}
          </p>
        </div>
        <div className="sketch-line mx-4" />
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-5">
          <h2 className="shrink-0 text-sm font-medium">
            {linked.length ? "소셜 연동" : "소셜 연동하기"}
          </h2>
          {linked.length ? (
            <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
              {PROVIDER_ORDER.filter((provider) => linked.includes(provider))
                .map((provider) => PROVIDER_NAME[provider])
                .join(" · ")}
            </p>
          ) : session ? (
            <SocialAuthButtons
              token={session.token}
              mode="link"
              variant="icons"
              size="sm"
            />
          ) : null}
        </div>
      </section>

      <div className="flex justify-end px-1">
        <Button
          variant="ghost"
          className="h-auto border-0 bg-transparent px-0 text-sm text-[var(--destructive)] shadow-none hover:bg-transparent hover:text-[var(--destructive)]"
          onClick={() => {
            logout()
            router.replace("/login")
          }}
        >
          로그아웃
        </Button>
      </div>
      </div>
    </div>
  )
}
