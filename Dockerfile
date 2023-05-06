FROM denoland/deno:1.27.2

EXPOSE 8080

WORKDIR /app

ADD . /app

RUN deno cache mod.ts --unstable

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--unstable", "mod.ts"]
