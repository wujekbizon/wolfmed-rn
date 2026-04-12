import * as z from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Nieprawidłowy adres email'),
  password: z
    .string()
    .min(1, 'Hasło jest wymagane')
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
})

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Nieprawidłowy adres email'),
  password: z
    .string()
    .min(1, 'Hasło jest wymagane')
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Hasło musi zawierać co najmniej jedną wielką literę, jedną małą literę, jedną cyfrę i jeden znak specjalny'
    ),
  code: z
    .string()
    .min(1, 'Kod weryfikacyjny jest wymagany')
    .length(6, 'Kod weryfikacyjny musi mieć 6 znaków')
    .optional()
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema> 