import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const UserIdParamsSchema = z.object({
  id: z.string().openapi({ example: '123' }),
})

export const UserSchema = z.object({
  id: z.string().openapi({ example: '1' }),
  name: z.string().openapi({ example: 'Bruce' }),
})

export type User = z.infer<typeof UserSchema>

export const CreateUserSchema = z.object({
  name: z.string().min(2, '姓名至少需要 2 個字符').openapi({ example: 'AliceWang' }),
  email: z.string().email('請輸入有效的 Email').openapi({ example: 'alice@example.com' }),
})