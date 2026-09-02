import { isProvider, type AuthUser, type Provider } from "@/lib/types"

function trimOrigin(value?: string) {
  return value?.replace(/\/$/, "") || ""
}

export function apiOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return (
    trimOrigin(process.env.DADOK_API_URL) ||
    trimOrigin(process.env.NEXT_PUBLIC_API_URL) ||
    "http://127.0.0.1:8787"
  )
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type AuthResponse = {
  token: string
  user: AuthUser
}

const CONNECT_ERROR =
  "서버에 연결하지 못했습니다. 백엔드가 실행 중인지 확인해 주세요."

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string }
    if (data.error) return data.error
  } catch {
    // fall through to status-based copy
  }
  if (response.status >= 500) {
    return "서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
  }
  return "요청에 실패했습니다. 입력 내용을 확인하고 다시 시도해 주세요."
}

async function request(path: string, init?: RequestInit) {
  try {
    return await fetch(`${apiOrigin()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new AuthError(CONNECT_ERROR, 0)
  }
}

export async function registerAccount(input: {
  loginId: string
  password: string
  email: string
}): Promise<AuthResponse> {
  const response = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new AuthError(await readError(response), response.status)
  }
  return (await response.json()) as AuthResponse
}

export async function loginAccount(
  loginId: string,
  password: string
): Promise<AuthResponse> {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId, password }),
  })
  if (!response.ok) {
    throw new AuthError(await readError(response), response.status)
  }
  return (await response.json()) as AuthResponse
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await request("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new AuthError(await readError(response), response.status)
  }
  const data = (await response.json()) as { user: AuthUser }
  return {
    ...data.user,
    providers: Array.isArray(data.user.providers)
      ? data.user.providers.filter(isProvider)
      : [],
  }
}

export async function updateLoginId(
  token: string,
  loginId: string
): Promise<AuthResponse> {
  const response = await request("/auth/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ loginId }),
  })
  if (!response.ok) {
    throw new AuthError(await readError(response), response.status)
  }
  return (await response.json()) as AuthResponse
}

export async function updateNickname(
  token: string,
  nickname: string
): Promise<AuthResponse> {
  const response = await request("/auth/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nickname }),
  })
  if (!response.ok) {
    throw new AuthError(await readError(response), response.status)
  }
  return (await response.json()) as AuthResponse
}

export async function checkNicknameAvailable(
  token: string,
  nickname: string
): Promise<{ available: boolean; error?: string }> {
  const response = await request("/auth/nickname-available", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nickname }),
  })
  if (!response.ok) {
    return { available: true }
  }
  return (await response.json()) as { available: boolean; error?: string }
}

export function oauthStartUrl(provider: Provider, token?: string) {
  const url = new URL(`/auth/${provider}/start`, apiOrigin())
  if (token) url.searchParams.set("token", token)
  return url.toString()
}
