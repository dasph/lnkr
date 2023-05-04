import { Status } from 'https://deno.land/std@0.183.0/http/http_status.ts'
import { Middleware } from 'oak'

type MiddlewareArgs = Parameters<Middleware>

const secret = Deno.env.get('USER')
if (!secret) throw new Error('no user secret defined')

export const authorize: Middleware = (ctx: MiddlewareArgs[0], next) => {
  const auth = ctx.request.headers.get('authorization')

  ctx.assert(typeof auth === 'string' && auth === secret, Status.Unauthorized)

  return next()
}
