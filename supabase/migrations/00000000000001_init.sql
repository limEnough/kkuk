-- ============================================================================
-- chamapp 초기 스키마
-- 테마: 기록, 성찰, 힐링 — 사용자가 "참은" 순간을 기록하고 응원받는 앱
-- ============================================================================

-- 1. 프로필 (auth.users 확장)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  selected_hammer_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is '사용자 프로필. auth.users 1:1 확장.';

-- auth.users 생성 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. 망치 종류 (마이페이지에서 선택)
-- ----------------------------------------------------------------------------
create table public.hammers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  sort_order int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.hammers is '꾹 누르기 화면에서 두드릴 망치. 시스템 제공만.';

-- 3. 참을 항목
-- ----------------------------------------------------------------------------
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade, -- null이면 시스템 기본 항목
  label text not null,
  sub_text text, -- 부제 (선택). 예: '배달앱을 켜? 말아?'
  emoji text not null,
  category text, -- 응원 메시지 그룹핑 키 (예: 'food', 'anger', 'sleep')
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.items is '참아야 하는 항목. user_id null = 모든 사용자에게 보이는 기본 항목.';
create index items_user_id_idx on public.items(user_id);
create index items_category_idx on public.items(category);

-- 4. 참은 기록 (캘린더에 표시되는 기록)
-- ----------------------------------------------------------------------------
create table public.press_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  item_label_snapshot text not null, -- 항목이 삭제돼도 기록은 남음
  item_emoji_snapshot text not null,
  duration_ms int not null, -- 실제 누른 시간
  message_id text, -- messages 패키지의 메시지 ID (정적)
  message_content text not null, -- 받은 응원 메시지 스냅샷
  created_at timestamptz not null default now()
);

comment on table public.press_records is '사용자가 꾹 눌러서 "참은" 기록.';
create index press_records_user_id_created_at_idx
  on public.press_records(user_id, created_at desc);

-- 5. 획득한 응원 문장 (마이페이지 "획득한 문장")
-- ----------------------------------------------------------------------------
create table public.collected_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message_id text not null, -- 정적 메시지 ID
  message_content text not null,
  first_collected_at timestamptz not null default now(),
  collect_count int not null default 1,
  unique(user_id, message_id)
);

comment on table public.collected_messages is '사용자가 받아본 적 있는 응원 문장 (도감처럼).';

-- ============================================================================
-- Row Level Security
-- 핵심 원칙: 사용자는 자기 데이터만, 기본 제공 데이터는 모두 읽기 가능
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.press_records enable row level security;
alter table public.collected_messages enable row level security;
alter table public.hammers enable row level security;

-- profiles
create policy "본인 프로필 조회" on public.profiles
  for select using (auth.uid() = id);
create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);

-- items: 기본 항목(user_id null)은 모두 읽기, 본인 항목은 CRUD
create policy "기본 항목 또는 본인 항목 조회" on public.items
  for select using (user_id is null or auth.uid() = user_id);
create policy "본인 항목 추가" on public.items
  for insert with check (auth.uid() = user_id);
create policy "본인 항목 수정" on public.items
  for update using (auth.uid() = user_id);
create policy "본인 항목 삭제" on public.items
  for delete using (auth.uid() = user_id);

-- press_records: 본인만
create policy "본인 기록 조회" on public.press_records
  for select using (auth.uid() = user_id);
create policy "본인 기록 추가" on public.press_records
  for insert with check (auth.uid() = user_id);
create policy "본인 기록 삭제" on public.press_records
  for delete using (auth.uid() = user_id);

-- collected_messages: 본인만
create policy "본인 획득 문장 조회" on public.collected_messages
  for select using (auth.uid() = user_id);
create policy "본인 획득 문장 추가" on public.collected_messages
  for insert with check (auth.uid() = user_id);
create policy "본인 획득 문장 수정" on public.collected_messages
  for update using (auth.uid() = user_id);

-- hammers: 모두 읽기 가능 (시스템 데이터)
create policy "망치 목록 모두 조회" on public.hammers
  for select using (true);
