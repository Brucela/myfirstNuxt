// server/api/users/[id].get.ts
import { UserController } from '../../controllers/user/user.controller'

export default withAuth(defineEventHandler((event) => {
  return UserController.getById(event)
}))
