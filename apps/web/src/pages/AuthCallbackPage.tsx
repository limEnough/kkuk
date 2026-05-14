import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@chamapp/api';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (session) {
      navigate('/main', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [session, loading, navigate]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
      <p className="mt-4 text-caption-1 text-gray-500">로그인 처리 중...</p>
    </div>
  );
}
