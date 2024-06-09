import { type RouterMiddleware, Status } from 'oak'

import type { AuthorizedState, Hit, Ip, Link } from '~/types/mod.ts'

import { postgres } from '~/middleware/mod.ts'

type Params = {
  id?: string
}

type State = {
  id?: number
}

type Middleware = RouterMiddleware<'/:id?', Params, AuthorizedState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = (ctx: MiddlewareArgs[0], next) => {
  const { id } = ctx.params

  ctx.assert(typeof id === 'undefined' || (/^\d+$/.test(id) && Number.isInteger(+id)), Status.BadRequest)

  ctx.state.local = { id: typeof id === 'undefined' ? id : +id }

  return next()
}

// TODO: add pagination
const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { user, local: { id: linkId } } = ctx.state

  if (!linkId) {
    const { rows: links } = await postgres.queryObject<Pick<Link, 'id' | 'value' | 'createdAt'>>(`select id, value, "createdAt" from links where "userId" = $1 order by "createdAt" desc`, [user.id])

    return void (ctx.response.body = links)
  }

  const { rows: [link] } = await postgres.queryObject<Pick<Link, 'id' | 'value' | 'createdAt'>>(`select id, value, "createdAt" from links where id = $1 and "userId" = $2`, [linkId, user.id])

  ctx.assert(link, Status.NotFound)

  const { rows: hits } = await postgres.queryObject<Pick<Hit, 'ip' | 'createdAt'> & Pick<Ip, 'contry' | 'location' | 'town'>>(`select hits.ip, hits."createdAt", ips.location, ips.country, ips.town from hits join ips on hits.ip = ips.id where hits.link = $1 order by hits."createdAt" desc`, [linkId])

  ctx.response.body = hits
}

export const get = [validator, handler] as const
