import { z } from 'zod'

export const postSchema = z.object({
  title: z
    .string()
    .min(5, 'Tytuł musi mieć co najmniej 5 znaków')
    .max(200, 'Tytuł może mieć maksymalnie 200 znaków'),
  excerpt: z
    .string()
    .min(10, 'Streszczenie musi mieć co najmniej 10 znaków')
    .max(500, 'Streszczenie może mieć maksymalnie 500 znaków'),
  content: z
    .string()
    .min(20, 'Treść musi mieć co najmniej 20 znaków'),
})

export type PostFormValues = z.infer<typeof postSchema>
