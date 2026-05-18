import { CreateUserSchema } from '../../schemas/users/user'

/* api-gen */
export const apiMeta = {
  tags: ['Users'],
  summary: 'Create a new user',
  responseDescription: 'User created successfully',
  responseCode: 201,
} as const
/* end-api-gen */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = CreateUserSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: result.error.flatten().fieldErrors,
    })
  }

  const validatedData = result.data

  return {
    success: true,
    message: '資料儲存成功！',
    user: validatedData,
  }
})
