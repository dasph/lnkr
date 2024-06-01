import { RouterMiddleware, Status } from 'oak'

import type { Link, LocalState } from '~/types/mod.ts'

import { hit } from '~/services/mod.ts'
import { decode65 } from '~/helpers/mod.ts'
import { postgres } from '~/middleware/mod.ts'

type Params = {
  alias: string
}

type State = {
  id: number
}

type Middleware = RouterMiddleware<':alias', Params, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = (ctx: MiddlewareArgs[0], next) => {
  const { alias } = ctx.params

  const id = decode65(alias)
  ctx.assert(Number.isInteger(id), Status.BadRequest, 'Invalid alias')

  ctx.state.local = { id }

  return next()
}

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { id } = ctx.state.local

  const { rows: [link] } = await postgres.queryObject<Pick<Link, 'id' | 'value'>>(`select id, value from links where id = $1`, [id])

  ctx.assert(link, Status.NotFound)

  const [ip] = ctx.request.headers.get('x-forwarded-for')?.split(',').map((value) => value.trim()) || [ctx.request.ip]

  hit({ ip, linkId: link.id })

  ctx.response.redirect(decodeURI(atob(link.value)))
}

export const get = [validator, handler] as const
