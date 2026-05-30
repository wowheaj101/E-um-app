-- =============================================================
-- 이음(E-UM) — 초기 DB 스키마
-- 개발 순서 1단계 (1/2): Supabase DB 스키마 생성
-- 대상: Supabase (PostgreSQL 15+)
-- 참조: 이음_기술명세서.md §2 데이터베이스 설계
--
-- 재실행 안전(idempotent): 모든 객체는 IF NOT EXISTS / OR REPLACE 사용.
-- =============================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- -------------------------------------------------------------
-- users — 사용자 (Supabase Auth 연동)
--   id = auth.users.id (1:1). 회원가입 시 트리거로 자동 생성.
-- -------------------------------------------------------------
create table if not exists public.users (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null unique,
  name        text        not null,
  role        text        not null check (role in ('senior', 'helper')),
  created_at  timestamptz not null default now()
);
comment on table public.users  is '사용자 — Supabase Auth(auth.users)와 1:1 연동';
comment on column public.users.role is 'senior(시니어) / helper(조력자 자녀)';

-- -------------------------------------------------------------
-- assets — 자산
-- -------------------------------------------------------------
create table if not exists public.assets (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users (id) on delete cascade,
  asset_type  text        not null,                       -- bank / insurance / realestate / crypto 등 (확장 가능)
  asset_name  text        not null,
  institution text,                                       -- 금융사명 (nullable)
  amount      bigint,                                     -- 금액(원), 미상 시 null
  source      text        not null check (source in ('voice', 'ocr', 'manual')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.assets is '자산 — 소유 시니어(user_id)별 자산 목록';
comment on column public.assets.source is '입력 방식: voice / ocr / manual';

create index if not exists idx_assets_user_id on public.assets (user_id);

-- -------------------------------------------------------------
-- helpers — 조력자 연결 (users 자기 참조: senior ↔ helper)
-- -------------------------------------------------------------
create table if not exists public.helpers (
  id               uuid        primary key default gen_random_uuid(),
  senior_id        uuid        not null references public.users (id) on delete cascade,
  helper_id        uuid        not null references public.users (id) on delete cascade,
  permission_level text        not null default 'read_only' check (permission_level in ('read_only')),
  invited_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  status           text        not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  constraint helpers_no_self    check (senior_id <> helper_id),
  constraint helpers_unique_link unique (senior_id, helper_id)
);
comment on table public.helpers is '조력자 연결 — 시니어(senior_id)와 조력자(helper_id) 관계';
comment on column public.helpers.permission_level is 'MVP 고정: read_only';

create index if not exists idx_helpers_senior_id on public.helpers (senior_id);
create index if not exists idx_helpers_helper_id on public.helpers (helper_id);

-- -------------------------------------------------------------
-- digital_legacy — 디지털 유산 노트
-- -------------------------------------------------------------
create table if not exists public.digital_legacy (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.users (id) on delete cascade,
  category       text        not null check (category in ('sns', 'crypto', 'subscription')),
  title          text        not null,
  encrypted_data text        not null,                    -- AES 암호화 저장
  trigger_type   text        not null check (trigger_type in ('date', 'manual')),
  trigger_date   date,                                    -- trigger_type = 'date' 일 때만
  created_at     timestamptz not null default now()
);
comment on table public.digital_legacy is '디지털 유산 노트 — 본인만 접근, 암호화 저장';

create index if not exists idx_digital_legacy_user_id on public.digital_legacy (user_id);

-- -------------------------------------------------------------
-- fds_logs — 이상 감지 로그
-- -------------------------------------------------------------
create table if not exists public.fds_logs (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users (id) on delete cascade,
  pattern_type text        not null check (pattern_type in ('time', 'amount', 'device')),
  detail       jsonb,                                     -- 감지 상세
  is_locked    boolean     not null default false,        -- 긴급 잠금 여부
  detected_at  timestamptz not null default now()
);
comment on table public.fds_logs is '이상 감지 로그 — 대상 시니어(user_id)';

create index if not exists idx_fds_logs_user_id on public.fds_logs (user_id);

-- =============================================================
-- 트리거 함수
-- =============================================================

-- assets.updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_assets_set_updated_at on public.assets;
create trigger trg_assets_set_updated_at
  before update on public.assets
  for each row execute function public.set_updated_at();

-- 신규 Auth 사용자 → public.users 자동 생성
--   회원가입 시 raw_user_meta_data 의 name/role 사용 (없으면 기본값).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'senior')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
