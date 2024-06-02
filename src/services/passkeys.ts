import { AuthenticatorDevice, AuthenticatorTransportFuture } from 'simplewebauthn/types'

import type { Passkey } from '~/types/mod.ts'

import { postgres } from '~/middleware/mod.ts'

type AuthenticatorProps = {
  id: string
}

export const queryAuthenticator = async ({ id } : AuthenticatorProps): Promise<AuthenticatorDevice | undefined> => {
  const { rows: [passkey] } = await postgres.queryObject<Pick<Passkey, 'key' | 'counter' | 'transports'>>(`select key, counter, transports from passkeys where id = $1`, [id])
  if (!passkey) return

  const transports = passkey.transports.split(',').filter((value): value is AuthenticatorTransportFuture => !!value)

  return { transports, credentialID: id, credentialPublicKey: passkey.key, counter: Number(passkey.counter) }
}
