import React, { useLayoutEffect } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import ProcedureContent from '@/components/ProcedureContent'
import proceduresData from '@/data/procedures.json'
import { Procedure } from '@/types/dataTypes'
import CustomHeader from '@/components/ui/CustomHeader'

export default function ProcedureDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const procedure: Procedure = proceduresData[Number(id)]
  
  if (!navigation || !procedure?.data?.name) return;

  useLayoutEffect(() => {
    if (procedure?.data?.name) {
      navigation.setOptions({
        header: () => (
          <CustomHeader
          />
        ),
      })
    }
  }, [procedure])

  return (
    <View className='flex-1 p-4'>
      <ProcedureContent procedure={procedure} />
    </View>
  )
}
