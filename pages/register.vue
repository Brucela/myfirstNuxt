<!-- pages/register.vue -->
<script setup lang="ts">
// 綁定表單資料
const formData = ref({
  name: '',
  email: '',
})

// 儲存錯誤訊息的物件
const errors = ref<Record<string, string[]>>({})
const apiMessage = ref('')

const handleSubmit = async () => {
  // 每次重試先清空錯誤
  errors.value = {}
  apiMessage.value = ''

  // 【步驟 1】前端先行驗證 (選用，但建議)
  const clientCheck = userSchema.safeParse(formData.value)
  if (!clientCheck.success) {
    errors.value = clientCheck.error.flatten().fieldErrors
    return // 阻斷發送 API
  }

  // 【步驟 2】前端驗證過關，呼叫 API
  try {
    const data = await $fetch('/api/users/user', {
      method: 'POST',
      body: formData.value,
    })
    
    apiMessage.value = data.message
    // 成功後清空表單
    formData.value = { name: '', email: '' }
  } catch (error: any) {
    // 【步驟 3】捕捉後端回傳的 400 驗證錯誤
    if (error.statusCode === 400 && error.data?.data) {
      // 將後端傳回的 Zod fieldErrors 塞回前端畫面
      errors.value = error.data.data
    } else {
      apiMessage.value = error.statusMessage || '伺服器發生錯誤'
    }
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-4">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 欄位：姓名 -->
      <div>
        <label class="block">姓名：</label>
        <input v-model="formData.name" type="text" class="border p-2 w-full" />
        <p v-if="errors.name" class="text-red-500 text-sm">{{ errors.name[0] }}</p>
      </div>

      <!-- 欄位：Email -->
      <div>
        <label class="block">Email：</label>
        <input v-model="formData.email" type="text" class="border p-2 w-full" />
        <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email[0] }}</p>
      </div>

      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
        送出資料
      </button>
    </form>

    <p v-if="apiMessage" class="mt-4 text-green-600 font-bold">{{ apiMessage }}</p>
  </div>
</template>