import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#FF69B4' : '#FF1493',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#888' : '#666',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tests-procedures"
        options={{
          title: 'Tests & Procedures',
          tabBarIcon: ({ color }) => <TabBarIcon name="stethoscope" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <TabBarIcon name="info-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: 'Blog',
          tabBarIcon: ({ color }) => <TabBarIcon name="rss" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Tests',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="procedures"
        options={{
          title: 'Procedures',
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  )
}
