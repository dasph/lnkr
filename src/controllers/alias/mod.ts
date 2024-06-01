import { router } from '~/helpers/mod.ts'
import { authorize } from '~/middleware/mod.ts'

import { get } from '~/controllers/alias/get.ts'
import { post } from '~/controllers/alias/post.ts'

export const alias = router()
  .get(':alias', ...get)
  .post('', authorize, ...post)
