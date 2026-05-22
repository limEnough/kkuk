-- ============================================================================
-- 비밀번호 설정 여부 명시적 플래그
--
-- 배경: Supabase GoTrue는 OTP로 생성된 유저의 auth.users.encrypted_password 에
--       bcrypt placeholder를 박아둡니다. 사용자가 비번을 실제로 설정하지 않아도
--       해시가 들어 있어서, 그 컬럼만으로는 "진짜 가입 완료"를 판정할 수 없습니다.
--
-- 해결: profiles.password_set 불리언으로 명시적으로 관리.
--       useSetPassword() 가 updateUser({password}) 성공 시 true 로 표시.
--       email_account_status / cleanup 모두 이 플래그를 기준으로 동작.
-- ============================================================================

-- 1) profiles 에 password_set 컬럼
alter table public.profiles
  add column if not exists password_set boolean not null default false;

-- 2) email_account_status — password_set 기준으로 재정의
create or replace function public.email_account_status(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_user_id uuid;
  v_has_google boolean;
  v_password_set boolean;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    return 'none';
  end if;

  select exists (
    select 1 from auth.identities
    where user_id = v_user_id and provider = 'google'
  ) into v_has_google;

  if v_has_google then
    return 'google';
  end if;

  select coalesce(password_set, false) into v_password_set
  from public.profiles
  where id = v_user_id;

  if not coalesce(v_password_set, false) then
    return 'email_incomplete';
  end if;
  return 'email_complete';
end;
$$;

-- 3) cleanup 함수도 password_set 기준으로 (bcrypt placeholder 무시)
create or replace function public.cleanup_incomplete_email_signups()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_deleted integer;
begin
  with del as (
    delete from auth.users u
    using public.profiles p
    where u.id = p.id
      and coalesce(p.password_set, false) = false
      and u.created_at < now() - interval '10 minutes'
      and not exists (
        select 1 from auth.identities i
        where i.user_id = u.id and i.provider <> 'email'
      )
    returning 1
  )
  select count(*) into v_deleted from del;
  return v_deleted;
end;
$$;
