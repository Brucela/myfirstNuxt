import { getRouterParam, createError } from 'h3'
import { UserIdParamsSchema } from '../../schemas/users/user'
import { getUserById } from '../../services/users/user'

/* api-gen */
export const apiMeta = {
  tags: ['Users'],
  summary: 'Get user by ID',
} as const
/* end-api-gen */

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const parsed = UserIdParamsSchema.safeParse({ id })

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id',
    })
  }

  return await getUserById(parsed.data.id)
})