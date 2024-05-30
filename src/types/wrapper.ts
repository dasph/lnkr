export type LocalState <T> = { local: T }

export type AuthPayload <T> = {
  payload: T
  key: string
}
