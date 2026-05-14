import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** 본문 영역에 패딩을 줄지 (기본 true) */
  padded?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  padded = true,
}: BottomSheetProps) {
  // 열려있을 때 body 스크롤 잠금 + ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
        className="relative w-full max-w-md bg-white rounded-t-2xl pb-8 animate-slide-up max-h-[90vh] flex flex-col"
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1 bg-gray-200 rounded-full" />
        </div>
        {/* 헤더 */}
        {title && (
          <div className="px-6 pt-4 pb-2 shrink-0">
            <h2 id="sheet-title" className="text-title-2 text-gray-900">
              {title}
            </h2>
          </div>
        )}
        {/* 본문 */}
        <div className={`flex-1 overflow-y-auto ${padded ? 'px-6 pt-2' : ''}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
