const LOGIN_ID_CHARS = /^[a-zA-Z0-9_]+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SignupFields = {
  loginId: string
  password: string
  email: string
}

export type LoginFields = {
  loginId: string
  password: string
}

export type SignupFieldErrors = Partial<Record<keyof SignupFields, string>>
export type LoginFieldErrors = Partial<Record<keyof LoginFields, string>>

export function loginIdError(value: string) {
  const loginId = value.trim()
  if (!loginId) return "아이디를 입력해 주세요."
  if (loginId.length < 4) {
    return `아이디는 4자 이상이어야 합니다. 지금은 ${loginId.length}자입니다.`
  }
  if (loginId.length > 20) {
    return `아이디는 20자 이하여야 합니다. 지금은 ${loginId.length}자입니다.`
  }
  if (!LOGIN_ID_CHARS.test(loginId)) {
    return "아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다."
  }
  return null
}

export function passwordError(value: string, mode: "login" | "signup") {
  if (!value) return "비밀번호를 입력해 주세요."
  if (mode === "login") return null
  if (value.length < 8) {
    return `비밀번호는 8자 이상이어야 합니다. 지금은 ${value.length}자입니다.`
  }
  if (value.length > 72) {
    return `비밀번호는 72자 이하여야 합니다. 지금은 ${value.length}자입니다.`
  }
  return null
}

export function emailError(value: string) {
  const email = value.trim()
  if (!email) return "이메일을 입력해 주세요."
  if (!email.includes("@")) {
    return "이메일 형식이 올바르지 않습니다. @를 포함해 주세요. 예: name@example.com"
  }
  if (!EMAIL_RE.test(email.toLowerCase())) {
    return "이메일 형식이 올바르지 않습니다. 예: name@example.com"
  }
  return null
}

export function validateSignupFields(input: SignupFields): SignupFieldErrors {
  const errors: SignupFieldErrors = {}
  const loginId = loginIdError(input.loginId)
  const password = passwordError(input.password, "signup")
  const email = emailError(input.email)
  if (loginId) errors.loginId = loginId
  if (password) errors.password = password
  if (email) errors.email = email
  return errors
}

export function validateLoginFields(input: LoginFields): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  if (!input.loginId.trim()) errors.loginId = "아이디를 입력해 주세요."
  if (!input.password) errors.password = "비밀번호를 입력해 주세요."
  return errors
}

export function fieldErrorFromMessage(message: string): SignupFieldErrors {
  if (
    message.includes("이미 사용 중인 아이디") ||
    message.includes("아이디를 찾을") ||
    message.includes("아이디는") ||
    message.includes("아이디를 입력")
  ) {
    return { loginId: message }
  }
  if (
    message.includes("이미 사용 중인 이메일") ||
    message.includes("이메일 형식") ||
    message.includes("이메일을 입력")
  ) {
    return { email: message }
  }
  if (
    message.includes("비밀번호가") ||
    message.includes("비밀번호는") ||
    message.includes("비밀번호를 입력") ||
    message.includes("소셜")
  ) {
    return { password: message }
  }
  return {}
}

export function loginErrorFromMessage(message: string): LoginFieldErrors {
  const mapped = fieldErrorFromMessage(message)
  const errors: LoginFieldErrors = {}
  if (mapped.loginId) errors.loginId = mapped.loginId
  if (mapped.password) errors.password = mapped.password
  return errors
}
