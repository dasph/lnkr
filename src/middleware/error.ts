import { HttpError, Middleware, Response, STATUS_TEXT, Status } from 'oak'

const { assign } = Object

const props = (status: Status, error = STATUS_TEXT[status]): Partial<Response> => ({ status, body: { error } })

const digest = (error: unknown): [Status, string?] => error instanceof HttpError ? [error.status, error.message] : [Status.InternalServerError]

export const errorHandler: Middleware = ({ response }, next) => next().catch((error) => void assign(response, props(...digest(error))))
