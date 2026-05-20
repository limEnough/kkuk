-- ============================================================================
-- 이메일 계정 상태 조회 RPC
-- 로그인/가입 화면에서 입력한 이메일이
--   none             : 가입 이력 없음 → 이메일 가입 가능
--   google           : Google로 가입됨 → "Google로 계속하기" 유도
--   email_incomplete : 코드 인증은 됐으나 비밀번호 미설정(가입 미완료) → 가입 재개 허용
--   email_complete   : 비밀번호까지 설정된 이메일 계정 → 비밀번호 로그인
-- 중 무엇인지 판별한다.
--
-- 보안 주의: anon 권한으로 호출 가능(가입/로그인 분기용). 상태 문자열만 반환하고
-- 사용자 정보는 노출하지 않는다. (email enumeration은 제품 요구사항상 의도적 허용)
-- ============================================================================

create or replace function public.email_account_status(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_user_id uuid;
  v_pw text;
  v_has_google boolean;
begin
  select id, encrypted_password
    into v_user_id, v_pw
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

  if v_pw is null or v_pw = '' then
    return 'email_incomplete';
  end if;

  return 'email_complete';
end;
$$;

comment on function public.email_account_status(text) is
  '이메일 계정 상태(none|google|email_incomplete|email_complete). 로그인/가입 분기용.';

revoke all on function public.email_account_status(text) from public;
grant execute on function public.email_account_status(text) to anon, authenticated;

-- 기존 boolean 함수는 더 이상 사용하지 않음
drop function if exists public.email_is_registered(text);
