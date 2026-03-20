import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { ClerkProvider, ClerkLoaded } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { plPL } from '@clerk/localizations'
import { Stack} from 'expo-router'
import { useState } from 'react'
import SplashScreen from '@/components/SplashScreen'
import { useColorScheme } from '@/hooks/useColorScheme'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useFonts,
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  OpenSans_800ExtraBold,
} from '@expo-google-fonts/open-sans'
import { Text, TextInput } from 'react-native'
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: true,
});

export default function RootLayout() {
  const [client] = useState(new QueryClient())
  const [isSplashVisible, setIsSplashVisible] = useState(true)
  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    OpenSans_800ExtraBold,
  })

  // Apply Open Sans as default font globally
  const defaultTextStyle = { fontFamily: 'OpenSans_400Regular' } as const
  ;(Text as any).defaultProps = (Text as any).defaultProps ?? {}
  ;(Text as any).defaultProps.style = defaultTextStyle
  ;(TextInput as any).defaultProps = (TextInput as any).defaultProps ?? {}
  ;(TextInput as any).defaultProps.style = defaultTextStyle

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
  }

  const colorScheme = useColorScheme()
  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} localization={plPL}>
        <QueryClientProvider client={client}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <ClerkLoaded>
            {isSplashVisible ? <SplashScreen onReady={() => setIsSplashVisible(false)} /> : (
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
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
