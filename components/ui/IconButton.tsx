import {
    StyleSheet,
    Pressable,
    GestureResponderEvent,
    GestureResponderHandlers,
    View,
    StyleProp,
    ViewStyle,
  } from 'react-native'
  import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
  import { IconType } from '@/types/chatTypes'
  import * as Haptics from 'expo-haptics'
  
  type IconButtonProps = {
    onPress: (event: GestureResponderEvent) => void
    color: string
    name: IconType
    size?: number
    customStyles?: StyleProp<ViewStyle>
  }
  
  const IconButton = ({ onPress, color, name, size = 24, customStyles }: IconButtonProps) => {
    // custom onPress handler
    const onPressIconButtonHandler = (event: GestureResponderEvent) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      onPress(event)
    }
  
    return (
      <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={onPressIconButtonHandler}>
        <View style={customStyles}>
          {name in MaterialIcons.glyphMap ? (
            <MaterialIcons name={name as keyof typeof MaterialIcons.glyphMap} color={color} size={size} />
          ) : name in Ionicons.glyphMap ? (
            <Ionicons name={name as keyof typeof Ionicons.glyphMap} color={color} size={size} />
          ) : name in MaterialCommunityIcons.glyphMap ? (
            <MaterialCommunityIcons
              name={name as keyof typeof MaterialCommunityIcons.glyphMap}
              color={color}
              size={size}
            />
          ) : null}
        </View>
      </Pressable>
    )
  }
  export default IconButton
  const styles = StyleSheet.create({
    pressed: {
      opacity: 0.7,
    },
  })
  