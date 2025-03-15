import { type RouterMiddleware, Status } from 'oak'
import { verifyRegistrationResponse, type RegistrationResponseJSON } from 'simplewebauthn'

import type { LocalState, AuthPayload } from '~/types/mod.ts'

import { redis } from '~/middleware/mod.ts'
import { tokenCookies } from '~/helpers/mod.ts'
import { signup, tokens } from '~/services/mod.ts'
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

  const { verified, registrationInfo: { credential } = {} } = await verifyRegistrationResponse({ response, expectedRPID, expectedOrigin, expectedChallenge })

  ctx.assert(credential, Status.Conflict, 'Failed to verify the registration')

  const userId = await signup({ name, credential, response: response.response })

  const cookies = await tokens({ userId }).then(tokenCookies)
  await Promise.all(cookies.map((args) => ctx.cookies.set(...args)))

  ctx.response.body = { verified }
}

export const post = [validator, handler] as const
