import { getNumericDate, create as baseCreate, verify as baseVerify, type VerifyOptions, type Payload } from 'djwt'

import type { Token, Tokens, User } from '~/types/mod.ts'

import { postgres } from '~/middleware/mod.ts'
import { tokenExpiration } from '~/consts/mod.ts'

type IssueProps = { userId: string }
type RefreshProps = { tokenId: string }

type TokensProps = {
  name: string
  userId: string
  tokenId: string
}

const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-512' }, true, ['sign', 'verify'])

export const create = (payload: Payload): Promise<string> => baseCreate({ alg: 'HS512', typ: 'JWT' }, { ...payload }, key)

export const verify = <T extends Payload> (jwt: string, options?: VerifyOptions): Promise<T> => baseVerify<T>(jwt, key, options)

export const issue = ({ userId }: IssueProps): Promise<TokensProps> => Promise.all([
  postgres.queryObject<Pick<Token, 'id'>>(`insert into tokens ("userId") values ($1) returning id`, [userId]),
  postgres.queryObject<Pick<User, 'name'>>(`select name from users where id = $1`, [userId])
]).then(([{ rows: [{ id: tokenId }] }, { rows: [{ name }] }]) => ({ name, tokenId, userId }))

export const refresh = ({ tokenId }: RefreshProps): Promise<TokensProps> => Promise.all([
  postgres.queryObject<Pick<User, 'id' | 'name'>>(`select users.id, users.name from users join tokens on users.id = tokens."userId" where tokens.id = $1 limit 1`, [tokenId]),
  postgres.queryObject(`update tokens set "lastUsedAt" = $1 where id = $2`, [new Date(), tokenId])
]).then(([{ rows: [{ name, id: userId }] }]) => ({ name, tokenId, userId }))

export const tokens = async (props: IssueProps | RefreshProps): Promise<Tokens> => {
  const { name, tokenId, userId } = await ('userId' in props ? issue(props) : refresh(props))

  return Promise.all([
    create({ sub: tokenId, exp: getNumericDate(tokenExpiration.access) }),
    create({ sub: userId, name, exp: getNumericDate(tokenExpiration.refresh) })
  ]).then(([refresh, access]) => ({ refresh, access }))
}
