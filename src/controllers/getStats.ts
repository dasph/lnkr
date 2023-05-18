import { RouterMiddleware, Status } from 'oak'

type Middleware = RouterMiddleware<'/stats'>

export const handler: Middleware = (ctx) => {
  ctx.response.status = Status.OK
}

export const getStatsController = [handler] as const
