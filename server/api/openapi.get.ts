import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const openapiPath = resolve(
  fileURLToPath(import.meta.url),
  '../../../public/openapi.json',
)
const openapiJson = JSON.parse(readFileSync(openapiPath, 'utf-8'))

export default defineEventHandler(() => {
  return openapiJson
})