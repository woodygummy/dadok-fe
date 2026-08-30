import type { AuthUser, Provider } from "@/lib/types"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8787"

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

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error || "요청에 실패했습니다."
  } catch {
    return "요청에 실패했습니다."
  }
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  return response
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
  return data.user
}

export function oauthStartUrl(provider: Provider, token?: string) {
  const url = new URL(`${API_BASE}/auth/${provider}/start`)
  if (token) url.searchParams.set("token", token)
  return url.toString()
}
