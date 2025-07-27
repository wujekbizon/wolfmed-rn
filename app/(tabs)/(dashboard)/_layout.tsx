import React from "react";
import { View, useWindowDimensions } from "react-native";
import QuickStats from "@/components/QuickStats";
import QuickActions from "@/components/QuickActions";
import ProfilePreview from "@/components/ProfilePreview";
import HelpInfo from "@/components/HelpInfo";
import NewsFeed from "@/components/NewsFeed";
import { DashboardCircle } from "@/components/DashboardCircle";
import { useDashboardStore } from "@/store/useDashboardStore";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Stack } from "expo-router";

// Component mapping object
const SECTION_COMPONENTS = {
  stats: QuickStats,
  actions: QuickActions,
  profile: ProfilePreview,
  help: HelpInfo,
  news: NewsFeed,
} as const;

export default function DashboardScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { activeSection, getSectionConfig, isMinimized, toggleMinimized } =
    useDashboardStore();

  const renderActiveComponent = () => {
    const activeColor = getSectionConfig(activeSection).color;
    const commonContainerStyle = {
      flex: 1,
    };

    const commonContentStyle = {
      backgroundColor: `${activeColor}15`,
      flex: 1,
    };

    const Component = SECTION_COMPONENTS[activeSection];

    return (
      <Animated.View
        entering={SlideInRight}
        exiting={SlideOutLeft}
        key={activeSection}
        style={commonContainerStyle}
      >
        <BlurView intensity={20} tint="light" style={commonContentStyle}>
          <Component color={activeColor} />
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)" />
    </Stack>
  );
}
