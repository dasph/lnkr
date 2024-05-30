import { Router } from 'oak'

import { authorize, errorHandler } from '~/middleware/mod.ts'
import { auth, createLinkController, getLinkController, getStatsController } from '~/controllers/mod.ts'

export const router = new Router({ strict: true, sensitive: true })
  .use(errorHandler)

  .use('/auth', auth.routes(), auth.allowedMethods())

  .post('/', authorize, ...createLinkController)

  .get('/stats/:days?', authorize, ...getStatsController)

  .get('/:alias', ...getLinkController)
