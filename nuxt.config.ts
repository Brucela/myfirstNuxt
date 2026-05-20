import pkg from './package.json'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@scalar/nuxt'],

  scalar: {
    url: '/api/openapi',
    darkMode: true,
    metaData: {
      title: 'Nuxt 4 API',
    },
  },

  imports: {
    dirs: ['server/utils'],
  },
  // 將版本號注入到 runtimeConfig
  runtimeConfig: {
    public: {
      appVersion: pkg.version
    }
  },
})
