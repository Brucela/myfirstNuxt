<script setup lang="ts">
import { CreateUserSchema } from '~/server/schemas/users/user'

const formData = ref({
  name: '',
  email: '',
})

const errors = ref<Record<string, string[]>>({})
const apiMessage = ref('')

const handleSubmit = async () => {
  errors.value = {}
  apiMessage.value = ''

  // 前端 Zod 驗證（與後端共用同一份 Schema）
  const clientCheck = CreateUserSchema.safeParse(formData.value)
  if (!clientCheck.success) {
    errors.value = clientCheck.error.flatten().fieldErrors
    return
  }

  try {
    const data = await $fetch('/api/users/user', {
      method: 'POST',
      body: formData.value,
    })

    apiMessage.value = data.message
    formData.value = { name: '', email: '' }
  } catch (error: any) {
    if (error.statusCode === 400 && error.data?.data) {
      errors.value = error.data.data
    } else {
      apiMessage.value = error.statusMessage || '伺服器發生錯誤'
    }
  }
}

const config = useRuntimeConfig()
const version = config.public.appVersion // 這裡就會拿到 "1.2.3"
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
  <footer>目前版本：v{{ version }}</footer>
</template>
