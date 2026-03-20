import React, { forwardRef } from 'react'
import { TextInput, TextInputProps } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useAuthAnimations } from '@/hooks/useAuthAnimations'
import { cn } from '@/lib/utils'

interface AnimatedAuthInputProps extends TextInputProps {
  isDark: boolean
  hasError?: boolean
  inputKey: 'email' | 'password' | 'code'
  delay?: number
}

const AnimatedAuthInput = React.memo(forwardRef<TextInput, AnimatedAuthInputProps>(({
  isDark,
  hasError,
  inputKey,
  delay = 0,
  style,
  className,
  ...props
}, ref) => {
  const {
    emailInputStyle,
    passwordInputStyle,
    handleFocus,
    handleBlur,
  } = useAuthAnimations()

  const getInputStyle = () => {
    return inputKey === 'email' ? emailInputStyle : inputKey === 'password' ? passwordInputStyle : emailInputStyle
  }

  return (
    <Animated.View entering={FadeInDown.delay(delay)}>
      <Animated.View style={getInputStyle()}>
        <TextInput
          ref={ref}
          className={cn(
            "rounded-xl p-4 text-base border",
            isDark ? "text-white" : "text-[#111]",
            "backdrop-blur-md",
            hasError && "border-red-500",
            className
          )}
          style={[
            {
              borderColor: hasError 
                ? '#ef4444' 
                : isDark 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(0,0,0,0.1)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
            style
          ]}
          onFocus={() => handleFocus(inputKey)}
          onBlur={() => handleBlur(inputKey)}
          {...props}
        />
      </Animated.View>
    </Animated.View>
  )
}))
AnimatedAuthInput.displayName = 'AnimatedAuthInput';
export default AnimatedAuthInput;