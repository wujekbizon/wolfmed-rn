import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useSignIn, useSignUp, useSSO, useUser } from '@clerk/expo'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { type SignInFormData, type SignUpFormData } from '@/lib/validations/auth'
import { validateSignInForm, validateSignUpForm, handleAuthError } from '@/lib/helpers/auth-helpers'

export type AuthMode = 'sign-in' | 'sign-up'

WebBrowser.maybeCompleteAuthSession()

export function useAuth(mode: AuthMode) {
  const router = useRouter()
  const { startSSOFlow } = useSSO()
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp()
  const { user } = useUser()

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [errors, setErrors] = useState<Partial<SignInFormData | SignUpFormData>>({})

  // Warm up browser for OAuth
  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])

  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    if ((!isSignInLoaded && mode === 'sign-in') || (!isSignUpLoaded && mode === 'sign-up') || isAuthenticating) {
      return
    }

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
        const signInAttempt = await signIn.create({
          identifier: email,
          password,
        })

        if (signInAttempt.status === 'complete') {
          await setSignInActive?.({ session: signInAttempt.createdSessionId })
          router.replace('/')
        } else {
          console.error(JSON.stringify(signInAttempt, null, 2))
        }
      } else {
        if (!signUp) throw new Error('Sign up not initialized')
        await signUp.create({
          emailAddress: email,
          password,
        })

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
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
    if ((!isSignInLoaded && mode === 'sign-in') || (!isSignUpLoaded && mode === 'sign-up') || isAuthenticating) {
      return
    }

    setIsAuthenticating(true)
    
    try {
      const { createdSessionId, setActive: setActiveSession, signUp: oauthSignUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'com.wujekbizon.wolfmed',
          path: '/(auth)/oauth-callback'
        }),
      })
      
      if (createdSessionId) {
        if (setActiveSession) {
          await setActiveSession({ session: createdSessionId })
        }
        
        // Set user role if this is a new signup
        if (mode === 'sign-up' && oauthSignUp?.status === 'complete' && oauthSignUp.createdUserId) {
          await user?.update({
            unsafeMetadata: { role: 'user' },
          })
        }
        
        router.replace('/')
      } else if (oauthSignUp) {
        console.log("Additional sign in steps required")
      }
    } catch (err) {
      console.error("OAuth error:", err)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleVerifyCode = async (code: string) => {
    if (!isSignUpLoaded || isAuthenticating || mode !== 'sign-up' || !signUp) return
    
    const { isValid, errors } = validateSignUpForm('', '', true, code)
    if (!isValid) {
      setErrors(errors)
      return
    }
    
    setIsAuthenticating(true)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setSignUpActive?.({ session: completeSignUp.createdSessionId })
        await user?.update({
          unsafeMetadata: { role: 'user' },
        })
        router.replace('/')
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2))
        setErrors({ code: 'Nieprawidłowy kod weryfikacyjny' })
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setErrors(handleAuthError(err))
    } finally {
      setIsAuthenticating(false)
    }
  }

  return {
    isLoaded: mode === 'sign-in' ? isSignInLoaded : isSignUpLoaded,
    isAuthenticating,
    pendingVerification,
    errors,
    setErrors,
    handleSubmit,
    handleOAuth,
    handleVerifyCode,
  }
} 