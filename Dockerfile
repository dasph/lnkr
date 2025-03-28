FROM alpine AS init

WORKDIR /app

COPY compose.yaml init-db.sh .

RUN tar -czf init.tar.gz *

FROM denoland/deno:alpine-2.2.4 AS cache

WORKDIR /app

COPY deno.json deps.ts .

RUN deno cache deps.ts

FROM denoland/deno:alpine-2.2.4 AS build

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

COPY --from=init /app/init.tar.gz .

COPY --from=cache --chown=root:root --chmod=755 /lib /lib
COPY --from=cache --chown=root:root --chmod=755 /lib64 /lib64
COPY --from=cache --chown=root:root --chmod=755 /usr/local/lib /usr/local/lib

COPY --from=build /app/dist .

CMD ./lnkr
