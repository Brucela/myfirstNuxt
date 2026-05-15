import type { EventHandler, EventHandlerRequest } from 'h3'

export const withAuth = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    // 這裡放你的 Middleware 邏輯
    const auth = getRequestHeader(event, 'authorization')
    
    if (!auth) {
      throw createError({ statusCode: 401, message: '請先登入' })
    }

    // 邏輯通過後，才執行原本的 handler
    return await handler(event)
  })