import { HttpError, Middleware } from 'oak'

export const requestHandler: Middleware = ({ response }, next) => next().then(() => {
  response.status === 404 && (response.body = { error: 'not found.' })
})

export const errorHandler: Middleware = ({ response }, next) => next().catch((err) => {
  response.body = { error: err instanceof HttpError ? err.message : 'something went wrong.' }
})
