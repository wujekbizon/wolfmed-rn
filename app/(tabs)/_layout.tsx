import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/expo'
import { useColorScheme } from 'react-native'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const isAdmin = useIsAdmin()
  const colorScheme = useColorScheme()
  const activeColor = colorScheme === 'dark' ? '#ff69b4' : '#db2777'

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: activeColor, tabBarInactiveTintColor: colorScheme === 'dark' ? '#ffffff' : '#111111' }}>
      <Tabs.Screen name="index" options={{
          title: 'Start',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons size={28} name="home-heart" color={color} style={{ textShadowColor: focused ? activeColor : 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 10 : 5 }} />
          ),
          tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0, shadowOpacity: 0, position: 'absolute' },
      }}/>
      <Tabs.Screen name="(dashboard)" options={{
          title: 'Panel',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons size={28} name="dashboard" color={color} style={{ textShadowColor: focused ? activeColor : 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 10 : 5 }} />
          ),
      }}/>
      <Tabs.Screen name="kontakt" options={{
          title: 'Kontakt',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons size={28} name="mail-outline" color={color} style={{ textShadowColor: focused ? activeColor : 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 10 : 5 }} />
          ),
      }}/>
      <Tabs.Screen name="blog" options={{
          title: 'Blog',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons size={28} name="article" color={color} style={{ textShadowColor: focused ? activeColor : 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 10 : 5 }} />
          ),
      }}/>
      <Tabs.Screen name="admin" options={{
          title: 'Admin',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons size={28} name="admin-panel-settings" color={color} style={{ textShadowColor: focused ? activeColor : 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 10 : 5 }} />
          ),
      }}/>
    </Tabs>
  )
} 