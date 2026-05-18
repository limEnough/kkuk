-- ============================================================================
-- 이메일 가입 여부 조회 RPC
-- 로그인 화면에서 매직링크 발송 전, 해당 이메일이 이미 가입돼 있는지 확인해
-- "이미 가입된 이메일이에요" vs "환영해요" 안내를 다르게 보여주기 위함.
--
-- 보안 주의: 이 함수는 anon 권한으로 호출 가능하므로 이메일 가입 여부가
-- 외부에 노출됩니다(email enumeration). 제품 요구사항(가입/로그인 안내 분기)에
-- 따라 의도적으로 허용한 것이며, 가입 여부만 boolean으로 반환할 뿐
-- 사용자 정보는 일절 노출하지 않습니다.
-- ============================================================================

create or replace function public.email_is_registered(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

comment on function public.email_is_registered(text) is
  '이메일이 auth.users에 이미 존재하는지 여부. 로그인 화면 안내 분기용.';

-- 기본 PUBLIC 실행 권한 회수 후, 필요한 롤에만 부여
revoke all on function public.email_is_registered(text) from public;
grant execute on function public.email_is_registered(text) to anon, authenticated;
