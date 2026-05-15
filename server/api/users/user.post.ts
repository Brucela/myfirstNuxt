// server/api/user.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. 後端 Zod 驗證
  const result = userSchema.safeParse(body)

  // 2. 驗證失敗處理
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      // 將 Zod 格式化後的錯誤訊息（欄位名稱: 錯誤原因）塞入 data
      data: result.error.flatten().fieldErrors, 
    })
  }

  // 3. 驗證成功，繼續處理業務邏輯 (例如存入資料庫)
  const validatedData = result.data
  
  return {
    success: true,
    message: '資料儲存成功！',
    user: validatedData
  }
})
