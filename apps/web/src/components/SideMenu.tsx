import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useProfile, useSession, useSignOut } from '@chamapp/api';

export interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const signOut = useSignOut();

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

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    onClose();
    navigate('/');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-fade-in"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="relative w-72 max-w-[80vw] h-full bg-white animate-slide-in-right flex flex-col"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
          <span className="text-subtitle text-gray-900">
            {profile?.nickname ?? '내 메뉴'}
          </span>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 active:scale-95 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <MenuRow label="메인" onClick={() => go('/main')} />
          <MenuRow label="달력" onClick={() => go('/calendar')} />
          <MenuRow label="마이페이지" onClick={() => go('/my')} />
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signOut.isPending}
            className="w-full py-3 text-caption-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            로그아웃
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <span className="text-body-1 text-gray-900">{label}</span>
      <span className="text-gray-400">›</span>
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-900"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}
