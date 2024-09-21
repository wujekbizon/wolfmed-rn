import { ActivityIndicator, View, StyleSheet } from 'react-native'

export const LoadingSpinner = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#ff9be8" />
    </View>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
})
