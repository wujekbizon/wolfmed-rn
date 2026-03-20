import { DrawerContentScrollView } from "@react-navigation/drawer"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Pressable, useColorScheme, View, Text, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const ROUTE_META: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  index:              { label: "Panel główny",          icon: "home-outline" },
  "(learn)":          { label: "Materiały do nauki",    icon: "book-outline" },
  tests:              { label: "Centrum testów",        icon: "checkbox-outline" },
  "tests-procedures": { label: "Materiały szkoleniowe", icon: "school-outline" },
}

export default function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const isDark = colorScheme === "dark"
  const insets = useSafeAreaInsets()
  const { state, navigation } = props
  const activeRouteName = state.routes[state.index]?.name

  const cardBg    = isDark ? "#2a2540" : "#ffffff"
  const border    = isDark ? "rgba(255,255,255,0.08)" : "#e8e4f0"
  const iconBg    = isDark ? "rgba(255,255,255,0.07)" : "#f0edf5"
  const textColor = isDark ? "#f1f5f9" : "#18181b"

  return (
    <DrawerContentScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      style={{ borderTopRightRadius: 24, borderBottomRightRadius: 24, overflow: "hidden", backgroundColor: isDark ? "#1e1b2e" : "#ffffff" }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      {/* Logo */}
      <Pressable onPress={() => router.push("/(tabs)")} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginBottom: 8 })}>
        <View style={[styles.card, { backgroundColor: iconBg, borderColor: border }]}>
          <Image
            source={{ uri: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl" }}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={[styles.logoBold, { color: "#18181b" }]}>WOLFMED</Text>
            <Text style={[styles.logoLight, { color: "#6b7280" }]}> EDUKACJA</Text>
          </View>
        </View>
      </Pressable>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#A491BB30" }]} />

      {/* Nav items */}
      <View style={{ flex: 1, marginTop: 4 }}>
        {state.routes.map((route: any) => {
          const meta = ROUTE_META[route.name]
          if (!meta) return null
          const isActive = route.name === activeRouteName
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{ borderRadius: 12 }}
            >
              {({ pressed }) => (
              <View style={[styles.card, { backgroundColor: pressed ? "#A491BB20" : cardBg, borderColor: pressed ? "#A491BB60" : border, marginBottom: 14 }]}>
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                  <Ionicons
                    name={meta.icon}
                    size={22}
                    color={isActive ? "#A491BB" : (isDark ? "rgba(255,255,255,0.5)" : "#4b5563")}
                  />
                </View>
                <Text style={[styles.label, { color: isActive ? "#A491BB" : textColor, fontWeight: isActive ? "700" : "400" }]}>
                  {meta.label}
                </Text>
              </View>
              )}
            </Pressable>
          )
        })}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#A491BB30", marginBottom: 8 }]} />

      {/* O aplikacji */}
      <Pressable onPress={() => {}} style={{ borderRadius: 12 }}>
        {({ pressed }) => (
        <View style={[styles.card, styles.aboutCard, { borderColor: border, backgroundColor: pressed ? "#A491BB30" : "#f0edf5" }]}>
          <View style={styles.aboutIcon}>
            <Ionicons name="information-circle" size={22} color="#ffffff" />
          </View>
          <Text style={[styles.label, { color: textColor }]}>O aplikacji</Text>
        </View>
        )}
      </Pressable>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  logoImg: {
    width: 35,
    height: 35,
  },
  logoBold: {
    fontSize: 22,
    fontFamily: "OpenSans_700Bold",
    lineHeight: 30,
  },
  logoLight: {
    fontSize: 22,
    fontFamily: "OpenSans_400Regular",
    lineHeight: 30,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    borderRadius: 1,
  },
  aboutCard: {
    backgroundColor: "#f0edf5",
  },
  aboutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#A491BB",
    alignItems: "center",
    justifyContent: "center",
  },
})
