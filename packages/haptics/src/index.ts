/**
 * 햅틱 피드백 유틸
 *
 * - Vibration API: Android Chrome, 일부 데스크톱 — navigator.vibrate
 * - iOS 사파리: Vibration API 미지원 → 무음. (대안은 WebKit 비공개 API 정도)
 * - 데스크톱: 진동 미지원 → 무음. 시각·청각 효과로 보완.
 *
 * 모든 함수는 미지원 환경에서도 throw 없이 안전하게 동작.
 */

const canVibrate = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.vibrate === 'function';
};

const vibrate = (pattern: number | number[]): boolean => {
  if (!canVibrate()) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
};

/** 망치 한 번 두드릴 때 — 짧고 또렷한 탁! */
export const tapHaptic = (): void => {
  vibrate(15);
};

/** 망치 두드림 강도를 진행률에 따라 점점 강하게 */
export const progressiveTapHaptic = (progress: number): void => {
  // progress 0 → 1
  const duration = Math.round(10 + progress * 25); // 10ms → 35ms
  vibrate(duration);
};

/** 폭죽 터질 때 — 화려한 패턴 */
export const celebrationHaptic = (): void => {
  vibrate([20, 40, 20, 40, 60]);
};

/** 도중에 손 뗐을 때 (취소) — 부드러운 한 번 */
export const cancelHaptic = (): void => {
  vibrate(8);
};

/** 모든 진동 정지 */
export const stopHaptic = (): void => {
  if (canVibrate()) {
    try {
      navigator.vibrate(0);
    } catch {
      /* noop */
    }
  }
};

export const isHapticSupported = canVibrate;
