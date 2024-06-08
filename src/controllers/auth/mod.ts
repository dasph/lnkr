import { router } from '~/helpers/mod.ts'

import { signin } from '~/controllers/auth/signin/mod.ts'
import { signup } from '~/controllers/auth/signup/mod.ts'
import { signout } from '~/controllers/auth/signout/mod.ts'
import { refresh } from '~/controllers/auth/refresh/mod.ts'

export const auth = router()
  .use('/signin', signin.routes(), signin.allowedMethods())
  .use('/signup', signup.routes(), signup.allowedMethods())
  .use('/signout', signout.routes(), signout.allowedMethods())
  .use('/refresh', refresh.routes(), refresh.allowedMethods())
