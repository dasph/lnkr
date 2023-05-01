import { RouterMiddleware, Status } from 'oak'

import { compressIP } from '~/helpers/mod.ts'
import { addDocument, collection, getDocs, limit, query, where } from '~/middleware/mod.ts'

type Params = {
  alias: string
}

type Middleware = RouterMiddleware<'/:alias', Params>

const handler: Middleware = async (ctx) => {
  const { alias } = ctx.params

  const res = await getDocs(query(collection('links'), where('alias', '==', alias), limit(1)))
  if (res.empty) return ctx.throw(Status.NotFound)

  const [link] = res.docs
  const { value } = link.data()

  const hit = { ip: compressIP(ctx.request.ip), link: link.ref, createdAt: new Date() }

  addDocument<'hits'>(hit, 'hits').catch((error) => console.error(`⚠️ Unhandled error: ${error}`))

  ctx.response.redirect(value)
}

export const getLinkController = [handler] as const
