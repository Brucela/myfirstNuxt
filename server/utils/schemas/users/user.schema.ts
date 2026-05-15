import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(1, '請輸入姓名'),
  email: z.string().email('Email 格式不正確'),
})