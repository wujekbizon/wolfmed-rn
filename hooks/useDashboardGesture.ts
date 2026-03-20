import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { SharedValue, useSharedValue, withSpring, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { DashboardSection } from '@/constants/dashboardSections';
import { SECTIONS, CIRCLE_SIZE } from '@/constants/dashboardButton';

interface GestureProps {
  isCircleExpanded: boolean;
  isMinimized: boolean;
  gestureRotation: SharedValue<number>;
  startRotation: SharedValue<number>;
  setActiveSection: (section: DashboardSection) => void;
}

export const useDashboardGesture = ({
  isCircleExpanded,
  isMinimized,
  gestureRotation,
  startRotation,
  setActiveSection,
}: GestureProps) => {
  const lastAngle = useSharedValue(0);
  const center = CIRCLE_SIZE / 2;

  const getSection = useCallback((index: number): DashboardSection => {
    'worklet';
    return SECTIONS[((index % SECTIONS.length) + SECTIONS.length) % SECTIONS.length];
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      'worklet';
      if (!isMinimized && isCircleExpanded) {
        cancelAnimation(gestureRotation);
        startRotation.value = gestureRotation.value;
        lastAngle.value = Math.atan2(event.y - center, event.x - center) * (180 / Math.PI);
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (!isMinimized && isCircleExpanded) {
        const currentAngle = Math.atan2(event.y - center, event.x - center) * (180 / Math.PI);
        let delta = currentAngle - lastAngle.value;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        gestureRotation.value += delta;
        lastAngle.value = currentAngle;
      }
    })
    .onEnd(() => {
      'worklet';
      if (!isMinimized && isCircleExpanded) {
        const normalizedRotation = Math.round(gestureRotation.value / (360 / SECTIONS.length));
        const newSection = getSection(normalizedRotation);
        
        gestureRotation.value = withSpring(normalizedRotation * (360 / SECTIONS.length));
        runOnJS(setActiveSection)(newSection);
      }
    })
    .enabled(isCircleExpanded && !isMinimized);

  const handleSectionRotation = useCallback((section: DashboardSection) => {
    'worklet';
    const sectionIndex = SECTIONS.indexOf(section);
    if (sectionIndex !== -1) {
      const targetAngle = sectionIndex * (360 / SECTIONS.length);
      const currentAngle = ((gestureRotation.value % 360) + 360) % 360;
      let delta = targetAngle - currentAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      gestureRotation.value = withSpring(gestureRotation.value + delta);
    }
  }, [gestureRotation]);

  return {
    panGesture,
    handleSectionRotation,
    getSection,
  };
}; 