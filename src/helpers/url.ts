export const isHttpUrl = (input: string): boolean => {
  try {
    const { protocol } = new URL(input)
    return ['http:', 'https:'].includes(protocol)
  } catch (_) { return false }
}
