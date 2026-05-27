# kkuk 꾹 · 참아낸 순간을 기록하는 힐링 앱

> 오늘도 잘 참았어요. 화면을 5초간 꾹 누르면 망치가 두드려주고, 폭죽과 함께 응원 한 줄이 도착하는 **기록 · 성찰 · 힐링** 웹앱입니다.

테마: **기록 · 성찰 · 힐링**

## ✨ Features

- 🔨 **꾹 누르기 인터랙션** · 5초 풀 차징, 망치 hammer-tap 애니메이션, 진행률 비례 햅틱(10ms → 35ms), 완료 시 폭죽 파티클 16개 방사
- 🗂 **참을 항목 관리** · 시스템 기본 항목 + 사용자 커스텀 항목, 이모지/라벨 스냅샷으로 기록 보존
- 📅 **캘린더 기록** · 참아낸 날의 항목/이모지를 한눈에
- 💌 **응원 문장 도감** · 두드릴 때마다 받아본 메시지를 모아 보는 컬렉션
- 🔐 **이메일 OTP + Google OAuth** · 3단계 가입 위저드(`email → code → password`) + 미완료 가입자 자동 cleanup
- 🔨 **망치 선택** · 마이페이지에서 망치 종류 변경
- 📱 **Mobile View Only** · 바텀시트 버튼 하단 고정, 모바일 우선 디자인
- 🏠 **헤더 컨텍스트** · 로그인 상태일 때 홈 바로가기 버튼 노출

## 🛠 Tech Stack

| 영역       | 기술                                                       |
| ---------- | ---------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite                                  |
| State      | TanStack Query (서버) + Jotai (전역 클라이언트)              |
| Form       | React Hook Form                                             |
| Styling    | Tailwind CSS (Toss-inspired 디자인 시스템, mobile only)      |
| Backend    | Supabase (Postgres + Auth + RLS)                            |
| Monorepo   | pnpm workspace + Turborepo                                  |
| CI         | GitHub Actions                                              |

## 📁 Project Structure

```
chamapp/
├── apps/web/                     # 🌐 Vite 메인 앱
│   └── src/pages/
│       ├── OnboardingPage / LoginPage / SignupPage / AuthCallbackPage
│       ├── MainPage              # 🔨 꾹 누르기 메인
│       ├── CalendarPage          # 📅 기록 캘린더
│       ├── MyPage / AccountPage  # 👤 마이페이지 / 계정 관리
│       ├── ItemManagePage        # 🗂 참을 항목 관리
│       ├── HammerSelectPage      # 🔨 망치 선택
│       └── CollectedMessagesPage # 💌 응원 문장 도감
├── packages/
│   ├── api/                      # Supabase 클라이언트 + TanStack Query 훅 (useAuth 포함)
│   ├── feature-auth/             # 🔐 로그인/가입 위저드 공통 컴포넌트
│   ├── feature-press/            # 🔨 꾹 누르기 핵심 인터랙션
│   ├── feature-calendar/         # 📅 캘린더 그리드 & 기록 표시
│   ├── feature-mypage/           # 👤 마이페이지 섹션 컴포넌트
│   ├── feature-onboarding/       # 👋 온보딩 플로우
│   ├── messages/                 # 💌 응원 메시지 JSON + 셀렉터
│   ├── haptics/                  # 📳 햅틱 진동 유틸
│   ├── ui/                       # 🧩 공통 UI (Button, Input, BottomSheet)
│   └── config/                   # ⚙️ tailwind preset 등 공유 설정
├── supabase/
│   ├── migrations/               # 🗄 스키마 + 인증 RPC + cleanup cron
│   └── seed.sql                  # 🌱 기본 항목/망치 시드
├── SIGNUP_FLOW.md                # 📖 회원가입 로직 케이스별 정리
└── .github/workflows/ci.yml
```

## 🚀 Getting Started

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

