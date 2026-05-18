import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'error' | 'success' | 'info';

export interface ToastOptions {
  /** 자동 닫힘까지의 시간(ms). 기본 4000 */
  duration?: number;
}

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (
    message: string,
    variant?: ToastVariant,
    options?: ToastOptions,
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** 토스트를 띄우는 훅. <ToastProvider> 하위에서만 사용 가능. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast()는 <ToastProvider> 안에서만 사용할 수 있어요.');
  }
  return ctx;
}

const DEFAULT_DURATION = 4000;

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (
      message: string,
      variant: ToastVariant = 'error',
      options?: ToastOptions,
    ) => {
      const id = (idRef.current += 1);
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(
        () => dismiss(id),
        options?.duration ?? DEFAULT_DURATION,
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {toasts.map((t) => (
              <ToastCard
                key={t.id}
                toast={t}
                onClose={() => dismiss(t.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

const variantAccent: Record<ToastVariant, string> = {
  error: 'text-error',
  success: 'text-success',
  info: 'text-blue-400',
};

const variantIcon: Record<ToastVariant, string> = {
  error: '!',
  success: '✓',
  info: 'i',
};

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  // 마운트 직후 한 프레임 뒤에 보이도록 해서 진입 애니메이션을 보장
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-md bg-gray-900 px-4 py-3 text-white shadow-floating transition-all duration-200 ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-caption-2 font-bold ${variantAccent[toast.variant]}`}
      >
        {variantIcon[toast.variant]}
      </span>
      <p className="flex-1 whitespace-pre-line text-body-2 leading-snug">
        {toast.message}
      </p>
      <button
        type="button"
        aria-label="알림 닫기"
        onClick={onClose}
        className="-mr-1 -mt-0.5 shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
