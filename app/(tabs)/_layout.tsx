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
          backgroundColor: colorScheme === 'dark' ? '#222' : '#ffe7e7',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wolfmed Edukacja',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="tests-procedures"
        options={{
          title: 'Nauka',
          tabBarIcon: ({ color }) => <TabBarIcon name="stethoscope" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Testy',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'O nas',
          tabBarIcon: ({ color }) => <TabBarIcon name="info-circle" color={color} />,
          headerShown: false,
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
        name="learn"
        options={{
          title: 'Nauka',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="procedures"
        options={{
          title: 'Procedury',
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  )
}
