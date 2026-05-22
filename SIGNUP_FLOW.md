# 회원가입 로직 정리

이메일 인증 기반 회원가입 흐름을 케이스별로 정리한 문서.

## 1. 핵심 구조

**3단계 위저드** (`apps/web/src/pages/SignupPage.tsx`)

```
email → code → password
```

**계정 상태 분기** (`email_account_status` RPC)

| 상태 | 의미 |
|---|---|
| `none` | 가입 이력 없음 |
| `google` | Google OAuth 가입 |
| `email_incomplete` | auth.users 행은 있으나 `profiles.password_set = false` |
| `email_complete` | `profiles.password_set = true` (가입 완료) |

**핵심 플래그 — `profiles.password_set`**

Supabase GoTrue는 OTP로 생성된 유저의 `auth.users.encrypted_password`에 bcrypt placeholder를 박는다. 따라서 그 컬럼만으로는 "진짜 비밀번호 설정 여부"를 판정할 수 없어, `profiles.password_set` 불리언으로 별도 관리한다.
(`supabase/migrations/00000000000005_password_set_flag.sql`)

## 2. 관련 파일

| 파일 | 역할 |
|---|---|
| `apps/web/src/pages/SignupPage.tsx` | 3단계 가입 위저드 UI |
| `apps/web/src/pages/LoginPage.tsx` | 로그인, 미완료/미가입 시 가입 흐름 연결 |
| `packages/api/src/hooks/useAuth.ts` | 인증 훅 + 에러 정규화 |
| `supabase/migrations/00000000000003_email_account_status.sql` | 상태 조회 RPC (초기 버전) |
| `supabase/migrations/00000000000005_password_set_flag.sql` | `password_set` 도입 + RPC/cleanup 재정의 |
| `supabase/migrations/00000000000004_cleanup_incomplete_signups.sql` | 미완료 가입자 자동 정리 cron |

## 3. 정상 흐름 케이스

### A. 신규 가입 (`status = none`)

1. `onEmailSubmit` → `fetchEmailStatus` = `none` → `signInWithOtp({ shouldCreateUser: true })`
2. `localStorage["signup_pending_otp"]`에 `{ email, expiresAt: now + 10분 }` 저장
3. 코드 입력 → `verifyOtp` 성공 → 세션 생성 → `clearPendingOtp` → password 단계
4. `setPassword`: `updateUser({ password })` + `profiles.password_set = true`
5. `completedRef.current = true` → unmount 시 signOut 생략 → `/main` 이동

### B. 가입 재개 (`status = email_incomplete`)

- A와 동일 경로. RPC가 `email_incomplete`을 돌려줘도 `useRequestSignupCode`는 차단하지 않고 OTP를 재발송한다.
- 같은 `auth.users` 행을 재사용 → 비밀번호만 새로 설정된다.

### C. 로그인 화면에서 넘어온 자동 시작

- `LoginPage`에서 `no_account` 또는 `incomplete` 시 `navigate("/signup", { state: { email, autostart: true } })`.
- `SignupPage`의 useEffect가 `autoStartedRef`로 1회만 자동 코드 발송.

### D. 유효한 OTP 재사용 (재방문)

- 진입 시 같은 이메일을 입력하면 `readPendingOtp`가 10분 내 유효 코드를 발견 → 재발송 없이 바로 `code` 단계로.
- 메일 발송 쿼터 소모 / 스팸 호소 방지.

### E. 코드 재전송

- `onResend` → `requestCode` 재호출. Supabase 자체 쿨다운(`after N seconds`)은 `mapAuthError`가 `rate_limit`으로 정규화.

## 4. 차단 케이스 (가입 막힘)

### F. `status = google` → `account_google`

> 이미 Google로 가입된 이메일이에요. "Google로 계속하기"로 로그인해주세요.

### G. `status = email_complete` → `account_exists`

> 이미 가입된 이메일이에요. 비밀번호로 로그인해주세요.

## 5. 에러 케이스

| 케이스 | 코드 | 처리 위치 |
|---|---|---|
| 같은 메일 짧은 쿨다운 (`after N seconds`) | `rate_limit` (N초 안내) | `useAuth.ts` |
| 프로젝트 시간당 메일 한도 | `rate_limit` (최대 1시간) | `useAuth.ts` |
| OTP 만료/오류 | `invalid_otp` | `useAuth.ts` (필드 리셋 후 토스트) |
| 비밀번호 보안 미달 (서버) | `weak_password` | `useAuth.ts` |
| 잘못된 이메일 형식 | `invalid_email` | `useAuth.ts` |
| 네트워크 | `network` | `useAuth.ts` |
| OTP 6자리 미충족 | client validator | `SignupPage.tsx` (`/^\d{6}$/`) |
| 비밀번호 룰 미충족 | client validator | `SignupPage.tsx` (영문/숫자/특수문자 6자+) |
| 비밀번호 재확인 불일치 | client validator | `SignupPage.tsx` |

## 6. 이탈 / 세션 처리 케이스

### H. 진입 시 항상 처음부터

- 진입 useEffect → `auth.signOut()`. OTP 검증 후 남은 세션을 페이지 진입 때마다 폐기 → 항상 1단계부터.

### I. 비밀번호 설정 전 이탈

- unmount 시 `completedRef.current === false`면 `signOut()` 실행.
- 결과: `auth.users` 행은 남고 `password_set = false` → 상태는 `email_incomplete`.

### J. 10분 이상 미완료 시 자동 정리

- `cleanup_incomplete_email_signups` cron이 2분마다 실행:
  - `password_set = false` AND 생성 후 10분 경과 AND email-only identity
- 삭제되면 상태가 `none`으로 돌아가 같은 이메일로 신규 가입처럼 진행 가능.

## 7. 잠재 이슈 (점검 중 발견)

1. **진입 signOut 비동기 누락**
   `getSupabaseClient().auth.signOut()` 결과를 await 하지 않음. 직후 `autostart`로 `requestCode`가 발사되면 이전 세션이 잔존한 상태에서 OTP가 진행될 가능성. 일관성 측면에서 await가 안전.

2. **`setPassword`에서 profile 업데이트 실패 시 부분 성공 상태**
   `auth.updateUser({ password })`는 성공했는데 `profiles.password_set = true` 업데이트가 실패하면, 실제 비밀번호는 박혔지만 상태는 여전히 `email_incomplete`. 다음 가입 시도에서 OTP만 통과하면 비번이 덮어써져 정합성은 회복되지만, 그 사이 cleanup cron이 10분 후 행을 지울 수 있음 (사용자 입장에선 비번은 설정했는데 계정이 사라짐).
   → profile update를 RPC로 묶거나 트리거로 처리하는 게 안전.

3. **`useEmailStatus` export는 있는데 미사용**
   화면 사전 분기용으로 만들었지만 현재 SignupPage/LoginPage 어느 쪽도 안 씀. 죽은 코드.

4. **마이그레이션 순서 / 멱등성**
   `00000000000003`의 `email_account_status`는 `encrypted_password` 기준이었고, `00000000000005`가 그 함수를 `password_set` 기준으로 덮어씀. 적용 순서가 보장되므로 OK. `00000000000003` 끝의 `drop function if exists public.email_is_registered(text)`는 이미 없을 수 있으나 무해.
