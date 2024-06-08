import { router } from '~/helpers/mod.ts'

import { get } from '~/controllers/auth/signout/get.ts'

export const signout = router()
  .get('/', ...get)
