import { router } from '~/helpers/mod.ts'

import { get } from '~/controllers/alias/get.ts'

export const alias = router()
  .get(':alias', ...get)
