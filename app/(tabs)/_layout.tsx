import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/expo'

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: 'red' }}>
      <Tabs.Screen name="index" options={{
          title: 'Start',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="home-heart" color={color} />,
      }}/>
      <Tabs.Screen name="(dashboard)" options={{
          title: 'Panel',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
      }}/>
      <Tabs.Screen name="forum" options={{
          title: 'Forum',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="forum" color={color} />,
      }}/>
      <Tabs.Screen name="blog" options={{
          title: 'Blog',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="article" color={color} />,
      }}/>
    </Tabs>
  )
} 