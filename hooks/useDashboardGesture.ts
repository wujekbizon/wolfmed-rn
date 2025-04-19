import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { SharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { DashboardSection } from '@/constants/dashboardSections';
import { SECTIONS } from '@/constants/dashboardButton';

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
  const getSection = useCallback((index: number): DashboardSection => {
    'worklet';
    return SECTIONS[((index % SECTIONS.length) + SECTIONS.length) % SECTIONS.length];
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      if (!isMinimized && isCircleExpanded) {
        startRotation.value = gestureRotation.value;
        return true;
      }
      return false;
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
      gestureRotation.value = withSpring(sectionIndex * (360 / SECTIONS.length));
    }
  }, [gestureRotation]);

  return {
    panGesture,
    handleSectionRotation,
    getSection,
  };
}; 