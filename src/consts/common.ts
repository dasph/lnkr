export const tokens = ['access', 'refresh'] as const

export const tokenExpiration: Record<typeof tokens[number], number> = {
  access: 60 * 5,
  refresh: 60 * 60 * 24 * 7
}
