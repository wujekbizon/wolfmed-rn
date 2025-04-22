import * as z from 'zod'

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Nazwa musi mieć co najmniej 3 znaki')
    .max(16, 'Nazwa nie może być dłuższa niż 16 znaków')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nazwa może zawierać tylko litery, cyfry i podkreślenia')
})

export const mottoSchema = z.object({
  motto: z
    .string()
    .min(3, 'Motto musi mieć co najmniej 3 znaki')
    .max(30, 'Motto nie może być dłuższe niż 30 znaków')
})

export type UsernameFormData = z.infer<typeof usernameSchema>
export type MottoFormData = z.infer<typeof mottoSchema>

export const validateUsername = (username: string) => {
  try {
    usernameSchema.parse({ username })
    return { isValid: true, error: null }
  } catch (error: any) {
    return { 
      isValid: false, 
      error: error.errors[0]?.message || 'Nieprawidłowa nazwa użytkownika'
    }
  }
}

export const validateMotto = (motto: string) => {
  try {
    mottoSchema.parse({ motto })
    return { isValid: true, error: null }
  } catch (error: any) {
    return { 
      isValid: false, 
      error: error.errors[0]?.message || 'Nieprawidłowe motto'
    }
  }
} 