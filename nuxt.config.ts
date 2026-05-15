// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@scalar/nuxt'],
  nitro: {
    experimental: {
      openAPI: true // 這是自動讀取 server/api 的關鍵
    }
  },
  imports: {
    dirs: [
      // 讓 Nuxt 自動匯入 schemas 資料夾底下的所有 Schema
      'server/utils/schemas',
      // 或者如果使用了 index.ts，Nuxt 也能正確解析
    ]
  }
})