import { Router } from 'oak'

import { errorHandler } from '~/middleware/mod.ts'
import { alias, auth, link } from '~/controllers/mod.ts'

export const router = new Router({ strict: true, sensitive: true })
  .use(errorHandler)

  .use('/auth', auth.routes(), auth.allowedMethods())
  .use('/link', link.routes(), link.allowedMethods())
  .use('/', alias.routes(), alias.allowedMethods())
