const LOGIN_ID_RE = /^[a-zA-Z0-9_]{4,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SignupFields = {
  loginId: string
  password: string
  email: string
}

export type SignupFieldErrors = Partial<Record<keyof SignupFields, string>>

export function validateSignupFields(input: SignupFields): SignupFieldErrors {
  const errors: SignupFieldErrors = {}
  const loginId = input.loginId.trim()
  const email = input.email.trim()

  if (!loginId) errors.loginId = "아이디를 입력해 주세요."
  else if (!LOGIN_ID_RE.test(loginId)) {
    errors.loginId = "아이디는 영문, 숫자, _ 4~20자입니다."
  }

  if (!input.password) errors.password = "비밀번호를 입력해 주세요."
  else if (input.password.length < 8 || input.password.length > 72) {
    errors.password = "비밀번호는 8자 이상이어야 합니다."
  }

  if (!email) errors.email = "이메일을 입력해 주세요."
  else if (!EMAIL_RE.test(email.toLowerCase())) {
    errors.email = "올바른 이메일을 입력해 주세요."
  }

  return errors
}

export function fieldErrorFromMessage(message: string): SignupFieldErrors {
  if (message.includes("아이디")) return { loginId: message }
  if (message.includes("비밀번호")) return { password: message }
  if (message.includes("이메일")) return { email: message }
  return {}
}
