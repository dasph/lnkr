import type { VerifiedRegistrationResponse, AuthenticatorAttestationResponseJSON } from 'simplewebauthn'

import type { Passkey, User } from '~/types/mod.ts'

import { postgres } from '~/middleware/mod.ts'

type SigninProps = {
  id: string
  counter: bigint
}

type SignupProps = {
  name: string
  response: AuthenticatorAttestationResponseJSON
  credential: Required<VerifiedRegistrationResponse>['registrationInfo']['credential']
}

export const signin = async ({ counter, id }: SigninProps): Promise<string> => {
  const { rows: [{ userId }] } = await postgres.queryObject<Pick<Passkey, 'userId'>>(`update passkeys set counter = $1, "lastUsedAt" = $2 where id = $3 returning "userId"`, [counter, new Date(), id])

  return userId
}

export const signup = async ({ name, response, credential: { counter, id, publicKey } }: SignupProps): Promise<string> => {
  const transports = response.transports?.join(',') || ''

  const { rows: [{ id: userId }] } = await postgres.queryObject<Pick<User, 'id'>>(`insert into users (name) values ($1) returning id`, [name])

  await postgres.queryObject(`insert into passkeys (id, key, counter, transports, "userId") values ($1, $2, $3, $4, $5)`, [id, publicKey, counter, transports, userId])

  return userId
}
