import { type RouterMiddleware, Status } from 'oak'

import type { AuthorizedState } from '~/types/mod.ts'

import { verify } from '~/services/mod.ts'

// TODO: fix route value
type Middleware = RouterMiddleware<'', Record<never, never>, AuthorizedState>
type MiddlewareArgs = Parameters<Middleware>

export const authorize: Middleware = async (ctx: MiddlewareArgs[0], next) => {
  const token = await ctx.cookies.get('access-token')
  ctx.assert(token, Status.Unauthorized)

  const payload = await verify(token).catch(() => undefined)
  ctx.assert(payload && payload.sub && payload.name, Status.Unauthorized)

  ctx.state.user = { id: payload.sub, name: `${payload.name}` }

  return next()
}
