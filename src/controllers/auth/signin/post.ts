import type { AuthenticationResponseJSON } from 'simplewebauthn/types'

import { RouterMiddleware, Status } from 'oak'
import { verifyAuthenticationResponse } from 'simplewebauthn/server'

import type { LocalState, AuthPayload } from '~/types/mod.ts'

import { redis } from '~/middleware/mod.ts'
import { queryAuthenticator, signin } from '~/services/mod.ts'
import { expectedOrigin, rpID as expectedRPID } from '~/consts/mod.ts'

type State = {
  expectedChallenge: string
  response: AuthenticationResponseJSON
}

type Middleware = RouterMiddleware<'/', Record<string | number | symbol, never>, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = async (ctx: MiddlewareArgs[0], next) => {
  const body: AuthPayload<AuthenticationResponseJSON> | undefined = await ctx.request.body.json().catch(() => undefined)

  ctx.assert(typeof body === 'object' && body !== null, Status.BadRequest, 'Missing body')

  const { key, payload } = body

  ctx.assert(key, Status.BadRequest, 'Missing key')
  ctx.assert(payload, Status.BadRequest, 'Missing authentication payload')

  const expectedChallenge = await redis.get(`signin-challenge-${key}`)
  ctx.assert(expectedChallenge, Status.NotFound, 'Challenge key not found')

  ctx.state.local = { expectedChallenge, response: payload }

  return next()
}

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { expectedChallenge, response } = ctx.state.local
  const id = response.id

  const authenticator = await queryAuthenticator({ id })
  ctx.assert(authenticator, Status.NotFound, 'Passkey not found')

  const { verified, authenticationInfo } = await verifyAuthenticationResponse({ authenticator, expectedChallenge, expectedOrigin, expectedRPID, response })
  ctx.assert(authenticationInfo, Status.Conflict, 'Failed to verify the authentication')

  signin({ id, counter: BigInt(authenticationInfo.newCounter) })

  ctx.response.body = { verified }
}

export const post = [validator, handler] as const
