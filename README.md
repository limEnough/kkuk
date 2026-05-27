# kkuk 꾹

> 오늘도 잘 참았어요. 참아야 했던 순간을 기록하고 응원받는 곳.

테마: **기록 · 성찰 · 힐링**

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **상태**: TanStack Query (서버) + Jotai (전역 클라이언트)
- **폼**: React Hook Form
- **스타일**: Tailwind CSS (Toss-inspired 디자인 시스템, mobile view only)
- **백엔드**: Supabase (Postgres + Auth + RLS)
- **모노레포**: pnpm workspace + Turborepo
- **CI**: GitHub Actions

## 폴더 구조

```
chamapp/
├── apps/web/                     # Vite 메인 앱
│   └── src/pages/
│       ├── OnboardingPage / LoginPage / SignupPage / AuthCallbackPage
│       ├── MainPage              # 꾹 누르기 메인
│       ├── CalendarPage          # 기록 캘린더
│       ├── MyPage / AccountPage  # 마이페이지 / 계정 관리
│       ├── ItemManagePage        # 참을 항목 관리
│       ├── HammerSelectPage      # 망치 선택
│       └── CollectedMessagesPage # 응원 문장 도감
├── packages/
│   ├── api/                      # Supabase 클라이언트 + TanStack Query 훅 (useAuth 포함)
│   ├── feature-auth/             # 로그인/가입 위저드 공통 컴포넌트
│   ├── feature-press/            # 꾹 누르기 핵심 인터랙션
│   ├── feature-calendar/         # 캘린더 그리드 & 기록 표시
│   ├── feature-mypage/           # 마이페이지 섹션 컴포넌트
│   ├── feature-onboarding/       # 온보딩 플로우
│   ├── messages/                 # 응원 메시지 JSON + 셀렉터
│   ├── haptics/                  # 햅틱 진동 유틸
│   ├── ui/                       # 공통 UI 컴포넌트 (Button, Input, BottomSheet)
│   └── config/                   # tailwind preset 등 공유 설정
├── supabase/
│   ├── migrations/               # 스키마 + 인증 RPC + cleanup cron
│   └── seed.sql                  # 기본 항목/망치 시드
├── SIGNUP_FLOW.md                # 회원가입 로직 케이스별 정리
└── .github/workflows/ci.yml
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Supabase 로컬 환경

[Supabase CLI](https://supabase.com/docs/guides/cli) 설치 후:

```bash
# 로컬 Postgres + Studio 실행
npx supabase start

# 마이그레이션 + 시드 적용
npx supabase db reset

# DB 타입 자동 생성 (선택)
pnpm supabase:gen-types
```

`supabase start` 출력에서 `API URL`과 `anon key`를 복사해서 `apps/web/.env.local`에 넣어주세요:

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=...
```

### 3. Google OAuth 설정 (로컬)

`supabase/config.toml`에 Google provider 활성화:

```toml
[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_SECRET)"
redirect_uri = "http://localhost:54321/auth/v1/callback"
```

Google Cloud Console에서 OAuth 2.0 클라이언트 ID 발급 후 환경변수로 주입.
프로덕션 단계에서는 Supabase Studio의 Authentication > Providers에서 설정.

### 4. 개발 서버 실행

```bash
pnpm dev
```

`http://localhost:5173`

## 핵심 인터랙션 — 꾹 누르기

`packages/feature-press/src/PressArea.tsx`

- **Pointer Events**: 마우스/터치/펜 통합 처리
- **5초 룰**: 풀로 채우면 자동 완료, 도중 손 뗌은 취소
- **시각**: 이모지 흐려짐(opacity 1→0.15) + 살짝 흔들림(shake-soft)
- **망치**: ~700ms 주기로 hammer-tap 애니메이션, 두드릴 때마다 살짝 튕기는 생동감 효과
- **햅틱**: 두드림마다 진동 강도가 진행률에 비례 (10ms → 35ms)
- **완료**: 폭죽 파티클 16개 방사 + 강한 진동 패턴
- **취소 트리거**: 영역 이탈, 16px 이상 이동, pointercancel

## 인증 흐름

이메일 OTP + Google OAuth 두 가지 경로. 케이스별 상세 동작과 분기 조건은 [`SIGNUP_FLOW.md`](./SIGNUP_FLOW.md)에 정리.

- **3단계 가입 위저드**: `email → code → password` (`apps/web/src/pages/SignupPage.tsx`)
- **상태 분기 RPC**: `email_account_status` — `none / google / email_incomplete / email_complete`
- **`profiles.password_set`** 플래그로 진짜 비밀번호 설정 여부 판별 (GoTrue의 OTP placeholder 우회)
- **미완료 가입자 자동 정리**: 10분 경과 + `password_set = false` + email-only identity → cron 삭제
- **헤더**: 로그인 시 홈 바로가기 버튼 노출, 모바일 뷰에서 바텀시트 버튼은 하단 고정

## 데이터 모델 (Supabase)

| 테이블               | 설명                                          | RLS       |
| -------------------- | --------------------------------------------- | --------- |
| `profiles`           | auth.users 1:1 확장 (닉네임, 선택 망치, `password_set`) | 본인만    |
| `items`              | 참을 항목 (`user_id IS NULL` = 시스템 기본)   | 기본+본인 |
| `press_records`      | 참은 기록 (캘린더 표시용, 라벨/이모지 스냅샷) | 본인만    |
| `collected_messages` | 받아본 응원 문장 도감                         | 본인만    |
| `hammers`            | 망치 종류                                     | 모두 읽기 |

## 다음 작업 (TODO)

- [ ] **이메일 인증 로직 수정** — `SIGNUP_FLOW.md` §7 잠재 이슈 반영
  - 진입 시 `auth.signOut()` await 누락 → 자동 시작과의 경합 가능성
  - `setPassword` 부분 성공 (auth 비번 OK, `password_set` 업데이트 실패) → RPC/트리거로 원자화
  - 미사용 `useEmailStatus` 정리 또는 사전 분기에 실제 활용
