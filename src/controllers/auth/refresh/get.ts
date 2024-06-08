import { type RouterMiddleware, Status } from 'oak'

import type { LocalState } from '~/types/mod.ts'

import { postgres } from '~/middleware/mod.ts'
import { tokenCookies } from '~/helpers/mod.ts'
import { tokens, verify } from '~/services/mod.ts'

type State = {
  tokenId: string
}

type Middleware = RouterMiddleware<'/', Record<string | number | symbol, never>, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = async (ctx: MiddlewareArgs[0], next) => {
  const token = await ctx.cookies.get('refresh-token')
  ctx.assert(token, Status.Unauthorized)

  const payload = await verify(token).catch(() => undefined)
  ctx.assert(payload && payload.sub, Status.Unauthorized)

  const { rowCount } = await postgres.queryObject(`select exists(select 1 from tokens where id = $1)`, [payload.sub])
  ctx.assert(rowCount, Status.Forbidden)

  ctx.state.local = { tokenId: payload.sub }

  return next()
}

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { tokenId } = ctx.state.local

  const cookies = await tokens({ tokenId }).then(tokenCookies)
  await Promise.all(cookies.map((args) => ctx.cookies.set(...args)))

  ctx.response.body = {}
}

export const get = [validator, handler] as const
