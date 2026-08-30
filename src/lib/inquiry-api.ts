import { API_BASE, AuthError } from "@/lib/auth-api"

export type InquirySummary = {
  id: string
  preview: string
  question: string
  reply: string
  hasReply: boolean
  updatedAt: string
  unread: boolean
  fromLoginId: string
  fromNickname: string
}

export type InquiryAttachment = {
  id: string
  mime: string
  name: string
}

export type InquiryMessage = {
  id: string
  role: "user" | "admin"
  body: string
  createdAt: string
  attachments: InquiryAttachment[]
}

export type InquiryDetail = {
  id: string
  fromLoginId: string
  fromNickname: string
  updatedAt: string
  messages: InquiryMessage[]
}

export type InquiryImage = {
  mime: string
  name: string
  data: string
}

const CONNECT_ERROR =
  "서버에 연결하지 못했습니다. 백엔드가 실행 중인지 확인해 주세요."

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string }
    if (data.error) return data.error
  } catch {
    // fall through
  }
  return "요청에 실패했습니다. 잠시 후 다시 시도해 주세요."
}

async function inquiryFetch(path: string, token: string, init?: RequestInit) {
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new AuthError(CONNECT_ERROR, 0)
  }
}

export async function fetchInquiries(token: string): Promise<InquirySummary[]> {
  const response = await inquiryFetch("/inquiries", token)
  if (!response.ok) throw new AuthError(await readError(response), response.status)
  const data = (await response.json()) as { inquiries: InquirySummary[] }
  return data.inquiries
}

export async function fetchInquiryUnread(token: string): Promise<number> {
  const response = await inquiryFetch("/inquiries/unread", token)
  if (!response.ok) throw new AuthError(await readError(response), response.status)
  const data = (await response.json()) as { count: number }
  return data.count
}

export async function fetchInquiry(token: string, id: string): Promise<InquiryDetail> {
  const response = await inquiryFetch(`/inquiries/${id}`, token)
  if (!response.ok) throw new AuthError(await readError(response), response.status)
  const data = (await response.json()) as { inquiry: InquiryDetail }
  return data.inquiry
}

export async function createInquiry(
  token: string,
  input: { body: string; images: InquiryImage[] }
): Promise<InquiryDetail> {
  const response = await inquiryFetch("/inquiries", token, {
    method: "POST",
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new AuthError(await readError(response), response.status)
  const data = (await response.json()) as { inquiry: InquiryDetail }
  return data.inquiry
}

export async function replyInquiry(
  token: string,
  id: string,
  input: { body: string; images: InquiryImage[] }
): Promise<InquiryDetail> {
  const response = await inquiryFetch(`/inquiries/${id}/replies`, token, {
    method: "POST",
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new AuthError(await readError(response), response.status)
  const data = (await response.json()) as { inquiry: InquiryDetail }
  return data.inquiry
}

export async function fetchInquiryImage(
  token: string,
  inquiryId: string,
  fileId: string
): Promise<string> {
  const response = await inquiryFetch(`/inquiries/${inquiryId}/files/${fileId}`, token)
  if (!response.ok) throw new AuthError(await readError(response), response.status)
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export function fileToInquiryImage(file: File): Promise<InquiryImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."))
    reader.onload = () => {
      resolve({
        mime: file.type || "image/jpeg",
        name: file.name,
        data: String(reader.result ?? ""),
      })
    }
    reader.readAsDataURL(file)
  })
}
