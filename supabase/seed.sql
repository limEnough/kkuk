-- ============================================================================
-- 초기 시드 데이터
-- ============================================================================

-- 기본 망치 (시스템 제공) — public/hammers 의 실제 이미지와 1:1
insert into public.hammers (name, image_url, sort_order, is_default) values
  ('기본 뿅망치',     '/hammers/img-origin.png',    1,  true),
  ('변환 뿅망치',     '/hammers/img-transform.png', 2,  false),
  ('장인 뿅망치',     '/hammers/img-expert.png',    3,  false),
  ('왕의 뿅망치',     '/hammers/img-king.png',      4,  false),
  ('신의 뿅망치',     '/hammers/img-god.png',       5,  false),
  ('크리스탈 뿅망치', '/hammers/img-crystal.png',   6,  false),
  ('우주 뿅망치',     '/hammers/img-universe.png',  7, false),
  ('사탕 뿅망치',     '/hammers/img-candy.png',     8,  false),
  ('깃털 뿅망치',     '/hammers/img-feather.png',   9,  false),
  ('꽃 뿅망치',       '/hammers/img-flower.png',    10,  false);

-- 기본 참을 항목 (user_id = null = 모두에게 보임)
-- category는 messages 패키지의 그룹 키와 매칭됨
insert into public.items (user_id, label, sub_text, emoji, category, is_default, sort_order) values
  (null, '야식 참기',             '배달앱을 켜? 말아?',           '🍗', 'food',             true, 1),
  (null, '단 거 참기',             '당충전 각인데?',                 '🍰', 'sweets',           true, 2),
  (null, '소비 참기',             '마침 세일하는데?',              '🛍️', 'shopping',         true, 3),
  (null, '도망 참기',             '그냥..튈까?',                    '🏃', 'escape',           true, 4),
  (null, '눈물 참기',             '눈물이 차올라서 고갤 들어',      '😭', 'tears',            true, 5),
  (null, '험한 말 참기',           '이런 #$#@$!!%',                  '🤬', 'rude-words',       true, 6),
  (null, '견디기 힘든 사람 참기',   '똥이 무서워서 피하냐?',          '🦹', 'difficult-person', true, 7),
  (null, '초라한 나 참기',         '더 잘하고 싶었는데',             '😐', 'self-pity',        true, 8);
