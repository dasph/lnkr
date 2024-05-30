import { router } from '~/helpers/mod.ts'

import { get } from '~/controllers/auth/signup/get.ts'
import { post } from '~/controllers/auth/signup/post.ts'

export const signup = router()
  .get('/', ...get)
  .post('/', ...post)
