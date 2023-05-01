import { Router } from 'oak'

import { errorHandler } from '~/middleware/mod.ts'
import { getLinkController } from '~/controllers/mod.ts'

export const router = new Router({ strict: true, sensitive: true })
  .use(errorHandler)

  .get('/:alias', ...getLinkController)
