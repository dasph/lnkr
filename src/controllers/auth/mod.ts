import { router } from '~/helpers/mod.ts'

import { signin } from '~/controllers/auth/signin/mod.ts'
import { signup } from '~/controllers/auth/signup/mod.ts'

export const auth = router()
  .use('/signin', signin.routes(), signin.allowedMethods())
  .use('/signup', signup.routes(), signup.allowedMethods())
