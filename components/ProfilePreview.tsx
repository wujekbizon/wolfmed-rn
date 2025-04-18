import { View, Text, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

interface ProfilePreviewProps {
  color?: string;
}

export default function ProfilePreview({ color = '#f58a8a' }: ProfilePreviewProps) {
  // TODO: Replace with actual user data
  const user = {
    username: 'User123',
    motto: 'Learning every day',
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color,
        }}>
          {user.username}
        </Text>
        <Link href="/profile" asChild>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ 
              marginRight: 4,
              fontSize: 14,
              color,
            }}>
              Edytuj profil
            </Text>
            <Ionicons name="chevron-forward" size={16} color={color} />
          </Pressable>
        </Link>
      </View>
      
      <Text style={{
        fontSize: 14,
        color: `${color}99`,
        fontStyle: 'italic',
      }}>
        "{user.motto}"
      </Text>
    </View>
  )
} 