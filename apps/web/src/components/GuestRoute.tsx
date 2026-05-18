import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@chamapp/api';

/**
 * 비로그인 사용자 전용 라우트 가드.
 * 이미 로그인된 세션이 있으면 /main으로 돌려보낸다.
 * 세션 복원 중에는 로그인 폼이 깜빡이지 않도록 스피너를 보여준다.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
}
