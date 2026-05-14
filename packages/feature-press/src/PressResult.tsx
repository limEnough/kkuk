import { useEffect, useState } from 'react';

export interface PressResultProps {
  /** 참은 항목 이모지 */
  emoji: string;
  /** 참은 항목 라벨 */
  label: string;
  /** 응원 메시지 */
  message: string;
  /** 다시하기 클릭 */
  onAgain: () => void;
  /** 캘린더로 이동 (로그인 시) */
  onGoCalendar?: () => void;
  /** 회원가입 유도 클릭 (비로그인 시) */
  onSignUp?: () => void;
  /** 비로그인 여부 */
  isGuest: boolean;
}

/**
 * 꾹 누르기 완료 후 결과 화면
 * Toss 스타일: 단순한 시트, 큰 메시지, 명확한 CTA
 */
export function PressResult({
  emoji,
  label,
  message,
  onAgain,
  onGoCalendar,
  onSignUp,
  isGuest,
}: PressResultProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12">
      {/* 상단 인디케이터 */}
      <div
        className={`flex flex-col items-center transition-all duration-500 ease-toss ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <span className="text-3xl">{emoji}</span>
        </div>
        <p className="text-caption-1 text-gray-500 mb-2">오늘 참은 것</p>
        <p className="text-subtitle text-gray-900">{label}</p>
      </div>

      {/* 응원 메시지 (가장 강조) */}
      <div
        className={`flex-1 flex items-center justify-center my-12 transition-all duration-700 delay-200 ease-toss ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <p className="text-display-2 text-gray-900 text-center leading-relaxed px-2">
          {message}
        </p>
      </div>

      {/* CTA */}
      <div
        className={`flex flex-col gap-3 transition-all duration-500 delay-500 ease-toss ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {isGuest ? (
          <>
            <button
              onClick={onSignUp}
              className="w-full h-14 rounded-md bg-blue-500 text-white text-subtitle hover:bg-blue-600 active:scale-[0.98] transition-transform"
            >
              로그인하고 기록 이어가기
            </button>
            <button
              onClick={onAgain}
              className="w-full h-14 rounded-md bg-gray-100 text-gray-800 text-subtitle hover:bg-gray-200 active:scale-[0.98] transition-transform"
            >
              한 번 더 참아보기
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onAgain}
              className="w-full h-14 rounded-md bg-blue-500 text-white text-subtitle hover:bg-blue-600 active:scale-[0.98] transition-transform"
            >
              한 번 더 참아보기
            </button>
            <button
              onClick={onGoCalendar}
              className="w-full h-14 rounded-md bg-gray-100 text-gray-800 text-subtitle hover:bg-gray-200 active:scale-[0.98] transition-transform"
            >
              내 기록 보기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
