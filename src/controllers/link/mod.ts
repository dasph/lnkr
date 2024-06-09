import { router } from '~/helpers/mod.ts'
import { authorize } from '~/middleware/mod.ts'

import { get } from '~/controllers/link/get.ts'
import { post } from '~/controllers/link/post.ts'

export const link = router()
  .use(authorize)
  .get('/:id?', ...get)
  .post('/', ...post)
