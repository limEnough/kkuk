# kkuk 꾹

> 오늘도 잘 참았어요. 참아야 했던 순간을 기록하고 응원받는 곳.

테마: **기록 · 성찰 · 힐링**

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **상태**: TanStack Query (서버) + Jotai (전역 클라이언트)
- **폼**: React Hook Form
- **스타일**: Tailwind CSS (Toss-inspired 디자인 시스템)
- **백엔드**: Supabase (Postgres + Auth + RLS)
- **모노레포**: pnpm workspace + Turborepo
- **CI**: GitHub Actions

## 폴더 구조

```
chamapp/
├── apps/web/                  # Vite 메인 앱
├── packages/
│   ├── api/                   # Supabase 클라이언트 + TanStack Query 훅
│   ├── feature-press/         # 꾹 누르기 핵심 인터랙션
│   ├── messages/              # 응원 메시지 JSON + 셀렉터
│   ├── haptics/               # 햅틱 진동 유틸
│   ├── ui/                    # 공통 UI 컴포넌트 (Button, Input, BottomSheet)
│   └── config/                # tailwind preset 등 공유 설정
├── supabase/
│   ├── migrations/            # 스키마 마이그레이션
│   └── seed.sql               # 기본 항목/망치 시드
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
- **망치**: ~700ms 주기로 hammer-tap 애니메이션 재시작
- **햅틱**: 두드림마다 진동 강도가 진행률에 비례 (10ms → 35ms)
- **완료**: 폭죽 파티클 16개 방사 + 강한 진동 패턴
- **취소 트리거**: 영역 이탈, 16px 이상 이동, pointercancel

## 데이터 모델 (Supabase)

| 테이블               | 설명                                          | RLS       |
| -------------------- | --------------------------------------------- | --------- |
| `profiles`           | auth.users 1:1 확장 (닉네임, 선택 망치)       | 본인만    |
| `items`              | 참을 항목 (`user_id IS NULL` = 시스템 기본)   | 기본+본인 |
| `press_records`      | 참은 기록 (캘린더 표시용, 라벨/이모지 스냅샷) | 본인만    |
| `collected_messages` | 받아본 응원 문장 도감                         | 본인만    |
| `hammers`            | 망치 종류                                     | 모두 읽기 |

## 다음 작업 (TODO)

- [ ] 캘린더 페이지 실제 그리드 UI
- [ ] 마이페이지 — 항목 관리, 망치 선택, 획득 문장 도감
- [ ] 온보딩 Lottie 애니메이션
- [ ] 응원 메시지 300개 채우기
- [ ] 망치 이미지 에셋 (`/public/hammers/*.png`)
- [ ] PWA 설정 (오프라인 지원, 홈화면 추가)
