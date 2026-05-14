-- ============================================================================
-- 초기 시드 데이터
-- ============================================================================

-- 기본 망치 (시스템 제공)
insert into public.hammers (name, image_url, sort_order, is_default) values
  ('빨간 뿅망치', '/hammers/red.png', 1, true),
  ('파란 뿅망치', '/hammers/blue.png', 2, false),
  ('황금 뿅망치', '/hammers/gold.png', 3, false),
  ('무지개 뿅망치', '/hammers/rainbow.png', 4, false);

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
