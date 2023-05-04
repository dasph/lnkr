import { Middleware, Status } from 'oak'

type MiddlewareArgs = Parameters<Middleware>

const secret = Deno.env.get('USER')
if (!secret) throw new Error('no user secret defined')

export const authorize: Middleware = (ctx: MiddlewareArgs[0], next) => {
  const auth = ctx.request.headers.get('authorization')

  ctx.assert(typeof auth === 'string' && auth === secret, Status.Unauthorized)

  return next()
}
