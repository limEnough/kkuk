import messages from './messages.json';

export interface CheerMessage {
  id: string;
  category: string; // 'food', 'anger' 등 또는 'general'
  content: string;
}

/**
 * 응원 메시지 셀렉션 규칙:
 * - 기본 제공 항목(category 있음) → 해당 카테고리 메시지에서 랜덤
 * - 사용자 추가 항목(category 없음) → 전체에서 랜덤
 * - 카테고리에 메시지가 없으면 'general'로 폴백
 */
export function pickCheerMessage(category?: string | null): CheerMessage {
  const all = messages as CheerMessage[];

  if (!category) {
    // 사용자 추가 항목: 전체에서 랜덤
    return pickRandom(all);
  }

  const grouped = all.filter((m) => m.category === category);
  if (grouped.length > 0) {
    return pickRandom(grouped);
  }

  // 폴백: general 카테고리
  const general = all.filter((m) => m.category === 'general');
  if (general.length > 0) {
    return pickRandom(general);
  }

  return pickRandom(all);
}

function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx]!;
}

export function getMessagesByCategory(category: string): CheerMessage[] {
  return (messages as CheerMessage[]).filter((m) => m.category === category);
}

export function getAllMessages(): CheerMessage[] {
  return messages as CheerMessage[];
}
