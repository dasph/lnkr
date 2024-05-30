import { Router, type RouterOptions, type State } from 'oak'

export const router = <T extends State = Record<string, unknown>> (opts?: RouterOptions) => new Router<T>({ ...opts, sensitive: true })
