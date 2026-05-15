// server/controllers/user.controller.ts
import type { H3Event } from 'h3'

export const UserController = {
  async getById(event: H3Event) {
    // Nuxt 會自動將 [id] 放入 event.context.params.id
    const id = event.context.params?.id

    // 驗證參數是否存在
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing user ID'
      })
    }

    // 模擬從資料庫查詢資料
    // const user = await db.user.findUnique({ where: { id } })

    return {
      success: true,
      data: {
        id: id,
        name: `User_${id}`,
        email: `user${id}@example.com`
      }
    }
  }
}
