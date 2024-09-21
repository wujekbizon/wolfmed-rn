import { StyleSheet, View, ColorSchemeName } from 'react-native'

export const Divider = ({ colorScheme }: { colorScheme: ColorSchemeName }) => (
  <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444' : '#CCC' }]} />
)

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 10,
  },
})
