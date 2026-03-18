import { Platform } from 'react-native'

const DEV_API_ANDROID = 'http://10.0.2.2:5000/api'  // Android emulator → host machine
const DEV_API_IOS     = 'http://localhost:5000/api'   // iOS simulator → host machine
const PROD_API        = 'https://wolfmed-api.azurewebsites.net/api'

export const API_BASE = __DEV__
  ? Platform.OS === 'android' ? DEV_API_ANDROID : DEV_API_IOS
  : PROD_API
