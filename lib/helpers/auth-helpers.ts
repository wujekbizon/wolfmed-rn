import { SignInFormData, SignUpFormData, signInSchema, signUpSchema } from '../validations/auth'

export const validateSignInForm = (email: string, password: string) => {
  try {
    signInSchema.parse({ email, password })
    return { isValid: true, errors: {} }
  } catch (error: any) {
    const formattedErrors: Partial<SignInFormData> = {}
    const issues = error.issues ?? error.errors ?? []
    issues.forEach((err: any) => {
      if (err.path[0] === 'email') formattedErrors.email = err.message
      if (err.path[0] === 'password') formattedErrors.password = err.message
    })
    return { isValid: false, errors: formattedErrors }
  }
}

export const validateSignUpForm = (
  email: string, 
  password: string, 
  isVerification = false,
  code?: string
) => {
  try {
    if (isVerification) {
      signUpSchema.pick({ code: true }).parse({ code })
    } else {
      signUpSchema.omit({ code: true }).parse({ email, password })
    }
    return { isValid: true, errors: {} }
  } catch (error: any) {
    const formattedErrors: Partial<SignUpFormData> = {}
    const issues = error.issues ?? error.errors ?? []
    issues.forEach((err: any) => {
      if (err.path[0] === 'email') formattedErrors.email = err.message
      if (err.path[0] === 'password') formattedErrors.password = err.message
      if (err.path[0] === 'code') formattedErrors.code = err.message
    })
    return { isValid: false, errors: formattedErrors }
  }
}

export const handleAuthError = (error: any) => {
  const message = error?.message ?? error?.errors?.[0]?.message ?? error?.errors?.[0]?.longMessage
  if (!message) return {}

  const msg = (message as string).toLowerCase()
  if (msg.includes('email') || msg.includes('identifier')) return { email: message }
  if (msg.includes('password')) return { password: message }
  return { password: message }
} 