import { Router } from 'oak'

import { errorHandler } from '~/middleware/mod.ts'
import { alias, auth } from '~/controllers/mod.ts'

export const router = new Router({ strict: true, sensitive: true })
  .use(errorHandler)

  .use('/auth', auth.routes(), auth.allowedMethods())
  .use('/', alias.routes(), alias.allowedMethods())
