import { type Context, Status } from 'oak'

import type { AuthorizedState } from '~/types/mod.ts'

import { verify } from '~/services/mod.ts'

export const authorize = async (ctx: Context<AuthorizedState>, next: () => Promise<unknown>) => {
  const token = await ctx.cookies.get('access-token')
  ctx.assert(token, Status.Unauthorized)

  const payload = await verify(token).catch(() => undefined)
  ctx.assert(payload && payload.sub && payload.name, Status.Unauthorized)

  ctx.state.user = { id: payload.sub, name: `${payload.name}` }

  return next()
}
