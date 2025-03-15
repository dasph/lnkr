import { RouterMiddleware, Status } from 'oak'
import { verifyAuthenticationResponse, type  AuthenticationResponseJSON} from 'simplewebauthn'

import type { LocalState, AuthPayload } from '~/types/mod.ts'

import { redis } from '~/middleware/mod.ts'
import { tokenCookies } from '~/helpers/mod.ts'
import { queryAuthenticator, signin, tokens } from '~/services/mod.ts'
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

  const credential = await queryAuthenticator({ id })
  ctx.assert(credential, Status.NotFound, 'Passkey not found')

  const { verified, authenticationInfo } = await verifyAuthenticationResponse({ credential, expectedChallenge, expectedOrigin, expectedRPID, response })
  ctx.assert(authenticationInfo, Status.Conflict, 'Failed to verify the authentication')

  const userId = await signin({ id, counter: BigInt(authenticationInfo.newCounter) })

  const cookies = await tokens({ userId }).then(tokenCookies)
  await Promise.all(cookies.map((args) => ctx.cookies.set(...args)))

  ctx.response.body = { verified }
}

export const post = [validator, handler] as const
