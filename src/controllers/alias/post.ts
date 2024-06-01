import { RouterMiddleware, Status } from 'oak'

import type { LocalState, User } from '~/types/mod.ts'

import { tagLink } from '~/services/mod.ts'
import { postgres } from '~/middleware/mod.ts'
import { encode65, isHttpUrl, radix65 } from '~/helpers/mod.ts'

type State = {
  value: string
  tags: string[]
}

type Middleware = RouterMiddleware<'', Record<never, never>, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = async (ctx: MiddlewareArgs[0], next) => {
  const form: unknown = await ctx.request.body.json().catch(() => undefined)

  ctx.assert(typeof form === 'object' && form !== null, Status.BadRequest, 'Missing payload')

  ctx.assert('value' in form && typeof form.value === 'string', Status.NotAcceptable, 'Missing string property: value')
  ctx.assert(isHttpUrl(form.value), Status.NotAcceptable, 'Faulty string property: value - has to be an URL')

  const value = btoa(encodeURI(form.value))

  ctx.assert(value.length < 513, Status.RequestURITooLong, 'Faulty string property: value - too long')

  ctx.assert('tags' in form && Array.isArray(form.tags) && form.tags.length < 17 && form.tags.every((tag) => typeof tag === 'string' && /^[A-Za-z0-9\-_@]{1,32}$/.test(tag)), Status.NotAcceptable, 'Faulty property: tags')

  ctx.state.local = { value, tags: form.tags }

  return next()
}

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { value, tags } = ctx.state.local

  const [linkId] = crypto.getRandomValues(new Uint32Array(1)).map((value) => (value >>> 2) + radix65 ** 4)

  const { rows: [user] } = await postgres.queryObject<Pick<User, 'id'>>(`select id from users where true limit 1`)

  ctx.assert(user, Status.NotFound, 'No available user')

  await postgres.queryObject(`insert into links (id, value, "userId") values ($1, $2, $3)`, [linkId, value, user.id])

  tagLink({ linkId, tags, userId: user.id })

  ctx.response.body = { alias: encode65(linkId) }
}

export const post = [validator, handler] as const
