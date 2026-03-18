import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useSignIn, useSignUp, useSSO } from '@clerk/expo'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { type SignInFormData, type SignUpFormData } from '@/lib/validations/auth'
import { validateSignInForm, validateSignUpForm, handleAuthError } from '@/lib/helpers/auth-helpers'
import { generateRandomUsername, generateRandomMotto } from '@/lib/helpers/generateUserDefaults'
import { createApiClient } from '@/services/apiClient'
import { createUserService } from '@/services/userService'

export type AuthMode = 'sign-in' | 'sign-up'

WebBrowser.maybeCompleteAuthSession()

export function useAuth(mode: AuthMode) {
  const router = useRouter()
  const { startSSOFlow } = useSSO()
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn()
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp()

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [errors, setErrors] = useState<Partial<SignInFormData | SignUpFormData>>({})

  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => { void WebBrowser.coolDownAsync() }
  }, [])

  // Sync newly created user to our DB — non-blocking
  const syncUserToDb = async (userId: string) => {
    try {
      const api = createApiClient(async () => null)
      await createUserService(api).upsert({
        userId,
        username: generateRandomUsername(),
        motto: generateRandomMotto(),
      })
    } catch (err) {
      console.error('User DB sync failed:', err)
    }
  }

  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    const isBusy = mode === 'sign-in' ? signInFetchStatus === 'fetching' : signUpFetchStatus === 'fetching'
    if (isBusy || isAuthenticating) return

    const { isValid, errors } = mode === 'sign-in'
      ? validateSignInForm(email, password)
      : validateSignUpForm(email, password)

    if (!isValid) {
      setErrors(errors)
      return
    }

    setIsAuthenticating(true)

    try {
      if (mode === 'sign-in') {
        if (!signIn) throw new Error('Sign in not initialized')
        const { error } = await signIn.create({ identifier: email })
        if (error) throw error

        const { error: pwError } = await signIn.password({ identifier: email, password })
        if (pwError) throw pwError

        if (signIn.status === 'complete') {
          await signIn.finalize()
          router.replace('/')
        } else {
          console.error(JSON.stringify(signIn, null, 2))
        }
      } else {
        if (!signUp) throw new Error('Sign up not initialized')
        const { error: createError } = await signUp.password({ emailAddress: email, password })
        if (createError) throw createError

        const { error: sendError } = await signUp.verifications.sendEmailCode()
        if (sendError) throw sendError

        setPendingVerification(true)
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setErrors(handleAuthError(err))
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleOAuth = async () => {
    const isBusy = mode === 'sign-in' ? signInFetchStatus === 'fetching' : signUpFetchStatus === 'fetching'
    if (isBusy || isAuthenticating) return

    setIsAuthenticating(true)

    try {
      const { createdSessionId, setActive: setActiveSession, signUp: oauthSignUp } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'com.wujekbizon.wolfmed',
          path: '/(auth)/oauth-callback',
        }),
      })

      if (createdSessionId) {
        if (setActiveSession) {
          await setActiveSession({ session: createdSessionId })
        }

        if (mode === 'sign-up' && oauthSignUp?.status === 'complete' && oauthSignUp.createdUserId) {
          await syncUserToDb(oauthSignUp.createdUserId)
        }

        router.replace('/')
      }
    } catch (err) {
      console.error('OAuth error:', err)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleVerifyCode = async (code: string) => {
    if (signUpFetchStatus === 'fetching' || isAuthenticating || mode !== 'sign-up' || !signUp) return

    const { isValid, errors } = validateSignUpForm('', '', true, code)
    if (!isValid) {
      setErrors(errors)
      return
    }

    setIsAuthenticating(true)

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code })
      if (error) throw error

      if (signUp.status === 'complete') {
        if (signUp.createdUserId) {
          await syncUserToDb(signUp.createdUserId)
        }
        await signUp.finalize()
        router.replace('/')
      } else {
        setErrors({ code: 'Nieprawidłowy kod weryfikacyjny' } as any)
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setErrors(handleAuthError(err))
    } finally {
      setIsAuthenticating(false)
    }
  }

  return {
    isLoaded: mode === 'sign-in' ? signInFetchStatus !== undefined : signUpFetchStatus !== undefined,
    isAuthenticating,
    pendingVerification,
    errors,
    setErrors,
    handleSubmit,
    handleOAuth,
    handleVerifyCode,
  }
}
