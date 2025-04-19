import { useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import {
  useSharedValue,
  withSpring,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { CIRCLE_SIZE, MINIMIZED_SIZE } from '@/constants/dashboardButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
};

export const useDashboardAnimation = (
  isCircleExpanded: boolean,
  isMinimized: boolean,
  initialColor: string
) => {
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const elevation = useSharedValue(8);
  const gestureRotation = useSharedValue(0);
  const startRotation = useSharedValue(0);
  const activeColor = useSharedValue(initialColor);
  const animationProgress = useSharedValue(0);
  const minimizeScale = useSharedValue(1);
  const minimizePosition = useSharedValue({ x: 0, y: 0 });

  // Handle expansion animation
  useEffect(() => {
    if (isCircleExpanded) {
      pulseScale.value = withRepeat(
        withSpring(1.03, { 
          ...SPRING_CONFIG,
          mass: 0.5
        }),
        -1,
        true
      );
      elevation.value = withSpring(10, SPRING_CONFIG);
    } else {
      pulseScale.value = withSpring(1, SPRING_CONFIG);
      elevation.value = withSpring(4, SPRING_CONFIG);
    }
  }, [isCircleExpanded]);

  // Handle minimize animation
  useEffect(() => {
    if (isMinimized) {
      minimizeScale.value = withSpring(MINIMIZED_SIZE / CIRCLE_SIZE, SPRING_CONFIG);
      minimizePosition.value = withSpring({
        x: SCREEN_WIDTH - MINIMIZED_SIZE + 75 - SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT - MINIMIZED_SIZE + 10 - SCREEN_HEIGHT / 2,
      }, SPRING_CONFIG);
    } else {
      minimizeScale.value = withSpring(1, SPRING_CONFIG);
      minimizePosition.value = withSpring({ x: 0, y: 0 }, SPRING_CONFIG);
    }
  }, [isMinimized]);

  const updateActiveColor = useCallback((newColor: string) => {
    'worklet';
    activeColor.value = newColor;
    animationProgress.value = withSpring(1, {
      ...SPRING_CONFIG,
      mass: 0.5,
    });
  }, []);

  const resetAnimationProgress = useCallback(() => {
    'worklet';
    animationProgress.value = 0;
  }, []);

  return {
    rotation,
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
  };
}; 