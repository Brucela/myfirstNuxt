/**
 * Minimal metadata you write in each route file.
 * The generator auto-detects everything else (method, path, Zod schemas).
 *
 * Usage in route files:
 *
 * ```ts
 * /* api-gen *\/
 * export const apiMeta = {
 *   tags: ['Users'],
 *   summary: 'Get user by ID',
 *   description: 'Returns a single user by their unique identifier.',
 * } as const
 * /* end-api-gen *\/
 * ```
 */
export interface ApiMeta {
  /** OpenAPI tags for grouping endpoints. e.g. ['Users'] */
  tags?: string[]
  /** Short summary of what this endpoint does. */
  summary?: string
  /** Longer description. Supports Markdown. */
  description?: string
  /**
   * Override the default 200 response description.
   * Default: 'Successful response'
   */
  responseDescription?: string
  /**
   * Override default 200 response code (e.g. 201 for creation).
   * Default: 200
   */
  responseCode?: number
}

export interface RouteInfo {
  method: string
  path: string
  filePath: string
  tags: string[]
  summary: string
  description: string
  responseDescription: string
  responseCode: number
  /** Zod schema names imported from project schemas */
  zodImports: string[]
  /** Schema names used in .parse() / .safeParse() calls */
  usedRequestSchemas: string[]
}

export interface ParsedImport {
  /** Original import source path (relative to the route file) */
  source: string
  /** Resolved absolute path */
  resolvedPath: string
  /** Named imports (the variable names) */
  names: string[]
}
