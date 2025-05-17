import { Drawer } from 'expo-router/drawer'
import { useColorScheme, Dimensions , View, Pressable } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { useRouter } from 'expo-router'
import { cn } from '@/lib/utils'
import LogoHeader from '@/components/LogoHeader'
import { useDashboardStore } from '@/store/useDashboardStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85

function DrawerIcon(props: { 
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
  size: number 
}) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View 
      style={{ 
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
      }}
    >
      <FontAwesome {...props} />
    </View>
  )
}

function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const isDark = colorScheme === 'dark'

  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: 0,
      }}
    >
      
      <Pressable 
          onPress={() => router.push('/(welcome)')}
          className="w-full px-2 pt-6 active:opacity-70"
        >
          <LogoHeader isDark={isDark} />

      </Pressable>
      <View className={cn(
        "flex-1 w-full border-t pt-2 pb-6 mt-4",
        isDark 
          ? "bg-black/30 border-white/10" 
          : "bg-white/70 border-zinc-200"
      )}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  )
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { activeSection, getSectionConfig } = useDashboardStore()
  const activeColor = getSectionConfig(activeSection).color

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#000' : '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDark ? '#fff' : '#18181B',
        headerShadowVisible: false,
        drawerStyle: {
          backgroundColor: isDark ? '#000' : '#fff',
          width: DRAWER_WIDTH,
          borderRightWidth: 1,
          borderRightColor: isDark ? 'rgba(255, 91, 91, 0.2)' : 'rgba(0,0,0,0.1)',
        },
        drawerActiveTintColor: isDark ? '#fff' : '#18181B',
        drawerInactiveTintColor: isDark 
          ? 'rgba(255,255,255,0.5)' 
          : 'rgba(0,0,0,0.5)',
        drawerActiveBackgroundColor: isDark 
          ? 'rgba(255,91,91,0.15)'
          : 'rgba(0,0,0,0.05)',
        drawerItemStyle: {
          borderRadius: 6,
          marginHorizontal: 0,
          marginVertical: 1,
          paddingVertical: 1,
        },
        drawerLabelStyle: {
          marginLeft: -4,
          fontSize: 15,
          fontWeight: '600',
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
          headerStyle: {
            backgroundColor: isDark 
              ? `${activeColor}15` 
              : `${activeColor}20`,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
      <Drawer.Screen
        name="(learn)"
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
