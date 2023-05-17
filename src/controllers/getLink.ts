import { RouterMiddleware, Status } from 'oak'

import { compressIP } from '~/helpers/mod.ts'
import { addDocument, collection, getDocs, limit, query, where } from '~/middleware/mod.ts'

type Params = {
  alias: string
}

type Middleware = RouterMiddleware<'/:alias', Params>
type MiddlewareArgs = Parameters<Middleware>

const handler: Middleware = async (ctx: MiddlewareArgs[0]) => {
  const { alias } = ctx.params

  const res = await getDocs(query(collection('links'), where('alias', '==', alias), limit(1)))
  ctx.assert(!res.empty, Status.NotFound)

  const [link] = res.docs
  const { value } = link.data()

  const [forwarded] = ctx.request.headers.get('x-forwarded-for')?.split(',').map((value) => value.trim()) || []
  const ip = compressIP(forwarded || ctx.request.ip)

  const hit = { ip, link: link.ref, createdAt: new Date() }

  addDocument<'hits'>(hit, 'hits').catch((error) => console.error(`⚠️ Unhandled error: ${error}`))

  ctx.response.redirect(value)
}

export const getLinkController = [handler] as const
