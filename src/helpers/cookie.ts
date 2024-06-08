import type { SecureCookieMap, SecureCookieMapSetDeleteOptions } from 'oak/deps'

import type { Tokens } from '~/types/mod.ts'

import { tokenExpiration, rpID, tokens } from '~/consts/mod.ts'

type Entry = Parameters<SecureCookieMap['set']>

type TokenCookies = (props?: Tokens) => Entry[]

export const tokenCookies: TokenCookies = (props) => {
  const common: SecureCookieMapSetDeleteOptions = { overwrite: true, domain: `.${rpID}` }

  return tokens.map<Entry>((token) => ([
    `${token}-token`,
    props?.[token] || null,
    { ...common, httpOnly: token === 'refresh', ...props && { maxAge: tokenExpiration[token] } }
  ]))
}
