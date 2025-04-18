import React, { useRef } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../theme';
import { useDashboardStore, DASHBOARD_SECTIONS, DashboardSection } from '@/store/useDashboardStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.45;
const MINIMIZED_SIZE = CIRCLE_SIZE * 0.65;
const MINIMIZED_OUTER_SIZE = MINIMIZED_SIZE * 0.95;
const INNER_CIRCLE_SIZE = CIRCLE_SIZE * 0.4;
const MINIMIZED_INNER_SIZE = MINIMIZED_SIZE * 0.4;
const ICON_SIZE = 46;
const ICON_SPACING = CIRCLE_SIZE * 0.35;


const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SECTIONS = ['stats', 'actions', 'profile'] as DashboardSection[];

export const DashboardCircle: React.FC = () => {
  const { 
    isCircleExpanded, 
    activeSection,
    isMinimized,
    setActiveSection, 
    toggleCircleExpand,
    toggleMinimized,
  } = useDashboardStore();

  // Shared values for animations
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const elevation = useSharedValue(8);
  const gestureRotation = useSharedValue(0);
  const startRotation = useSharedValue(0);
  const activeColor = useSharedValue(DASHBOARD_SECTIONS[activeSection].color);
  const animationProgress = useSharedValue(0);

  // Add shared values for minimize animation
  const minimizeScale = useSharedValue(1);
  const minimizePosition = useSharedValue({ x: 0, y: 0 });

  // Refs for memoized values
  const sectionsRef = useRef({
    list: SECTIONS,
    count: SECTIONS.length,
    getIndex: (section: DashboardSection) => {
      'worklet';
      return SECTIONS.indexOf(section);
    },
    getSection: (index: number) => {
      'worklet';
      return SECTIONS[((index % SECTIONS.length) + SECTIONS.length) % SECTIONS.length];
    },
  });

  // React to active section changes
  React.useEffect(() => {
    if (activeSection) {
      activeColor.value = DASHBOARD_SECTIONS[activeSection].color;
      animationProgress.value = withSpring(1, {
        damping: 15,
        stiffness: 120,
        mass: 0.5,
      });
      
      if (!isCircleExpanded) {
        const targetRotation = (sectionsRef.current.getIndex(activeSection) * (360 / sectionsRef.current.count));
        gestureRotation.value = withSpring(targetRotation);
      }
    }
    
    return () => {
      animationProgress.value = 0;
    };
  }, [activeSection]);

  // React to expansion state
  React.useEffect(() => {
    if (isCircleExpanded) {
      pulseScale.value = withRepeat(
        withSpring(1.03, { 
          damping: 15,
          stiffness: 120,
          mass: 0.5
        }),
        -1,
        true
      );
      elevation.value = withSpring(10, {
        damping: 15,
        stiffness: 120
      });
    } else {
      pulseScale.value = withSpring(1, {
        damping: 15,
        stiffness: 120
      });
      elevation.value = withSpring(4, {
        damping: 15,
        stiffness: 120
      });
      
      // Reset rotation to match active section
      const targetRotation = (sectionsRef.current.getIndex(activeSection) * (360 / sectionsRef.current.count));
      gestureRotation.value = withSpring(targetRotation);
    }
  }, [isCircleExpanded, activeSection]);

  // React to minimize state
  React.useEffect(() => {
    if (isMinimized) {
      minimizeScale.value = withSpring(MINIMIZED_SIZE / CIRCLE_SIZE, {
        damping: 15,
        stiffness: 120,
      });
      minimizePosition.value = withSpring({
        x: SCREEN_WIDTH - MINIMIZED_SIZE  + 60 - SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT - MINIMIZED_SIZE - 5 - SCREEN_HEIGHT / 2,
      }, {
        damping: 15,
        stiffness: 120,
      });
    } else {
      minimizeScale.value = withSpring(1, {
        damping: 15,
        stiffness: 120,
      });
      minimizePosition.value = withSpring({ x: 0, y: 0 }, {
        damping: 15,
        stiffness: 120,
      });
    }
  }, [isMinimized]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      if (!isMinimized && isCircleExpanded) {
        startRotation.value = gestureRotation.value;
      } else {
        return false; // Cancel gesture if minimized or not expanded
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (!isMinimized && isCircleExpanded) {
        const angle = Math.atan2(
          event.translationY,
          event.translationX
        ) * (180 / Math.PI);
        
        gestureRotation.value = startRotation.value + angle;
      }
    })
    .onEnd(() => {
      'worklet';
      if (!isMinimized && isCircleExpanded) {
        const normalizedRotation = Math.round(gestureRotation.value / (360 / sectionsRef.current.count));
        const newSection = sectionsRef.current.getSection(normalizedRotation);
        
        gestureRotation.value = withSpring(normalizedRotation * (360 / sectionsRef.current.count));
        runOnJS(setActiveSection)(newSection);
      }
    })
    .enabled(isCircleExpanded && !isMinimized);

  const handlePress = () => {
    if (!isMinimized) {
      if (!isCircleExpanded) {
        const normalizedRotation = Math.round(gestureRotation.value / (360 / sectionsRef.current.count));
        const newSection = sectionsRef.current.getSection(normalizedRotation);
        setActiveSection(newSection);
      }
      toggleCircleExpand();
    } else {
      toggleMinimized();
    }
  };

  const handleSectionPress = (section: DashboardSection) => {
    'worklet';
    animationProgress.value = 0;
    activeColor.value = DASHBOARD_SECTIONS[section].color;
    runOnJS(setActiveSection)(section);
  };

  const outerCircleStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(
      animationProgress.value,
      [0, 1],
      [0.15, 0.15]
    );

    return {
      transform: [
        { scale: pulseScale.value },
        { rotate: `${gestureRotation.value}deg` },
      ],
      width: isMinimized ? MINIMIZED_OUTER_SIZE : CIRCLE_SIZE,
      height: isMinimized ? MINIMIZED_OUTER_SIZE : CIRCLE_SIZE,
      borderColor: `${activeColor.value}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      shadowColor: activeColor.value,
      shadowOpacity: interpolate(elevation.value, [4, 10], [0.1, 0.2]),
      shadowRadius: interpolate(elevation.value, [4, 10], [4, 8]),
      elevation: elevation.value,
      borderRadius: isMinimized ? MINIMIZED_OUTER_SIZE / 2 : CIRCLE_SIZE / 2,
    };
  });

  const innerCircleStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(
      animationProgress.value,
      [0, 1],
      [0.15, 0.15]
    );

    const currentInnerSize = isMinimized ? MINIMIZED_INNER_SIZE : INNER_CIRCLE_SIZE;

    return {
      transform: [
        { scale: interpolate(
          pulseScale.value,
          [1, 1.03],
          [1, 0.97],
          Extrapolation.CLAMP
        ) },
      ],
      width: currentInnerSize,
      height: currentInnerSize,
      borderRadius: currentInnerSize / 2,
      backgroundColor: `${activeColor.value}15`,
      borderColor: `${activeColor.value}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: minimizePosition.value.x },
        { translateY: minimizePosition.value.y },
        { scale: minimizeScale.value },
      ],
      position: 'absolute',
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    };
  });

  const handleLongPress = () => {
    if (!isCircleExpanded) {
      toggleMinimized();
    }
  };

  const renderMenuItems = () => {
    return sectionsRef.current.list.map((section, index) => {
      const sectionConfig = DASHBOARD_SECTIONS[section];
      const angle = (360 / sectionsRef.current.count) * index;
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
  };

  return (
    <Animated.View style={containerStyle}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.outerCircle, outerCircleStyle]}>
          {!isMinimized && renderMenuItems()}
        </Animated.View>
      </GestureDetector>
      
      <Pressable 
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <AnimatedBlurView
          intensity={25}
          tint="light"
          style={[styles.innerCircle, innerCircleStyle]}
        >
          <Ionicons
            name={isMinimized ? "expand-outline" : isCircleExpanded ? "close-outline" : "menu-outline"}
            size={isMinimized ? 22 : 24}
            color={DASHBOARD_SECTIONS[activeSection].color}
            style={{ opacity: 0.8 }}
          />
        </AnimatedBlurView>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
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