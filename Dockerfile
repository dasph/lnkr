FROM denoland/deno:alpine-1.44.0 as cache

WORKDIR /app

COPY deno.json map.json deps.ts .

RUN deno cache deps.ts

FROM denoland/deno:alpine-1.44.0 as build

WORKDIR /app

COPY src ./src
COPY --from=cache /deno-dir /deno-dir
COPY --from=cache /app/deno.json /app/map.json /app/deno.lock .

RUN deno task build

FROM alpine

WORKDIR /app

ARG RP
ARG PORT
ARG AUTHORIZATION

ENV LD_LIBRARY_PATH=/usr/local/lib RP=${RP} PORT=${PORT} AUTHORIZATION=${AUTHORIZATION}

COPY --from=build /app/dist .

COPY --from=build --chown=root:root --chmod=755 /lib /lib
COPY --from=build --chown=root:root --chmod=755 /lib64 /lib64
COPY --from=build --chown=root:root --chmod=755 /usr/local/lib /usr/local/lib

CMD ./lnkr
