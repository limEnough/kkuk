import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseLongPressOptions {
  /** 완료까지 필요한 시간 (ms). 기본 5000ms */
  duration?: number;
  /** 진행률 콜백 호출 주기 (ms). 기본 50ms */
  tickInterval?: number;
  /** 이동 허용 거리 (px). 이 이상 움직이면 취소. 기본 12 */
  moveThreshold?: number;
  /** 진행률 콜백 (0~1) */
  onProgress?: (progress: number) => void;
  /** 시작 콜백 */
  onStart?: () => void;
  /** 완료 콜백 (5초 풀로 채움) */
  onComplete?: () => void;
  /** 중도 취소 콜백 (손 뗌, 영역 벗어남, 움직임) */
  onCancel?: (progress: number) => void;
  /** 비활성화 */
  disabled?: boolean;
}

export interface LongPressHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export interface UseLongPressReturn {
  handlers: LongPressHandlers;
  /** 현재 진행률 (0~1) */
  progress: number;
  /** 현재 누르고 있는지 */
  isPressing: boolean;
}

/**
 * 꾹 누르기 훅 — pointer events로 마우스/터치/펜 통합 처리
 *
 * 동작:
 * 1. pointerdown → 타이머와 진행률 추적 시작, onStart 호출
 * 2. tickInterval마다 onProgress 호출
 * 3. duration 도달 시 onComplete 호출 (자동 완료)
 * 4. duration 전 손 뗌 → onCancel(진행률)
 * 5. moveThreshold 이상 움직임 → onCancel
 * 6. 컨텍스트 메뉴(우클릭, 길게 터치) 차단
 */
export function useLongPress({
  duration = 5000,
  tickInterval = 50,
  moveThreshold = 12,
  onProgress,
  onStart,
  onComplete,
  onCancel,
  disabled = false,
}: UseLongPressOptions = {}): UseLongPressReturn {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef<number>(0);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const start = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;

      startTimeRef.current = performance.now();
      startPosRef.current = { x: e.clientX, y: e.clientY };
      completedRef.current = false;
      setIsPressing(true);
      setProgress(0);
      onStart?.();

      intervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTimeRef.current;
        const p = Math.min(elapsed / duration, 1);
        setProgress(p);
        onProgress?.(p);

        if (p >= 1 && !completedRef.current) {
          completedRef.current = true;
          cleanup();
          setIsPressing(false);
          onComplete?.();
        }
      }, tickInterval);
    },
    [disabled, duration, tickInterval, onProgress, onStart, onComplete, cleanup],
  );

  const cancel = useCallback(() => {
    if (!isPressing || completedRef.current) {
      cleanup();
      setIsPressing(false);
      return;
    }

    const elapsed = performance.now() - startTimeRef.current;
    const finalProgress = Math.min(elapsed / duration, 1);
    cleanup();
    setIsPressing(false);
    setProgress(0);
    onCancel?.(finalProgress);
  }, [isPressing, duration, onCancel, cleanup]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPressing || !startPosRef.current) return;
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      if (dx * dx + dy * dy > moveThreshold * moveThreshold) {
        cancel();
      }
    },
    [isPressing, moveThreshold, cancel],
  );

  return {
    handlers: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onPointerMove,
      onContextMenu: (e) => e.preventDefault(),
    },
    progress,
    isPressing,
  };
}
