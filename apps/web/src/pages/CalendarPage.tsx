import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMonthlyRecords, useSession } from '@chamapp/api';

export function CalendarPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  const { data: records = [] } = useMonthlyRecords(year, month);

  if (loading) return null;
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      <button
        onClick={() => navigate('/main')}
        className="self-start text-caption-1 text-gray-500 mb-4"
      >
        ← 돌아가기
      </button>
      <h1 className="text-display-2 text-gray-900 mb-2">
        {year}년 {month}월
      </h1>
      <p className="text-body-2 text-gray-500 mb-8">
        이번 달 {records.length}번 참았어요
      </p>

      {/* TODO: 실제 달력 UI는 다음 단계에서 구현 */}
      <div className="flex flex-col gap-2">
        {records.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-md"
          >
            <span className="text-2xl">{r.item_emoji_snapshot}</span>
            <div className="flex-1">
              <p className="text-body-2 font-medium">
                {r.item_label_snapshot}
              </p>
              <p className="text-caption-2 text-gray-500">
                {new Date(r.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <p className="text-center text-gray-400 py-12">
            아직 기록이 없어요
          </p>
        )}
      </div>
    </div>
  );
}
