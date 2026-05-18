import type { User } from '../../schemas/users/user'

export async function getUserById(id: string): Promise<User> {
  return {
    id,
    name: 'Bruce',
  }
}