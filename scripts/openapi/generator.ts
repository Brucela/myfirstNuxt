import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, relative, dirname, basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import type { ApiMeta, RouteInfo, ParsedImport } from './types'
import { commonResponses } from './templates'

extendZodWithOpenApi(z)

const __filename = fileURLToPath(import.meta.url)
const projectRoot = resolve(__filename, '../../..')
const apiDir = join(projectRoot, 'server/api')
const outFile = join(projectRoot, 'public/openapi.json')

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

function methodFromFilename(filename: string): string | null {
  const withoutExt = filename.replace(/\.\w+$/, '')
  const parts = withoutExt.split('.')
  if (parts.length < 2) return null
  const method = parts[parts.length - 1].toUpperCase()
  return HTTP_METHODS.includes(method) ? method : null
}

function buildRoutePath(absolutePath: string): string {
  const rel = relative(apiDir, absolutePath)
  const dirPath = dirname(rel)
  const filename = basename(rel)
  const withoutExt = filename.replace(/\.\w+$/, '')
  const parts = withoutExt.split('.')
  const segment = parts.length > 1 ? parts.slice(0, -1).join('.') : parts[0]

  const segments: string[] = []
  if (dirPath !== '.') {
    segments.push(...dirPath.split('/').filter(Boolean))
  }
  if (segment && segment !== 'index') {
    segments.push(segment)
  }

  const openApiPath = segments.map((s) => s.replace(/^\[(.+)\]$/, '{$1}')).join('/')
  return `/api/${openApiPath}`
}

function extractMethod(absolutePath: string): string | null {
  return methodFromFilename(basename(absolutePath))
}

function toRegisterName(importName: string): string {
  if (importName.endsWith('Schema')) return importName.slice(0, -6)
  if (importName.endsWith('Params')) return importName.slice(0, -6)
  if (importName.endsWith('Query')) return importName.slice(0, -5)
  if (importName.endsWith('Body')) return importName.slice(0, -4)
  return importName
}

function parseImports(fileContent: string, fileDir: string): ParsedImport[] {
  const results: ParsedImport[] = []
  const importRegex = /import\s*\{([^}]+)\}\s*from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = importRegex.exec(fileContent)) !== null) {
    const names = match[1].split(',').map((n) => n.trim())
    const source = match[2]
    if (!source.startsWith('..') && !source.startsWith('.')) continue

    let resolvedPath = resolve(fileDir, source)
    if (!extname(resolvedPath)) {
      const tryExts = ['.ts', '.tsx', '.js', '/index.ts', '/index.js']
      const found = tryExts.find((e) => existsSync(resolvedPath + e))
      if (found) resolvedPath += found
    }
    results.push({ source, resolvedPath, names })
  }
  return results
}

function detectUsedSchemas(fileContent: string, candidateNames: string[]): string[] {
  const used: string[] = []
  for (const name of candidateNames) {
    const regex = new RegExp(`\\b${name}\\s*\\.\\s*(?:safeParse|parse)\\s*\\(`)
    if (regex.test(fileContent)) {
      used.push(name)
    }
  }
  if (used.length === 0) return candidateNames
  return used
}

function extractApiMeta(fileContent: string): Partial<ApiMeta> {
  const meta: Partial<ApiMeta> = {}
  const blockRegex = /\/\*\s*api-gen\s*\*\/[\s\S]*?export\s+const\s+apiMeta\s*=\s*(\{[\s\S]*?\})\s*(?:as\s+const)?\s*[\s\S]*?\/\*\s*end-api-gen\s*\*\//
  const blockMatch = fileContent.match(blockRegex)
  if (!blockMatch) return meta

  const objStr = blockMatch[1]
  const tagsMatch = objStr.match(/tags\s*:\s*\[([^\]]*)\]/)
  if (tagsMatch) {
    meta.tags = tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, '')).filter(Boolean)
  }
  const summaryMatch = objStr.match(/summary\s*:\s*['"]([^'"]+)['"]/)
  if (summaryMatch) meta.summary = summaryMatch[1]
  const descMatch = objStr.match(/description\s*:\s*['"]([^'"]+)['"]/)
  if (descMatch) meta.description = descMatch[1]
  const respDescMatch = objStr.match(/responseDescription\s*:\s*['"]([^'"]+)['"]/)
  if (respDescMatch) meta.responseDescription = respDescMatch[1]
  const codeMatch = objStr.match(/responseCode\s*:\s*(\d+)/)
  if (codeMatch) meta.responseCode = parseInt(codeMatch[1], 10)
  return meta
}

