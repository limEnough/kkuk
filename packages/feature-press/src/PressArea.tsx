import { useEffect, useRef, useState } from 'react';
import {
  cancelHaptic,
  celebrationHaptic,
  progressiveTapHaptic,
} from '@chamapp/haptics';
import { useLongPress } from './useLongPress';

export interface PressAreaProps {
  /** 항목 이모지 (예: '🍗') */
  emoji: string;
  /** 항목 라벨 (예: '야식 참기') */
  label: string;
  /** 항목 부제 (예: '배달앱을 켜? 말아?') */
  subText?: string | null;
  /** 망치 이미지 URL */
  hammerImageUrl: string;
  /** 누르기 완료까지의 시간. 기본 5000ms */
  duration?: number;
  /** 완료 콜백 (5초 풀로 채움) */
  onComplete: (durationMs: number) => void;
  /** 도중에 손 뗀 경우 콜백 (선택) */
  onCancel?: (progress: number) => void;
}

/**
 * 꾹 누르기 핵심 컴포넌트
 *
 * 시각 연출:
 * - 이모지가 진행률에 따라 점점 투명해짐 (1 → 0.15)
 * - 누르는 동안 이모지가 살짝 흔들림 (CSS animation)
 * - 망치가 위에서 내려와 두드림 (약 750ms 주기)
 * - 햅틱: 두드림 타이밍에 진동
 * - 완료 시 폭죽
 */
export function PressArea({
  emoji,
  label,
  subText,
  hammerImageUrl,
  duration = 5000,
  onComplete,
  onCancel,
}: PressAreaProps) {
  const lastTapRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [hammerVisible, setHammerVisible] = useState(false);
  const [hammerKey, setHammerKey] = useState(0);

  // 완료 직후 폭죽 표시
  const [showFirework, setShowFirework] = useState(false);

  const { handlers, progress, isPressing } = useLongPress({
    duration,
    tickInterval: 50,
    moveThreshold: 16,
    onStart: () => {
      startTimeRef.current = performance.now();
      lastTapRef.current = 0;
      setHammerVisible(true);
    },
    onProgress: (p) => {
      // 망치는 약 600~750ms 주기로 두드림 (5초 동안 ~7번)
      const tapInterval = 700;
      const now = performance.now();
      if (now - lastTapRef.current >= tapInterval) {
        lastTapRef.current = now;
        setHammerKey((k) => k + 1); // 애니메이션 재시작
        progressiveTapHaptic(p);
      }
    },
    onComplete: () => {
      setHammerVisible(false);
      celebrationHaptic();
      setShowFirework(true);
      // 폭죽 끝난 뒤 onComplete 콜백
      const actualDuration = performance.now() - startTimeRef.current;
      window.setTimeout(() => {
        setShowFirework(false);
        onComplete(actualDuration);
      }, 900);
    },
    onCancel: (p) => {
      setHammerVisible(false);
      cancelHaptic();
      onCancel?.(p);
    },
  });

  // 이모지 투명도: 1 → 0.15 (완전히 사라지진 않음)
  const emojiOpacity = 1 - progress * 0.85;

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      <p className="text-subtitle text-gray-700">{label}</p>
      {subText && (
        <p className="text-body-2 text-gray-500 mt-1">{subText}</p>
      )}
      <p className="text-caption-1 text-gray-400 mt-3 mb-10">
        {isPressing ? '계속 꾹 눌러주세요' : '아래 영역을 꾹 눌러보세요'}
      </p>

      {/* 누르기 영역 */}
      <div
        {...handlers}
        role="button"
        tabIndex={0}
        aria-label={`${label}을(를) 위해 꾹 누르기`}
        className="relative flex items-center justify-center w-64 h-64 rounded-full bg-gray-50 cursor-pointer touch-none"
        style={{
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'none',
        }}
      >
        {/* 진행률 링 (SVG) */}
        <ProgressRing progress={progress} />

        {/* 이모지 (흔들림 + 흐려짐) */}
        <div
          className="text-8xl transition-opacity duration-100"
          style={{
            opacity: emojiOpacity,
            animation: isPressing ? 'shake-soft 0.12s ease-in-out infinite' : 'none',
          }}
        >
          {emoji}
        </div>

        {/* 망치 (두드릴 때마다 hammerKey 변경으로 애니메이션 재시작) */}
        {hammerVisible && (
          <img
            key={hammerKey}
            src={hammerImageUrl}
            alt=""
            aria-hidden
            className="absolute -top-4 right-4 w-24 h-24 pointer-events-none"
            style={{
              animation: 'hammer-tap 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: '80% 90%',
            }}
          />
        )}

        {/* 폭죽 */}
        {showFirework && <Firework />}
      </div>

      {/* 진행률 % */}
      <div className="mt-8 h-6">
        {isPressing && (
          <span className="text-caption-1 text-gray-500 tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 진행률 링
// ============================================================================
function ProgressRing({ progress }: { progress: number }) {
  const radius = 124;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg
      className="absolute inset-0 -rotate-90"
      width="100%"
      height="100%"
      viewBox="0 0 256 256"
    >
      <circle
        cx="128"
        cy="128"
        r={radius}
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        className="text-gray-200"
      />
      <circle
        cx="128"
        cy="128"
        r={radius}
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-blue-500 transition-[stroke-dashoffset] duration-100 ease-out"
      />
    </svg>
  );
}

// ============================================================================
// 폭죽 (간단한 파티클)
// ============================================================================
function Firework() {
  const particles = Array.from({ length: 16 });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 80 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const colors = ['#3182F6', '#22C55E', '#F59E0B', '#EF4444'];
        const color = colors[i % colors.length];

        return (
          <span
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              animation: `firework 0.9s ease-out forwards`,
              ['--tx' as never]: `${tx}px`,
              ['--ty' as never]: `${ty}px`,
            }}
          />
        );
      })}
    </div>
  );
}
