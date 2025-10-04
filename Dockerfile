FROM denoland/deno:alpine-2.5.2 AS deno
FROM golang:1.25-alpine3.22 AS goose

WORKDIR /app

RUN apk add --no-cache git upx && \
    git clone --depth 1 https://github.com/pressly/goose . && \
    go mod tidy && \
    go build \
      -ldflags="-s -w" \
      -tags="no_clickhouse no_libsql no_mssql no_mysql no_sqlite3 no_vertica no_ydb" \
      -o goose ./cmd/goose && \
    upx --best --lzma ./goose

FROM deno AS cache

WORKDIR /app

COPY deno.json deps.ts .

RUN deno cache deps.ts

FROM deno AS build

WORKDIR /app

COPY src ./src
COPY --from=cache /deno-dir /deno-dir
COPY --from=cache /app/deno.json /app/deno.lock .

RUN deno task build

FROM alpine

WORKDIR /app

ARG RP
ARG PORT

ENV LD_LIBRARY_PATH=/usr/local/lib RP=${RP} PORT=${PORT}

COPY --from=goose /app/goose /app/goose

COPY --from=cache --chown=root:root --chmod=755 /lib /lib
COPY --from=cache --chown=root:root --chmod=755 /lib64 /lib64
COPY --from=cache --chown=root:root --chmod=755 /usr/local/lib /usr/local/lib

COPY ./migrations /app/migrations

COPY --from=build /app/dist .

CMD ./goose -dir "./migrations" postgres "$POSTGRES" up && ./lnkr || sleep 60
