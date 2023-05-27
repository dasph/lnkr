FROM denoland/deno:1.27.2

EXPOSE 8080

WORKDIR /app
COPY . /app

ARG FIREBASE
ARG AUTHORIZATION

ENV FIREBASE=${FIREBASE} AUTHORIZATION=${AUTHORIZATION}

RUN deno cache mod.ts --unstable

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--unstable", "mod.ts"]
