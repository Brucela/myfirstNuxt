// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@scalar/nuxt'],
  nitro: {
    experimental: {
      openAPI: true // 這是自動讀取 server/api 的關鍵
    }
  }
})