Google Cloud Console에서 OAuth 2.0 클라이언트 ID 발급 후 환경변수로 주입. 프로덕션 단계에서는 Supabase Studio의 Authentication > Providers에서 설정.

### 4. 개발 서버 실행

```bash
pnpm dev
```

http://localhost:5173 으로 접속.

## 🔨 핵심 인터랙션 — 꾹 누르기

`packages/feature-press/src/PressArea.tsx`

- 🖱 **Pointer Events**: 마우스/터치/펜 통합 처리
- ⏱ **5초 룰**: 풀로 채우면 자동 완료, 도중 손 뗌은 취소
- 👁 **시각**: 이모지 흐려짐(opacity 1→0.15) + 살짝 흔들림(shake-soft)
- 🔨 **망치**: ~700ms 주기로 hammer-tap, 두드릴 때마다 살짝 튕기는 생동감 효과
- 📳 **햅틱**: 진동 강도가 진행률에 비례 (10ms → 35ms)
- 🎆 **완료**: 폭죽 파티클 16개 방사 + 강한 진동 패턴
- ✋ **취소 트리거**: 영역 이탈, 16px 이상 이동, pointercancel

## 🔐 인증 흐름

이메일 OTP + Google OAuth 두 가지 경로. 케이스별 상세 분기는 [`SIGNUP_FLOW.md`](./SIGNUP_FLOW.md) 참고.

- 🧭 **3단계 가입 위저드** · `email → code → password` (`apps/web/src/pages/SignupPage.tsx`)
- 🔀 **상태 분기 RPC** · `email_account_status` → `none / google / email_incomplete / email_complete`
- 🏷 **`profiles.password_set` 플래그** · GoTrue의 OTP placeholder 우회, 진짜 비밀번호 설정 여부 판별
- 🧹 **미완료 가입자 자동 정리** · 10분 경과 + `password_set = false` + email-only identity → cron 삭제
- 🍪 **세션 보호** · 진입 시 `signOut` → 항상 1단계부터, 비밀번호 설정 전 unmount 시 세션 폐기

## 🗃 데이터 모델 (Supabase)

| 테이블               | 설명                                                          | RLS         |
| -------------------- | ------------------------------------------------------------- | ----------- |
| 👤 `profiles`         | auth.users 1:1 확장 (닉네임, 선택 망치, `password_set`)         | 본인만       |
| 🗂 `items`            | 참을 항목 (`user_id IS NULL` = 시스템 기본)                    | 기본 + 본인  |
| 📅 `press_records`    | 참은 기록 (캘린더 표시용, 라벨/이모지 스냅샷)                   | 본인만       |
| 💌 `collected_messages` | 받아본 응원 문장 도감                                         | 본인만       |
| 🔨 `hammers`          | 망치 종류                                                     | 모두 읽기    |

## 🎨 Design Notes

토스(Toss) 디자인 시스템에서 영감을 받은 깔끔한 스타일.

- 📱 **Mobile View Only** · 데스크탑에서도 모바일 너비로 고정, 바텀시트 버튼은 화면 하단 고정
- 🟦 **컬러** · 토스 블루 기반 Primary + 시맨틱(positive/negative/warning), 회색 스케일은 부드러운 grey 톤
- ⭕ **모양** · 라운드 코너 + 가는 보더, 그림자 거의 없음
- 🔨 **아이콘 스타일** · 모든 SVG는 round caps/joins, 곡선 코너 (둥글둥글한 톤 유지)

## 📝 다음 작업 (TODO)

- [ ] 📧 **이메일 인증 로직 수정** — `SIGNUP_FLOW.md` §7 잠재 이슈 반영
  - ⏳ 진입 시 `auth.signOut()` await 누락 → 자동 시작과의 경합 가능성
  - ⚠️ `setPassword` 부분 성공 (auth 비번 OK, `password_set` 업데이트 실패) → RPC/트리거로 원자화
  - 🧹 미사용 `useEmailStatus` 정리 또는 사전 분기에 실제 활용

## 📝 License

Private.
