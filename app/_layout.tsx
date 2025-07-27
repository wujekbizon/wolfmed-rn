import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { plPL } from '@clerk/localizations'
import { Stack} from 'expo-router'
import { useState } from 'react'
import SplashScreen from '@/components/SplashScreen'
import * as SecureStore from 'expo-secure-store'
import { useColorScheme } from '@/hooks/useColorScheme'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>
  saveToken: (key: string, token: string) => Promise<void>
  clearToken?: (key: string) => void
}

export default function RootLayout() {
  const [client] = useState(new QueryClient())
  const [isSplashVisible, setIsSplashVisible] = useState(true)

  const tokenCache: TokenCache = {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key)
        if (item) {
          console.log(`${key} was used 🔐 \n`)
        } else {
          console.log('No values stored under key: ' + key)
        }
        return item
      } catch (error) {
        console.error('SecureStore get item error: ', error)
        await SecureStore.deleteItemAsync(key)
        return null
      }
    },
    async saveToken(key: string, value: string) {
      try {
        return SecureStore.setItemAsync(key, value)
      } catch (err) {
        console.log(err)
        return
      }
    },
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
  }

  const colorScheme = useColorScheme()
  return (
    <GestureHandlerRootView style={{ flex: 1}} className='bg-background'>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} localization={plPL}>
        <QueryClientProvider client={client}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <ClerkLoaded>
            {isSplashVisible ? <SplashScreen onReady={() => setIsSplashVisible(false)} /> : (
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(welcome)" />
                  <Stack.Screen name="(drawer)" />
                  <Stack.Screen name="(auth)" />
                </Stack>
              )}
            </ClerkLoaded>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  )
}
