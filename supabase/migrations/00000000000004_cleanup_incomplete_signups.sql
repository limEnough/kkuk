-- ============================================================================
-- 미완료 이메일 가입자 자동 정리 (pg_cron)
--
-- 조건(모두 만족 시 삭제):
--   1) 비밀번호 미설정: encrypted_password is null or ''
--   2) 가입한 지 10분 이상 경과 (= OTP 유효시간 지남)
--   3) 다른 provider(google 등) identity 없음 (이메일 가입 전용 행만)
--
-- 효과: 코드 받기만 누르고 인증·비번설정 모두 안 끝낸 이메일은 10분 뒤 사라져
--       `email_account_status`가 다시 'none'을 돌려준다 → 같은 이메일로 처음부터.
--       profiles 등은 ON DELETE CASCADE 로 함께 정리됨.
--
-- 주의: pg_cron 확장이 켜져 있어야 한다. Supabase Dashboard → Database →
--       Extensions 에서 `pg_cron` 활성화. 마이그레이션의 create extension 으로도
--       시도하지만, 권한상 실패하면 위 위치에서 수동 활성화 후 이 파일을 재실행.
-- ============================================================================

create extension if not exists pg_cron;

-- 삭제 로직을 함수로 캡슐화 (security definer로 auth.users 접근)
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
    where (u.encrypted_password is null or u.encrypted_password = '')
      and u.created_at < now() - interval '10 minutes'
      and not exists (
        select 1
        from auth.identities i
        where i.user_id = u.id
          and i.provider <> 'email'
      )
    returning 1
  )
  select count(*) into v_deleted from del;
  return v_deleted;
end;
$$;

comment on function public.cleanup_incomplete_email_signups() is
  '비밀번호 미설정 + 10분 경과 + 이메일 전용 identity 인 미완료 가입자 정리';

-- 외부 호출 방지: 일반 롤은 실행 금지 (cron만 사용)
revoke all on function public.cleanup_incomplete_email_signups() from public;
revoke all on function public.cleanup_incomplete_email_signups() from anon;
revoke all on function public.cleanup_incomplete_email_signups() from authenticated;

-- 기존 동일 잡 제거 후 재등록(멱등성)
do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job
   where jobname = 'cleanup-incomplete-email-signups';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
end$$;

-- 2분마다 점검 → 10~12분 내 정리 보장
select cron.schedule(
  'cleanup-incomplete-email-signups',
  '*/2 * * * *',
  $$select public.cleanup_incomplete_email_signups();$$
);
