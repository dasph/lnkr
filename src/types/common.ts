import type { User } from '~/types/postgres.ts'

import { tokens } from '~/consts/mod.ts'

export type Tokens = Record<typeof tokens[number], string>

export type LocalState <T> = { local: T }

export type AuthorizedState <T = unknown> = LocalState<T> & { user: Pick<User, 'id' | 'name'> }

export type AuthPayload <T> = {
  payload: T
  key: string
}
