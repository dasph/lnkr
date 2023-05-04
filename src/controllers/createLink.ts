import { RouterMiddleware, Status } from 'oak'

import type { LocalState } from '~/types/mod.ts'

import { addDocument } from '~/middleware/mod.ts'
import { getRef, getUniqueAlias } from '~/services/mod.ts'

type State = {
  ref: string
  value: string
}

type Middleware = RouterMiddleware<'/', Record<never, never>, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = async (ctx: MiddlewareArgs[0], next) => {
  const form: unknown = await ctx.request.body({ type: 'json', limit: 1024 }).value

  ctx.assert(typeof form === 'object' && form !== null, Status.BadRequest, 'Missing payload')

  ctx.assert('ref' in form && typeof form.ref === 'string', Status.NotAcceptable, 'Missing string property: ref')
  ctx.assert('value' in form && typeof form.value === 'string', Status.NotAcceptable, 'Missing string property: value')

  const { ref, value } = form
  ctx.state.local = { ref, value }

  return next()
}

export const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { value, ref: name } = ctx.state.local

  const [ref, alias] = await Promise.all([getRef(name), getUniqueAlias()])

  ctx.assert(ref.id, Status.InternalServerError, 'Failed to obtain a referer')
  ctx.assert(alias, Status.InternalServerError, 'Failed to create a unique alias')

  const doc = await addDocument<'links'>({ value, ref, alias, createdAt: new Date() }, 'links')

  ctx.assert(doc.id, Status.InternalServerError, 'Failed to create an entry')

  ctx.response.body = { alias }
}

export const createLinkController = [validator, handler] as const
