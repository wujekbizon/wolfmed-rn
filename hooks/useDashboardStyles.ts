import { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { SharedValue } from 'react-native-reanimated';
import {
  CIRCLE_SIZE,
  MINIMIZED_OUTER_SIZE,
  INNER_CIRCLE_SIZE,
  MINIMIZED_INNER_SIZE,
} from '@/constants/dashboardButton';

interface StylesProps {
  isMinimized: boolean;
  pulseScale: SharedValue<number>;
  gestureRotation: SharedValue<number>;
  activeColor: SharedValue<string>;
  elevation: SharedValue<number>;
  animationProgress: SharedValue<number>;
  minimizePosition: SharedValue<{ x: number; y: number }>;
  minimizeScale: SharedValue<number>;
}

export const useDashboardStyles = ({
  isMinimized,
  pulseScale,
  gestureRotation,
  activeColor,
  elevation,
  animationProgress,
  minimizePosition,
  minimizeScale,
}: StylesProps) => {
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

  return {
    outerCircleStyle,
    innerCircleStyle,
    containerStyle,
  };
}; 