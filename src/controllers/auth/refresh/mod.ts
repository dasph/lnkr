import { router } from '~/helpers/mod.ts'

import { get } from '~/controllers/auth/refresh/get.ts'

export const refresh = router()
  .get('/', ...get)