function scanDirectory(dir: string, results: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      scanDirectory(fullPath, results)
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(fullPath)
    }
  }
  return results
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Scanning routes...\n')

  const allFiles = scanDirectory(apiDir)
  const routeFiles = allFiles.filter((f) => {
    if (extractMethod(f) === null) return false
    const rel = relative(apiDir, f)
    if (basename(f).startsWith('_') || rel.includes('/_')) return false
    if (basename(f).startsWith('openapi.')) return false
    return true
  })

  if (routeFiles.length === 0) {
    console.log('  No route files found.')
    return
  }

  const routes: RouteInfo[] = []
  const allSchemaModules = new Map<string, Set<string>>()

  for (const filePath of routeFiles) {
    const filename = basename(filePath)
    const fileDir = dirname(filePath)
    const content = readFileSync(filePath, 'utf-8')
    const method = extractMethod(filePath)!
    const path = buildRoutePath(filePath)
    const meta = extractApiMeta(content)

    const imports = parseImports(content, fileDir)
    const zodImports: string[] = []
    for (const imp of imports) {
      for (const name of imp.names) {
        if (
          name.endsWith('Schema') ||
          name.endsWith('Params') ||
          name.endsWith('Query') ||
          name.endsWith('Body')
        ) {
          zodImports.push(name)
          if (!allSchemaModules.has(imp.resolvedPath)) {
            allSchemaModules.set(imp.resolvedPath, new Set())
          }
          allSchemaModules.get(imp.resolvedPath)!.add(name)
        }
      }
    }

    const usedSchemas = detectUsedSchemas(content, zodImports)

    routes.push({
      method,
      path,
      filePath,
      tags: meta.tags ?? [],
      summary: meta.summary ?? filename.replace(/\.\w+$/, '').replace('.', ' '),
      description: meta.description ?? '',
      responseDescription: meta.responseDescription ?? 'Successful response',
      responseCode: meta.responseCode ?? 200,
      zodImports,
      usedRequestSchemas: usedSchemas,
    })
  }

  console.log('📦 Registering Zod schemas...')
  const registry = new OpenAPIRegistry()
  const schemaMap = new Map<string, z.ZodType>()

  for (const [resolvedPath, schemaNames] of allSchemaModules) {
    console.log(`  Loading schemas from ${relative(projectRoot, resolvedPath)}`)
    if (!existsSync(resolvedPath)) continue

    try {
      const mod = await import(resolvedPath)
      for (const name of [...schemaNames]) {
        const schema = mod[name]
        if (schema instanceof z.ZodType) {
          const key = toRegisterName(name)
          registry.register(key, schema)
          schemaMap.set(key, schema)
        }
      }
    } catch (err) {
      console.warn(`  ⚠  Failed to import ${resolvedPath}: ${err}`)
    }
  }

  console.log('\n📝 Registering paths...')
  for (const route of routes) {
    const methodLC = route.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'
    const bodyMethods = new Set(['post', 'put', 'patch'])

    const pathConfig: Record<string, unknown> = {
      method: methodLC,
      path: route.path,
      summary: route.summary,
    }

    if (route.tags.length > 0) pathConfig.tags = route.tags
    if (route.description) pathConfig.description = route.description

    // Attach request schemas
    if (route.usedRequestSchemas.length > 0) {
      const request: Record<string, unknown> = {}

      for (const schemaName of route.usedRequestSchemas) {
        const key = toRegisterName(schemaName)
        const zodSchema = schemaMap.get(key)
        if (!zodSchema) {
          console.warn(`  ⚠  Schema "${key}" not found for ${route.method} ${route.path}`)
          continue
        }

        const isParamsSchema = schemaName.includes('Params') || schemaName.includes('Query')

        if (bodyMethods.has(methodLC)) {
          request.body = {
            content: {
              'application/json': { schema: zodSchema },
            },
          }
        } else if (methodLC === 'get' && isParamsSchema) {
          request.params = zodSchema
        }
      }

      if (Object.keys(request).length > 0) {
        pathConfig.request = request
      }
    }

    // Build responses
    const responses: Record<string, unknown> = {
      [route.responseCode]: {
        description: route.responseDescription,
      },
    }
    for (const [code, resp] of Object.entries(commonResponses)) {
      responses[code] = resp
    }
    pathConfig.responses = responses

    registry.registerPath(pathConfig)
  }

  console.log('\n⚙️  Generating OpenAPI document...')
  const generator = new OpenApiGeneratorV3(registry.definitions)

  const port = process.env.NUXT_PORT || '3005'

  const document = generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Nuxt 4 API',
      version: '1.0.0',
      description: 'Auto-generated API documentation.',
    },
    servers: [{ url: `http://localhost:${port}` }],
  })

  writeFileSync(outFile, JSON.stringify(document, null, 2), 'utf-8')

  const routeSummary = routes
    .map((r) => `  ${r.method.padEnd(7)} ${r.path.padEnd(40)} ${r.summary}`)
    .join('\n')

  console.log(`\n✅ OpenAPI spec written to public/openapi.json\n`)
  console.log(`Routes (${routes.length}):`)
  console.log(routeSummary)
}

main().catch((err) => {
  console.error('❌ Generator failed:', err)
  process.exit(1)
})
