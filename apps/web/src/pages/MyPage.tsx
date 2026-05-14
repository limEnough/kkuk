import { useNavigate } from 'react-router-dom';
import { useProfile, useSession, useSignOut } from '@chamapp/api';

export function MyPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const { data: profile } = useProfile(user?.id);
  const signOut = useSignOut();

  if (loading) return null;
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      <button
        onClick={() => navigate('/main')}
        className="self-start text-caption-1 text-gray-500 mb-4"
      >
        ← 돌아가기
      </button>

      <h1 className="text-display-2 text-gray-900 mb-8">
        {profile?.nickname ?? '닉네임을 설정해주세요'}
      </h1>

      <div className="flex flex-col gap-2">
        <MenuItem label="참을 항목 관리" onClick={() => {}} />
        <MenuItem label="망치 선택" onClick={() => {}} />
        <MenuItem label="획득한 문장" onClick={() => {}} />
        <MenuItem label="계정 관리" onClick={() => {}} />
      </div>

      <button
        onClick={handleSignOut}
        className="mt-auto py-4 text-caption-1 text-gray-400"
      >
        로그아웃
      </button>
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 active:scale-[0.98] transition-all"
    >
      <span className="text-body-1 text-gray-900">{label}</span>
      <span className="text-gray-400">›</span>
    </button>
  );
}
