import { Router } from 'oak'

import { authorize, errorHandler } from '~/middleware/mod.ts'
import { createLinkController, getLinkController, getStatsController } from '~/controllers/mod.ts'

export const router = new Router({ strict: true, sensitive: true })
  .use(errorHandler)

  .post('/', authorize, ...createLinkController)

  .get('/:alias', ...getLinkController)
  .get('/stats/:days?', ...getStatsController)
