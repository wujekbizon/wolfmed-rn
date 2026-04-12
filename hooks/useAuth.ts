import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useSignIn, useSignUp, useSSO, useAuth as useClerkAuth } from '@clerk/expo'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { type SignInFormData, type SignUpFormData } from '@/lib/validations/auth'
import { validateSignInForm, validateSignUpForm, handleAuthError } from '@/lib/helpers/auth-helpers'
import { generateRandomUsername, generateRandomMotto } from '@/lib/helpers/generateUserDefaults'
import { createApiClient } from '@/services/apiClient'
import { createUserService } from '@/services/userService'

export type AuthMode = 'sign-in' | 'sign-up'

WebBrowser.maybeCompleteAuthSession()

/**
 * useAuth — unified authentication hook for sign-in and sign-up flows.
 *
 * Built on @clerk/expo v3 (Signal-based API). Pass `mode` to switch between flows.
 *
 * ─── SIGN-UP FLOW (email + password) ───────────────────────────────────────
 * 1. handleSubmit({ email, password })
 *    - Validates form (Zod)
 *    - signUp.password({ emailAddress, password }) — creates Clerk account
 *    - signUp.verifications.sendEmailCode() — sends verification email
 *    - Sets pendingVerification = true → UI shows code input
 *
 * 2. handleVerifyCode(code)
 *    - signUp.verifications.verifyEmailCode({ code }) — verifies the code
 *    - signUp.finalize() — activates the session (Clerk JWT now available)
 *    - syncUserToDb() — POST /api/users { username, motto } + Bearer token
 *      (userId is NOT sent — API extracts it from JWT sub claim for security)
 *    - Navigates to "/"
 *
 * ─── SIGN-IN FLOW (email + password) ───────────────────────────────────────
 * 1. handleSubmit({ email, password })
 *    - Validates form (Zod)
 *    - signIn.create({ identifier: email }) — starts sign-in, identifies user
 *    - signIn.password({ identifier, password }) — submits password (v3 two-step)
 *    - signIn.finalize() — activates the session
 *    - Navigates to "/"
 *
 * ─── OAUTH FLOW (Google) ────────────────────────────────────────────────────
 * 1. handleOAuth()
 *    - startSSOFlow({ strategy: 'oauth_google', redirectUrl }) — opens browser
 *    - setActiveSession({ session: createdSessionId }) — activates the session
 *    - syncUserToDb() always called — API is an upsert (no-op if user exists)
 *    - Navigates to "/"
 *
 * ─── USER SYNC ──────────────────────────────────────────────────────────────
 * syncUserToDb() is always called AFTER finalize()/setActiveSession() so that
 * getToken() returns a valid JWT. The API endpoint POST /api/users requires
 * [Authorize] and overwrites userId from the JWT sub claim — the body only
 * carries { username, motto } to prevent spoofing another user's ID.
 *
 * ─── CLERK v3 API NOTES ─────────────────────────────────────────────────────
 * - useSignIn/useSignUp return { signIn/signUp, fetchStatus } — no setActive/isLoaded
 * - finalize() replaces setActive({ session })
 * - signUp.password() replaces signUp.create({ password })
 * - signUp.verifications.sendEmailCode() replaces prepareEmailAddressVerification()
 * - signUp.verifications.verifyEmailCode() replaces attemptEmailAddressVerification()
 * - useSSO (OAuth) still uses old-style setActive — unchanged
 */
export function useAuth(mode: AuthMode) {
  const router = useRouter()
  const { getToken } = useClerkAuth()
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

  // Sync newly created user to our DB — call after finalize() so token is available
  const syncUserToDb = async () => {
    try {
      const api = createApiClient(getToken)
      await createUserService(api).upsert({
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
        const { error: pwError } = await signIn.password({ identifier: email, password })
        if (pwError) throw pwError

        if (signIn.status === 'complete') {
          await signIn.finalize({
            navigate: () => { router.replace('/') },
          })
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

        await syncUserToDb()

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
        await signUp.finalize({
          navigate: () => { router.replace('/') },
        })
        await syncUserToDb()
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
