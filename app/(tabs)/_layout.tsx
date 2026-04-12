import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/expo'
import { useColorScheme } from 'react-native'

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const colorScheme = useColorScheme()
  const activeColor = colorScheme === 'dark' ? '#ff69b4' : '#db2777'

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: activeColor }}>
      <Tabs.Screen name="index" options={{
          title: 'Start',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="home-heart" color={color} />,
          tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0, shadowOpacity: 0, position: 'absolute' },
      }}/>
      <Tabs.Screen name="(dashboard)" options={{
          title: 'Panel',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
      }}/>
      <Tabs.Screen name="kontakt" options={{
          title: 'Kontakt',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="mail-outline" color={color} />,
      }}/>
      <Tabs.Screen name="blog" options={{
          title: 'Blog',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="article" color={color} />,
      }}/>
    </Tabs>
  )
} 