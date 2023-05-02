import { HttpError, Middleware, STATUS_TEXT, Status } from 'oak'

export const errorHandler: Middleware = ({ response }, next) => next().catch((err) => {
  response.body = { error: err instanceof HttpError ? err.message : STATUS_TEXT[Status.InternalServerError] }
})
