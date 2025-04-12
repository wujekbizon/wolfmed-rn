import { Drawer } from 'expo-router/drawer'
import { useColorScheme } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { View, Text } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

function DrawerIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; size: number }) {
  return (
    <View style={{ width: 32, alignItems: 'center', marginRight: 16 }}>
      <FontAwesome {...props} />
    </View>
  )
}

function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const isDark = colorScheme === 'dark'

  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: insets.top,
      }}
    >
      {/* Header/Profile Section with Gradient */}
      <View style={{ position: 'relative', marginBottom: 15 }}>
        <LinearGradient
          colors={isDark 
            ? ['rgba(255,105,180,0.15)', 'rgba(255,105,180,0.05)', 'transparent']
            : ['rgba(219,39,119,0.1)', 'rgba(219,39,119,0.03)', 'transparent']
          }
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
          }}
        />
        <View 
          style={{ 
            padding: 24,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <Text 
            style={{ 
              fontSize: 28, 
              fontWeight: '600',
              color: isDark ? '#fff' : '#111',
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            WOLFMED
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: isDark ? '#FF69B4' : '#db2777',
              letterSpacing: 1,
              opacity: 0.9,
            }}
          >
            EDUKACJA
          </Text>
        </View>
      </View>

      {/* Custom Drawer Items Container */}
      <View style={{ 
        flex: 1,
        backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
      }}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  )
}

export default function AppLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#111' : '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDark ? '#FF69B4' : '#db2777',
        headerShadowVisible: false,
        drawerStyle: {
          backgroundColor: isDark ? '#111' : '#fff',
          width: 320,
          borderRightWidth: 0,
        },
        drawerActiveTintColor: isDark ? '#FF69B4' : '#db2777',
        drawerInactiveTintColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
        drawerActiveBackgroundColor: isDark ? 'rgba(255,105,180,0.15)' : 'rgba(219,39,119,0.08)',
        drawerItemStyle: {
          borderRadius: 0,
          marginVertical: 0,
          paddingVertical: 0,
          marginHorizontal: 0,
        },
        drawerLabelStyle: {
          marginLeft: -4,
          fontSize: 15,
          fontWeight: '500',
          letterSpacing: 0.3,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Panel główny',
          title: 'Panel główny',
          drawerIcon: ({ color, size }) => <DrawerIcon name="home" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="learn"
        options={{
          drawerLabel: 'Materiały do nauki',
          title: 'Materiały do nauki',
          drawerIcon: ({ color, size }) => <DrawerIcon name="book" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="tests"
        options={{
          drawerLabel: 'Centrum testów',
          title: 'Centrum testów',
          drawerIcon: ({ color, size }) => <DrawerIcon name="check-square" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="procedures"
        options={{
          drawerLabel: 'Procedury medyczne',
          title: 'Procedury medyczne',
          drawerIcon: ({ color, size }) => <DrawerIcon name="stethoscope" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="tests-procedures"
        options={{
          drawerLabel: 'Materiały szkoleniowe',
          title: 'Materiały szkoleniowe',
          drawerIcon: ({ color, size }) => <DrawerIcon name="graduation-cap" color={color} size={size} />,
        }}
      />
    </Drawer>
  )
}
