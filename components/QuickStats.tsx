import React from "react"
import { View, Text, StyleSheet, useColorScheme } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@clerk/expo"
import CircularProgress from "react-native-circular-progress-indicator"
import { LoadingSpinner } from "./LoadingSpinner"
import { useUserProfile } from "@/hooks/useUserProfile"

const PRIMARY = "#A491BB"
const PRIMARY_LIGHT = "#c4b5d4"
const PRIMARY_SOFT = "#A491BB18"
const SHADOW_COLOR = "#280652"

export default function QuickStats() {
  const { userId } = useAuth()
  const { userProfile, isLoading } = useUserProfile(userId ?? undefined)
  const isDark = useColorScheme() === "dark"

  const scorePercent =
    userProfile && userProfile.totalQuestions > 0
      ? Math.round((userProfile.totalScore / userProfile.totalQuestions) * 100)
      : 0

  const testsAttempted = userProfile?.testsAttempted ?? 0
  const totalQuestions = userProfile?.totalQuestions ?? 0

  const gradeLabel =
    scorePercent >= 90 ? "Doskonały" :
    scorePercent >= 70 ? "Dobry" :
    scorePercent >= 50 ? "Zaliczony" :
    testsAttempted === 0 ? "Brak danych" : "Do poprawy"

  const textPrimary = isDark ? "#f1f5f9" : "#1e1b4b"
  const textSecondary = isDark ? "#94a3b8" : "#6b7280"
  const cardBg = isDark ? "#1e1b2e" : "#ffffff"
  const smallCardBg = isDark ? "#1e1b2e" : "#ffffff"

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: textPrimary }]}>Twoje Statystyki</Text>

      <LoadingSpinner isLoading={isLoading} />

      {/* Hero card */}
      <LinearGradient
        colors={[PRIMARY, PRIMARY_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>Średni wynik</Text>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>{gradeLabel}</Text>
          </View>
          <Text style={styles.heroSub}>
            {testsAttempted > 0
              ? `z ${testsAttempted} ${testsAttempted === 1 ? "testu" : "testów"}`
              : "Zacznij swój pierwszy test"}
          </Text>
        </View>
        <View style={styles.heroRight}>
          <CircularProgress
            value={scorePercent}
            radius={55}
            activeStrokeColor="#ffffff"
            inActiveStrokeColor="rgba(255,255,255,0.25)"
            activeStrokeWidth={8}
            inActiveStrokeWidth={8}
            progressValueColor="#ffffff"
            progressValueFontSize={18}
            valueSuffix="%"
            duration={800}
          />
        </View>
      </LinearGradient>

      {/* Two small cards */}
      <View style={styles.row}>
        <View style={[styles.smallCard, { backgroundColor: smallCardBg }]}>
          <View style={[styles.smallIcon, { backgroundColor: PRIMARY_SOFT }]}>
            <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
          </View>
          <Text style={[styles.smallValue, { color: textPrimary }]}>{testsAttempted}</Text>
          <Text style={[styles.smallLabel, { color: textSecondary }]}>Ukończone testy</Text>
        </View>

        <View style={[styles.smallCard, { backgroundColor: smallCardBg }]}>
          <View style={[styles.smallIcon, { backgroundColor: PRIMARY_SOFT }]}>
            <Ionicons name="help-circle" size={22} color={PRIMARY} />
          </View>
          <Text style={[styles.smallValue, { color: textPrimary }]}>{totalQuestions}</Text>
          <Text style={[styles.smallLabel, { color: textSecondary }]}>Pytania odpowiedziane</Text>
        </View>
      </View>

      {/* Score breakdown bar */}
      {testsAttempted > 0 && (
        <View style={[styles.breakdownCard, { backgroundColor: cardBg }]}>
          <View style={styles.breakdownHeader}>
            <Ionicons name="stats-chart" size={18} color={PRIMARY} />
            <Text style={[styles.breakdownTitle, { color: textPrimary }]}>Postęp</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${scorePercent}%` }]} />
          </View>
          <View style={styles.breakdownFooter}>
            <Text style={[styles.breakdownSub, { color: textSecondary }]}>
              {userProfile?.totalScore ?? 0} poprawnych / {totalQuestions} pytań
            </Text>
            <Text style={[styles.breakdownPercent, { color: PRIMARY }]}>{scorePercent}%</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroLeft: {
    flex: 1,
    gap: 6,
  },
  heroLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  gradeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  gradeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  heroRight: {
    marginLeft: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  smallCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  smallIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  smallValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  breakdownCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#28065218",
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  breakdownFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownSub: {
    fontSize: 12,
  },
  breakdownPercent: {
    fontSize: 14,
    fontWeight: "700",
  },
})
