/**
 * Shared OpenAPI response templates.
 * These are merged into every endpoint automatically — no need to duplicate.
 */
export const commonResponses: Record<string, { description: string }> = {
  '400': { description: 'Bad Request — Invalid request parameters or body' },
  '401': { description: 'Unauthorized — Authentication token is missing or invalid' },
  '403': { description: 'Forbidden — You do not have permission to access this resource' },
  '404': { description: 'Not Found — The requested resource could not be found' },
  '429': { description: 'Too Many Requests — Rate limit exceeded' },
  '500': { description: 'Internal Server Error — Something went wrong on our end' },
}
