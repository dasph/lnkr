import { RouterMiddleware, Status } from 'oak'

import type { LocalState } from '~/types/mod.ts'

type Params = {
  days?: string
}

type State = {
  days: number
}

type Middleware = RouterMiddleware<'/stats/:days?', Params, LocalState<State>>
type MiddlewareArgs = Parameters<Middleware>

const validator: Middleware = (ctx: MiddlewareArgs[0], next) => {
  const days = +(ctx.params.days || 7)

  ctx.assert(Number.isInteger(days), Status.BadRequest, 'Days should have an integer value')
  ctx.assert(days > 0, Status.BadRequest, 'Days should have a positive value')
  ctx.assert(days < 8, Status.BadRequest, 'Days value can not exceed 7')

  ctx.state.local = { days }

  return next()
}

export const handler: Middleware = (ctx: MiddlewareArgs[0]) => {
  const { days } = ctx.state.local

  ctx.response.status = Status.OK
}

export const getStatsController = [validator, handler] as const
