-- =============================================================
-- 이음(E-UM) — Row Level Security (RLS) 정책
-- 개발 순서 1단계 (2/2): RLS 정책
-- 참조: 이음_기술명세서.md §2.3 RLS 정책 요약
--
--   assets        : 시니어 본인 = 전체 CRUD / 연결된 조력자 = SELECT만
--   helpers       : senior_id 또는 helper_id 일치 시 조회
--   digital_legacy: 본인만 접근
--   fds_logs      : 본인 + 연결 조력자 SELECT
--
-- auth.uid() = 현재 로그인 사용자 = public.users.id 와 동일.
-- 조력자의 이체·수정 차단은 SELECT 권한만 부여하여 구조적으로 보장.
-- =============================================================

-- -------------------------------------------------------------
-- 헬퍼 함수 (SECURITY DEFINER)
--   정책 내부에서 helpers 테이블을 조회할 때 RLS 재귀를 피하기 위해
--   definer 권한으로 RLS를 우회하여 관계만 확인한다.
-- -------------------------------------------------------------

-- auth.uid() 가 p_senior 의 '활성' 조력자인지 여부
create or replace function public.is_active_helper(p_senior uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.helpers h
    where h.senior_id = p_senior
      and h.helper_id = auth.uid()
      and h.status   = 'active'
  );
$$;

-- auth.uid() 와 p_other 가 (방향 무관) 연결되어 있는지 여부
create or replace function public.is_connected(p_other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.helpers h
    where (h.senior_id = auth.uid() and h.helper_id = p_other)
       or (h.helper_id = auth.uid() and h.senior_id = p_other)
  );
$$;

-- =============================================================
-- RLS 활성화
-- =============================================================
alter table public.users          enable row level security;
alter table public.assets         enable row level security;
alter table public.helpers        enable row level security;
alter table public.digital_legacy enable row level security;
alter table public.fds_logs       enable row level security;

-- =============================================================
-- users
--   본인 행 + 연결된 사용자(조력자 대시보드에서 이름 표시 등) 조회
-- =============================================================
drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select
  using (id = auth.uid() or public.is_connected(id));

drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users
  for insert
  with check (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- =============================================================
-- assets
--   본인 = 전체 CRUD / 연결된 활성 조력자 = SELECT만
-- =============================================================
drop policy if exists assets_select on public.assets;
create policy assets_select on public.assets
  for select
  using (user_id = auth.uid() or public.is_active_helper(user_id));

drop policy if exists assets_insert on public.assets;
create policy assets_insert on public.assets
  for insert
  with check (user_id = auth.uid());

drop policy if exists assets_update on public.assets;
create policy assets_update on public.assets
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists assets_delete on public.assets;
create policy assets_delete on public.assets
  for delete
  using (user_id = auth.uid());

-- =============================================================
-- helpers
--   senior_id 또는 helper_id 일치 시 조회.
--   초대(insert)는 시니어가, 수락/해제(update)는 양측이 가능.
-- =============================================================
drop policy if exists helpers_select on public.helpers;
create policy helpers_select on public.helpers
  for select
  using (senior_id = auth.uid() or helper_id = auth.uid());

drop policy if exists helpers_insert on public.helpers;
create policy helpers_insert on public.helpers
  for insert
  with check (senior_id = auth.uid());

drop policy if exists helpers_update on public.helpers;
create policy helpers_update on public.helpers
  for update
  using (senior_id = auth.uid() or helper_id = auth.uid())
  with check (senior_id = auth.uid() or helper_id = auth.uid());

drop policy if exists helpers_delete on public.helpers;
create policy helpers_delete on public.helpers
  for delete
  using (senior_id = auth.uid());

-- =============================================================
-- digital_legacy
--   본인만 접근 (전체 CRUD)
-- =============================================================
drop policy if exists legacy_all on public.digital_legacy;
create policy legacy_all on public.digital_legacy
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =============================================================
-- fds_logs
--   본인 + 연결 활성 조력자 SELECT. 기록(insert/update)은 본인.
--   (시스템 자동 기록은 service_role 키가 RLS를 우회하여 처리)
-- =============================================================
drop policy if exists fds_select on public.fds_logs;
create policy fds_select on public.fds_logs
  for select
  using (user_id = auth.uid() or public.is_active_helper(user_id));

drop policy if exists fds_insert on public.fds_logs;
create policy fds_insert on public.fds_logs
  for insert
  with check (user_id = auth.uid());

drop policy if exists fds_update on public.fds_logs;
create policy fds_update on public.fds_logs
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
