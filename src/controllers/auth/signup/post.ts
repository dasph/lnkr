import type { RegistrationResponseJSON } from 'simplewebauthn/types'

import { type RouterMiddleware, Status } from 'oak'
import { verifyRegistrationResponse } from 'simplewebauthn/server'

import type { LocalState, AuthPayload } from '~/types/mod.ts'

import { signup } from '~/services/mod.ts'
import { redis } from '~/middleware/mod.ts'
import { expectedOrigin, rpID as expectedRPID } from '~/consts/mod.ts'

type State = {
  name: string
  expectedChallenge: string
  response: RegistrationResponseJSON
}

type Middleware = RouterMiddleware<'/', Record<string | number | symbol, never>, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = async (ctx: MiddlewareArgs[0], next) => {
  const body: AuthPayload<RegistrationResponseJSON> | undefined = await ctx.request.body.json().catch(() => undefined)

  ctx.assert(typeof body === 'object' && body !== null, Status.BadRequest, 'Missing body')

  const { key, payload } = body

  ctx.assert(key, Status.BadRequest, 'Missing key')
  ctx.assert(payload, Status.BadRequest, 'Missing registration payload')

  const challenge = await redis.get(`signup-challenge-${key}`)
  ctx.assert(challenge, Status.NotFound, 'Challenge key not found')

  const [expectedChallenge, name] = JSON.parse(challenge)

  ctx.state.local = { name, expectedChallenge, response: payload }

  return next()
}

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { name, expectedChallenge, response } = ctx.state.local

  const { verified, registrationInfo } = await verifyRegistrationResponse({ response, expectedRPID, expectedOrigin, expectedChallenge })

  ctx.assert(registrationInfo, Status.Conflict, 'Failed to verify the registration')

  await signup({ name, registrationInfo, response: response.response })

  ctx.response.body = { verified }
}

export const post = [validator, handler] as const
