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
    "userId"      uuid references users ON DELETE CASCADE,
    "createdAt"   timestamp with time zone NOT null DEFAULT NOW(),
    "lastUsedAt"  timestamp with time zone NOT null DEFAULT NOW()
  );
EOSQL
