/**
 * 이모지 카탈로그
 * 각 이모지는 한글/영어 키워드로 검색 가능
 * 카테고리는 셀렉터에서 그룹핑 표시용
 */

export type EmojiCategory =
  | 'feeling'
  | 'people'
  | 'food'
  | 'activity'
  | 'object'
  | 'nature'
  | 'symbol';

export interface EmojiEntry {
  char: string;
  keywords: string[]; // 검색용 (한글/영문)
  category: EmojiCategory;
}

export const EMOJI_CATEGORY_LABELS: Record<EmojiCategory, string> = {
  feeling: '감정',
  people: '사람',
  food: '음식',
  activity: '활동',
  object: '사물',
  nature: '자연',
  symbol: '기호',
};

export const EMOJI_LIST: EmojiEntry[] = [
  // 감정
  { char: '😀', keywords: ['웃음', '행복', 'happy', 'smile'], category: 'feeling' },
  { char: '😊', keywords: ['웃음', '미소', 'smile'], category: 'feeling' },
  { char: '😂', keywords: ['웃음', '눈물', 'laugh'], category: 'feeling' },
  { char: '🥲', keywords: ['웃픈', '눈물', '슬픔'], category: 'feeling' },
  { char: '😍', keywords: ['사랑', '하트', 'love'], category: 'feeling' },
  { char: '🥰', keywords: ['사랑', '애정', '하트'], category: 'feeling' },
  { char: '😎', keywords: ['멋짐', '쿨', 'cool'], category: 'feeling' },
  { char: '🤔', keywords: ['생각', '고민', 'thinking'], category: 'feeling' },
  { char: '😐', keywords: ['무표정', '초라', '담담'], category: 'feeling' },
  { char: '😑', keywords: ['무표정', '한심', '체념'], category: 'feeling' },
  { char: '🙄', keywords: ['눈굴림', '한심', '귀찮'], category: 'feeling' },
  { char: '😴', keywords: ['잠', '졸림', 'sleep'], category: 'feeling' },
  { char: '😪', keywords: ['졸림', '피곤', 'sleepy'], category: 'feeling' },
  { char: '😩', keywords: ['지침', '피곤', '한숨'], category: 'feeling' },
  { char: '😫', keywords: ['지침', '힘듦', 'tired'], category: 'feeling' },
  { char: '😤', keywords: ['화', '분노', '씩씩'], category: 'feeling' },
  { char: '😠', keywords: ['화남', '짜증', 'angry'], category: 'feeling' },
  { char: '😡', keywords: ['분노', '화', 'rage'], category: 'feeling' },
  { char: '🤬', keywords: ['욕', '험한말', '분노'], category: 'feeling' },
  { char: '😢', keywords: ['눈물', '슬픔', 'sad'], category: 'feeling' },
  { char: '😭', keywords: ['눈물', '울음', '엉엉'], category: 'feeling' },
  { char: '😔', keywords: ['우울', '슬픔', 'sad'], category: 'feeling' },
  { char: '😞', keywords: ['실망', '낙담', '슬픔'], category: 'feeling' },
  { char: '😣', keywords: ['괴로움', '인내', 'persevere'], category: 'feeling' },
  { char: '😖', keywords: ['괴로움', '혼란', 'confounded'], category: 'feeling' },
  { char: '😨', keywords: ['두려움', '걱정', 'fear'], category: 'feeling' },
  { char: '😰', keywords: ['불안', '식은땀', 'anxious'], category: 'feeling' },
  { char: '🥺', keywords: ['애원', '간절', '부탁'], category: 'feeling' },
  { char: '😬', keywords: ['민망', '어색', 'awkward'], category: 'feeling' },
  { char: '🤐', keywords: ['입다물기', '말참기', 'silent'], category: 'feeling' },
  { char: '🤫', keywords: ['쉿', '비밀', 'shh'], category: 'feeling' },
  { char: '😶', keywords: ['무언', '말없음', 'speechless'], category: 'feeling' },

  // 사람/상황
  { char: '🏃', keywords: ['달리기', '도망', 'run'], category: 'people' },
  { char: '🚶', keywords: ['걷기', '산책', 'walk'], category: 'people' },
  { char: '🧘', keywords: ['명상', '요가', 'meditate'], category: 'people' },
  { char: '🦹', keywords: ['빌런', '나쁜사람', '악당'], category: 'people' },
  { char: '👿', keywords: ['악마', '짜증', 'devil'], category: 'people' },
  { char: '🤡', keywords: ['광대', '바보', 'clown'], category: 'people' },
  { char: '👻', keywords: ['유령', '귀신', 'ghost'], category: 'people' },
  { char: '💀', keywords: ['해골', '죽음', 'skull'], category: 'people' },
  { char: '👀', keywords: ['눈', '관심', 'eyes'], category: 'people' },
  { char: '🙏', keywords: ['기도', '부탁', '감사'], category: 'people' },
  { char: '💪', keywords: ['힘', '근육', 'strong'], category: 'people' },

  // 음식
  { char: '🍗', keywords: ['치킨', '닭', '음식', '야식'], category: 'food' },
  { char: '🍕', keywords: ['피자', '음식'], category: 'food' },
  { char: '🍔', keywords: ['햄버거', '버거', '음식'], category: 'food' },
  { char: '🍟', keywords: ['감자튀김', '프렌치프라이', '음식'], category: 'food' },
  { char: '🌭', keywords: ['핫도그', '음식'], category: 'food' },
  { char: '🍙', keywords: ['주먹밥', '음식'], category: 'food' },
  { char: '🍜', keywords: ['라면', '국수', '음식'], category: 'food' },
  { char: '🍝', keywords: ['파스타', '스파게티'], category: 'food' },
  { char: '🍰', keywords: ['케이크', '단거', '디저트'], category: 'food' },
  { char: '🧁', keywords: ['컵케이크', '디저트', '단거'], category: 'food' },
  { char: '🍪', keywords: ['쿠키', '과자', '단거'], category: 'food' },
  { char: '🍫', keywords: ['초콜릿', '단거', '디저트'], category: 'food' },
  { char: '🍩', keywords: ['도넛', '단거'], category: 'food' },
  { char: '🍬', keywords: ['사탕', '단거'], category: 'food' },
  { char: '🍦', keywords: ['아이스크림', '단거'], category: 'food' },
  { char: '🍺', keywords: ['맥주', '술', '음주'], category: 'food' },
  { char: '🍷', keywords: ['와인', '술'], category: 'food' },
  { char: '🍶', keywords: ['청주', '술', '소주'], category: 'food' },
  { char: '🥃', keywords: ['위스키', '술'], category: 'food' },
  { char: '☕', keywords: ['커피', '카페인'], category: 'food' },
  { char: '🧋', keywords: ['버블티', '음료'], category: 'food' },

  // 활동
  { char: '🎮', keywords: ['게임', '컨트롤러'], category: 'activity' },
  { char: '🎰', keywords: ['도박', '슬롯', '게임'], category: 'activity' },
  { char: '📱', keywords: ['핸드폰', '폰', '스마트폰'], category: 'activity' },
  { char: '💻', keywords: ['노트북', '컴퓨터'], category: 'activity' },
  { char: '📺', keywords: ['TV', '티비', '드라마'], category: 'activity' },
  { char: '🛒', keywords: ['장보기', '쇼핑', '카트'], category: 'activity' },
  { char: '🛍️', keywords: ['쇼핑', '소비', '쇼핑백'], category: 'activity' },
  { char: '💸', keywords: ['돈', '소비', '낭비'], category: 'activity' },
  { char: '💳', keywords: ['카드', '결제', '소비'], category: 'activity' },
  { char: '🚬', keywords: ['담배', '흡연'], category: 'activity' },
  { char: '🛌', keywords: ['침대', '잠', '늦잠'], category: 'activity' },
  { char: '📚', keywords: ['책', '공부', '독서'], category: 'activity' },
  { char: '✏️', keywords: ['연필', '쓰기', '공부'], category: 'activity' },

  // 사물/기호
  { char: '🔥', keywords: ['불', '열정', 'fire'], category: 'object' },
  { char: '💥', keywords: ['폭발', '충돌'], category: 'object' },
  { char: '⚡', keywords: ['번개', '에너지'], category: 'object' },
  { char: '✨', keywords: ['반짝', '특별'], category: 'object' },
  { char: '⭐', keywords: ['별', '스타'], category: 'object' },
  { char: '💯', keywords: ['100점', '완벽'], category: 'object' },
  { char: '❤️', keywords: ['하트', '사랑'], category: 'object' },
  { char: '💔', keywords: ['상처', '깨진하트', '이별'], category: 'object' },
  { char: '🎉', keywords: ['축하', '폭죽', '파티'], category: 'object' },
  { char: '🎁', keywords: ['선물', '보상'], category: 'object' },
  { char: '🏆', keywords: ['트로피', '우승', '성취'], category: 'object' },
  { char: '🔨', keywords: ['망치', '도구'], category: 'object' },
  { char: '🛡️', keywords: ['방패', '보호'], category: 'object' },

  // 자연
  { char: '🌧️', keywords: ['비', '울적', 'rain'], category: 'nature' },
  { char: '☔', keywords: ['우산', '비'], category: 'nature' },
  { char: '🌈', keywords: ['무지개', '희망'], category: 'nature' },
  { char: '☀️', keywords: ['해', '맑음', 'sun'], category: 'nature' },
  { char: '🌙', keywords: ['달', '밤'], category: 'nature' },
  { char: '🌸', keywords: ['벚꽃', '꽃'], category: 'nature' },
  { char: '🌱', keywords: ['새싹', '성장'], category: 'nature' },

  // 기호
  { char: '✅', keywords: ['체크', '완료'], category: 'symbol' },
  { char: '❌', keywords: ['엑스', '아니오'], category: 'symbol' },
  { char: '⚠️', keywords: ['경고', '주의'], category: 'symbol' },
  { char: '🚫', keywords: ['금지', '안됨'], category: 'symbol' },
];

/**
 * 키워드 기반 이모지 검색
 * - 빈 쿼리: 전체 반환
 * - 일치: keywords 또는 category 라벨에 부분 일치 (대소문자 무시)
 */
export function searchEmojis(query: string): EmojiEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return EMOJI_LIST;

  return EMOJI_LIST.filter((e) => {
    if (e.keywords.some((k) => k.toLowerCase().includes(q))) return true;
    if (EMOJI_CATEGORY_LABELS[e.category].includes(q)) return true;
    return false;
  });
}

export function groupByCategory(
  entries: EmojiEntry[],
): Array<{ category: EmojiCategory; label: string; items: EmojiEntry[] }> {
  const groups = new Map<EmojiCategory, EmojiEntry[]>();
  for (const e of entries) {
    const arr = groups.get(e.category) ?? [];
    arr.push(e);
    groups.set(e.category, arr);
  }
  // EMOJI_CATEGORY_LABELS의 키 순서대로 정렬
  return (Object.keys(EMOJI_CATEGORY_LABELS) as EmojiCategory[])
    .filter((cat) => groups.has(cat))
    .map((cat) => ({
      category: cat,
      label: EMOJI_CATEGORY_LABELS[cat],
      items: groups.get(cat)!,
    }));
}
