import { z } from 'zod'

export const contactSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Nieprawidłowy adres email'),
  message: z.string().min(10, 'Wiadomość musi mieć co najmniej 10 znaków'),
})

export type ContactFormData = z.infer<typeof contactSchema>
