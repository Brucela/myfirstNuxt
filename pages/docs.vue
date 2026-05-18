<template>
  <ClientOnly>
    <ApiReference :configuration="config" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ApiReference } from '@scalar/api-reference'
import '@scalar/api-reference/style.css'

const config = {
  url: '/openapi.json',
}
</script>
