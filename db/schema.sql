-- HyperNews database schema

create table if not exists admin_users (
  id serial primary key,
  email text unique not null,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists articles (
  slug text primary key,
  title text not null,
  excerpt text not null,
  image_url text not null,
  image_alt text not null,
  image_credit text,
  cover_seed text not null,
  category text not null,
  tags text[] not null default '{}',
  author text not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz,
  blocks jsonb not null default '[]',
  featured boolean not null default false,
  trending boolean not null default false,
  series text,
  views integer not null default 0,
  comments integer not null default 0,
  source_url text,
  source_name text,
  created_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on articles (published_at desc);
create index if not exists articles_category_idx on articles (category);
create index if not exists articles_author_idx on articles (author);

alter table articles add column if not exists source_url text;
alter table articles add column if not exists source_name text;

-- Plain (non-partial) unique index: `insert ... on conflict (source_url)` needs
-- an unconditional constraint to match against. Repeated NULLs stay legal, so
-- hand-written articles without a source are unaffected.
create unique index if not exists articles_source_url_idx on articles (source_url);

create index if not exists articles_featured_idx on articles (featured) where featured;
create index if not exists articles_trending_idx on articles (trending) where trending;
create index if not exists articles_views_idx on articles (views desc);
create index if not exists articles_tags_idx on articles using gin (tags);
