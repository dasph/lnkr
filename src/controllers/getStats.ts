import { RouterMiddleware, Status } from 'oak'

import type { LocalState } from '~/types/mod.ts'

import { createTable } from '~/helpers/mod.ts'
import { collection, getCount, getDocs, limit, query, where } from '~/middleware/mod.ts'

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

export const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { days } = ctx.state.local
  const from = new Date(Date.now() - days * 8.64e7)

  const { docs: linkDocs } = await getDocs(query(collection('links'), limit(16)))

  const links = linkDocs.map((doc) => ({ ref: doc.ref, alias: doc.data().alias }))

  const counts = await Promise.all(links.map(async ({ alias, ref }) => {
    const snapshot = await getCount(query(collection('hits'), where('link', '==', ref), where('createdAt', '>', from)))

    return ({ alias, count: snapshot.data().count })
  }))

  const totalCount = counts.reduce((ctx, curr) => ctx + curr.count, 0)
  const extCounts = counts.map((data) => ({ ...data, percent: `${~~(data.count / totalCount * 100)}%` }))

  ctx.response.body = createTable(extCounts)
}

export const getStatsController = [validator, handler] as const
