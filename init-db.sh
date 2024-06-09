#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 <<-EOSQL
  CREATE TABLE users (
    id            uuid primary key DEFAULT gen_random_uuid(),
    name          character varying(64) NOT null,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW()
  );

  CREATE TABLE passkeys (
    id            text primary key,
    key           bytea NOT null,
    counter       bigint NOT null DEFAULT 0,
    transports    character varying(255) NOT null,
    "userId"      uuid NOT null references users ON DELETE CASCADE,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW(),
    "lastUsedAt"  timestamp with time zone NOT null DEFAULT NOW()
  );

  CREATE TABLE tokens (
    id            uuid primary key DEFAULT gen_random_uuid(),
    "userId"      uuid NOT null references users ON DELETE CASCADE,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW(),
    "lastUsedAt"  timestamp with time zone NOT null DEFAULT NOW()
  );

  CREATE TABLE tags (
    id            uuid primary key DEFAULT gen_random_uuid(),
    value         character varying(32) NOT null,
    "userId"      uuid NOT null references users ON DELETE CASCADE,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW(),

    UNIQUE ("userId", value)
  );

  CREATE TABLE ips (
    id            inet primary key,
    location      point NOT null,
    country       character (2) NOT null,
    town          character varying(32) NOT null,
    "updatedAt"   timestamp with time zone NOT null DEFAULT NOW(),
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW()
  );

  CREATE TABLE links (
    id            integer primary key,
    value         character varying(1024) NOT null,
    "userId"      uuid NOT null references users ON DELETE CASCADE,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW()
  );

  CREATE TABLE hits (
    ip            inet references ips ON DELETE CASCADE,
    link          integer references links ON DELETE CASCADE,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW(),

    PRIMARY KEY (ip, link, "createdAt")
  );

  CREATE TABLE linktags (
    tag           uuid references tags ON DELETE CASCADE,
    link          integer references links ON DELETE CASCADE,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW(),

    PRIMARY KEY (tag, link)
  );
EOSQL
