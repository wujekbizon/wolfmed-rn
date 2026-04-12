import { Drawer } from "expo-router/drawer";
import { Dimensions, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useDashboardStore } from "@/store/useDashboardStore";
import CustomDrawerContent from "@/components/ui/CustomDrawerContent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

function DrawerIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  size: number;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      }}
    >
      <FontAwesome {...props} />
    </View>
  );
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { activeSection, getSectionConfig } = useDashboardStore();
  const activeColor = getSectionConfig(activeSection).color;
  const pathname = usePathname();
  const isHeaderShown = pathname.includes("/procedury/") || pathname.includes("/procedures") || pathname.includes("/quizes") || pathname.includes("/questions");
  
  return (
    <Drawer
      screenOptions={{
        headerShown: !isHeaderShown,
        drawerStyle: {
          backgroundColor: "transparent",
          width: DRAWER_WIDTH,
          marginTop: insets.top,
          marginBottom: insets.bottom,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#280652",
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: isDark ? "#1e1b2e" : "#ffffff",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDark ? "#f1f5f9" : "#1e1b4b",
        headerShadowVisible: false,
        drawerActiveTintColor: "#A491BB",
        drawerInactiveTintColor: isDark ? "rgba(255,255,255,0.45)" : "rgba(30,27,76,0.45)",
        drawerActiveBackgroundColor: "#A491BB18",
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 8,
          marginVertical: 2,
          paddingVertical: 2,
        },
        drawerLabelStyle: {
          marginLeft: -4,
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Panel główny",
          title: "Panel główny",
          drawerIcon: ({ color, size }) => (
            <DrawerIcon name="home" color={color} size={size} />
          ),
          headerStyle: {
            backgroundColor: isDark ? `${activeColor}15` : `${activeColor}20`,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
      <Drawer.Screen
        name="(learn)"
        options={{
          drawerLabel: "Materiały do nauki",
          title: "Materiały do nauki",
          drawerIcon: ({ color, size }) => (
            <DrawerIcon name="book" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="tests"
        options={{
          drawerLabel: "Centrum testów",
          title: "Centrum testów",
          drawerIcon: ({ color, size }) => (
            <DrawerIcon name="check-square" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="tests-procedures"
        options={{
          drawerLabel: "Materiały szkoleniowe",
          title: "Materiały szkoleniowe",
          drawerIcon: ({ color, size }) => (
            <DrawerIcon name="graduation-cap" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}
