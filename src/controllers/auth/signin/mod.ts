import { router } from '~/helpers/mod.ts'

import { get } from '~/controllers/auth/signin/get.ts'
import { post } from '~/controllers/auth/signin/post.ts'

export const signin = router()
  .get('/', ...get)
  .post('/', ...post)
