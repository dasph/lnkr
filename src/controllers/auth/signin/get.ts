import type { RouterMiddleware } from 'oak'
import type { PublicKeyCredentialRequestOptionsJSON } from 'simplewebauthn/types'

import { generateAuthenticationOptions } from 'simplewebauthn'

import type { AuthPayload } from '~/types/mod.ts'

import { rpID } from '~/consts/mod.ts'
import { redis } from '~/middleware/mod.ts'
import { randomBase64 } from '~/helpers/mod.ts'

type Middleware = RouterMiddleware<'/'>
type MiddlewareArgs = Parameters<Middleware>

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const key = randomBase64(24)

  const payload = await generateAuthenticationOptions({ rpID })

  await redis.setex(`signin-challenge-${key}`, 60, payload.challenge)

  const response: AuthPayload<PublicKeyCredentialRequestOptionsJSON> = { key, payload }

  ctx.response.body = response
}

export const get = [handler] as const
