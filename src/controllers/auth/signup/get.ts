import type { PublicKeyCredentialCreationOptionsJSON } from 'simplewebauthn/types'

import { type RouterMiddleware, Status } from 'oak'
import { generateRegistrationOptions } from 'simplewebauthn/server'

import type { LocalState, AuthPayload } from '~/types/mod.ts'

import { redis } from '~/middleware/mod.ts'
import { rpID, rpName } from '~/consts/mod.ts'
import { randomBase64 } from '~/helpers/mod.ts'

type State = {
  name: string
}

type Middleware = RouterMiddleware<'/', Record<string | number | symbol, never>, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = (ctx: MiddlewareArgs[0], next) => {
  const name = ctx.request.headers.get('name')

  ctx.assert(name, Status.BadRequest, 'Missing header: name')
  ctx.assert(name.length < 65, Status.BadRequest, 'Name is too long')

  ctx.state.local = { name }

  return next()
}

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { name } = ctx.state.local

  const key = randomBase64(24)

  const payload = await generateRegistrationOptions({ rpName, rpID, userName: decodeURIComponent(atob(name)) })

  await redis.setex(`signup-challenge-${key}`, 60, JSON.stringify([payload.challenge, name]))

  const response: AuthPayload<PublicKeyCredentialCreationOptionsJSON> = { key, payload }

  ctx.response.body = response
}

export const get = [validator, handler] as const
