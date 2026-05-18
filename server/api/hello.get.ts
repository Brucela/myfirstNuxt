/* api-gen */
export const apiMeta = {
  tags: ['System'],
  summary: 'Health check endpoint',
} as const
/* end-api-gen */

export default defineEventHandler(() => {
  return {
    message: 'hello'
  }
})