-- +goose Up
create table users (
  id            uuid primary key default gen_random_uuid(),
  name          character varying(64) not null,
  "createdAt"   timestamp with time zone not null default now()
);

create table passkeys (
  id            text primary key,
  key           bytea not null,
  counter       bigint not null default 0,
  transports    character varying(255) not null,
  "userId"      uuid not null references users on delete cascade,
  "createdAt"   timestamp with time zone not null default now(),
  "lastUsedAt"  timestamp with time zone not null default now()
);

create table tokens (
  id            uuid primary key default gen_random_uuid(),
  "userId"      uuid not null references users on delete cascade,
  "createdAt"   timestamp with time zone not null default now(),
  "lastUsedAt"  timestamp with time zone not null default now()
);

create table tags (
  id            uuid primary key default gen_random_uuid(),
  value         character varying(32) not null,
  "userId"      uuid not null references users on delete cascade,
  "createdAt"   timestamp with time zone not null default now(),

  UNIQUE ("userId", value)
);

create table ips (
  id            inet primary key,
  location      point not null,
  country       character (2) not null,
  town          character varying(32) not null,
  "updatedAt"   timestamp with time zone not null default now(),
  "createdAt"   timestamp with time zone not null default now()
);

create table links (
  id            integer primary key,
  value         character varying(1024) not null,
  "userId"      uuid not null references users on delete cascade,
  "createdAt"   timestamp with time zone not null default now()
);

create table hits (
  ip            inet references ips on delete cascade,
  link          integer references links on delete cascade,
  "createdAt"   timestamp with time zone not null default now(),

  primary key (ip, link, "createdAt")
);

create table linktags (
  tag           uuid references tags on delete cascade,
  link          integer references links on delete cascade,
  "createdAt"   timestamp with time zone not null default now(),

  primary key (tag, link)
);

-- +goose Down
drop table passkeys;
drop table tokens;
drop table hits;
drop table linktags;
drop table tags;
drop table ips;
drop table links;
drop table users;
