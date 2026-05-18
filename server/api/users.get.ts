import { UserSchema } from '../schemas/users/user'

/* api-gen */
export const apiMeta = {
  tags: ['Users'],
  summary: 'Get all users',
} as const
/* end-api-gen */

export default defineEventHandler(() => {
  return UserSchema.parse({
    id: '1',
    name: 'Bruce',
  })
})