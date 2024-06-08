import type { RouterMiddleware } from 'oak'

import { tokenCookies } from '~/helpers/mod.ts'

type Middleware = RouterMiddleware<'/'>
type MiddlewareArgs = Parameters<Middleware>

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  await Promise.all(tokenCookies().map((args) => ctx.cookies.set(...args)))

  ctx.response.body = {}
}

export const get = [handler] as const
