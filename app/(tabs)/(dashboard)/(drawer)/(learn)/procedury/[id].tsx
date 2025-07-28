import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import ProcedureContent from '@/components/ProcedureContent'
import proceduresData from '@/data/procedures.json'
import { Procedure } from '@/types/dataTypes'

export default function ProcedureDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const procedure: Procedure = proceduresData[Number(id)]

  // Dynamically set the header title and styles
  useEffect(() => {
    if (procedure?.data?.name) {
      navigation.setOptions({
        title: procedure.data.name,
        headerStyle: {
          backgroundColor: '#ffc5c5', // Light red background
          borderBottomWidth: 2, // Add a border
          borderBottomColor: '#f58a8a', // Border color
        },
        headerTitleStyle: {
          fontWeight: 'bold', // Make the title bold
          color: '#333', // Dark text color
        },
        headerTintColor: '#333', // Color of the back button and other icons
      })
    }
  }, [procedure])

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ProcedureContent procedure={procedure} />
    </View>
  )
}
