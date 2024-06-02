FROM denoland/deno:alpine-1.44.0 as cache

WORKDIR /app
COPY deps.ts map.json deno.json deno.lock ./

RUN deno cache deps.ts

FROM denoland/deno:alpine-1.44.0 as build

WORKDIR /app
COPY . /app

COPY --from=cache /deno-dir /deno-dir

RUN deno task build

FROM alpine

COPY --from=build --chown=root:root --chmod=755 /lib /lib
COPY --from=build --chown=root:root --chmod=755 /lib64 /lib64
COPY --from=build --chown=root:root --chmod=755 /usr/local/lib /usr/local/lib

ARG RP
ARG PORT
ARG AUTHORIZATION

ENV LD_LIBRARY_PATH=/usr/local/lib RP=${RP} PORT=${PORT} AUTHORIZATION=${AUTHORIZATION}

WORKDIR /app

COPY --from=build /app/dist/lnkr .

CMD /app/lnkr
