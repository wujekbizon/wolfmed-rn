import React, { useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardStore } from '@/store/useDashboardStore';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../theme';
import { DashboardSection } from '@/constants/dashboardSections';
import { CIRCLE_SIZE, ICON_SIZE, ICON_SPACING, INNER_CIRCLE_SIZE, SECTIONS } from '@/constants/dashboardButton';
import { useDashboardAnimation } from '@/hooks/useDashboardAnimation';
import { useDashboardGesture } from '@/hooks/useDashboardGesture';
import { useDashboardStyles } from '@/hooks/useDashboardStyles';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const DashboardCircle: React.FC = () => {
  const { 
    isCircleExpanded, 
    activeSection,
    isMinimized,
    setActiveSection, 
    toggleCircleExpand,
    toggleMinimized,
    getSectionConfig,
  } = useDashboardStore();

  const {
    pulseScale,
    elevation,
    gestureRotation,
    startRotation,
    activeColor,
    animationProgress,
    minimizeScale,
    minimizePosition,
    updateActiveColor,
    resetAnimationProgress,
  } = useDashboardAnimation(
    isCircleExpanded,
    isMinimized,
    getSectionConfig(activeSection).color
  );

  const { panGesture, handleSectionRotation, getSection } = useDashboardGesture({
    isCircleExpanded,
    isMinimized,
    gestureRotation,
    startRotation,
    setActiveSection,
  });

  const { outerCircleStyle, innerCircleStyle, containerStyle } = useDashboardStyles({
    isMinimized,
    pulseScale,
    gestureRotation,
    activeColor,
    elevation,
    animationProgress,
    minimizePosition,
    minimizeScale,
  });

  const handlePress = useCallback(() => {
    if (!isMinimized) {
      if (!isCircleExpanded) {
        const normalizedRotation = Math.round(gestureRotation.value / (360 / SECTIONS.length));
        const newSection = getSection(normalizedRotation);
        setActiveSection(newSection);
      }
      toggleCircleExpand();
    } else {
      toggleMinimized();
    }
  }, [isMinimized, isCircleExpanded, getSection, setActiveSection, toggleCircleExpand, toggleMinimized, gestureRotation.value]);

  const handleSectionPress = useCallback((section: DashboardSection) => {
    resetAnimationProgress();
    updateActiveColor(getSectionConfig(section).color);
    setActiveSection(section);
    handleSectionRotation(section);
  }, [resetAnimationProgress, updateActiveColor, getSectionConfig, setActiveSection, handleSectionRotation]);

  const renderMenuItems = useCallback(() => {
    return SECTIONS.map((section, index) => {
      const sectionConfig = getSectionConfig(section);
      const angle = (360 / SECTIONS.length) * index;
      const radian = (angle * Math.PI) / 180;
      
      const x = ICON_SPACING * Math.cos(radian);
      const y = ICON_SPACING * Math.sin(radian);

      const isActive = activeSection === section;

      return (
        <Pressable
          key={section}
          style={[
            styles.iconContainer,
            isActive && [styles.activeIcon, { 
              borderColor: `${sectionConfig.color}30`,
              shadowColor: sectionConfig.color,
            }],
            !isActive && {
              opacity: isCircleExpanded ? 0.5 : 0.8,
            },
            {
              transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${angle}deg` },
              ],
            },
          ]}
          onPress={() => handleSectionPress(section)}
        >
          <Ionicons
            name={sectionConfig.icon as any}
            size={28}
            color={isActive ? sectionConfig.color : `${sectionConfig.color}99`}
          />
        </Pressable>
      );
    });
  }, [activeSection, isCircleExpanded, getSectionConfig, handleSectionPress]);

  return (
    <Animated.View style={containerStyle}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.outerCircle, outerCircleStyle]}>
          {!isMinimized && renderMenuItems()}
        </Animated.View>
      </GestureDetector>
      
      <Pressable 
        onPress={handlePress}
      >
        <AnimatedBlurView
          intensity={25}
          tint="light"
          style={[styles.innerCircle, innerCircleStyle]}
        >
          <Ionicons
            name={isMinimized ? "expand-outline" : isCircleExpanded ? "close-outline" : "menu-outline"}
            size={isMinimized ? 44 : 40}
            color={getSectionConfig(activeSection).color}
            style={{ opacity: 0.8 }}
          />
        </AnimatedBlurView>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
  },
  innerCircle: {
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
    borderRadius: INNER_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  iconContainer: {
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIcon: {
    backgroundColor: 'white',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    transform: [{ scale: 1.1 }],
  },
}); 