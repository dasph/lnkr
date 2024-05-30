import { Application } from 'oak'
import { oakCors as cors } from 'cors'

import { router } from '~/router.ts'

const port = +`${Deno.env.get('PORT')}`
if (!port) throw new Error('no application port defined')

new Application()
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())

  .listen({ port })

console.log(`🚀 lnkr is listeling on port ${port}`)
