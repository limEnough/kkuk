import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMonthlyRecords, useSession } from "@chamapp/api";

interface ItemGroup {
  emoji: string;
  label: string;
  count: number;
  lastAt: string;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  const { data: records = [] } = useMonthlyRecords(year, month);

  // 같은 항목(이모지+라벨 스냅샷)끼리 묶어 횟수 집계, 최근 순 정렬
  const groups = useMemo<ItemGroup[]>(() => {
    const map = new Map<string, ItemGroup>();
    for (const r of records) {
      const key = `${r.item_emoji_snapshot}|${r.item_label_snapshot}`;
      const g = map.get(key);
      if (g) {
        g.count += 1;
        if (r.created_at > g.lastAt) g.lastAt = r.created_at;
      } else {
        map.set(key, {
          emoji: r.item_emoji_snapshot,
          label: r.item_label_snapshot,
          count: 1,
          lastAt: r.created_at,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      b.lastAt.localeCompare(a.lastAt),
    );
  }, [records]);

  if (loading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      <h1 className="text-display-2 text-gray-900 mb-2">
        {year}년 {month}월
      </h1>
      <p className="text-body-2 text-gray-500 mb-8">
        이번 달 {groups.length}가지를 모두 {records.length}번 참았어요
      </p>

      {/* TODO: 실제 달력 UI는 다음 단계에서 구현 */}
      <div className="flex flex-col gap-2">
        {groups.map((g) => (
          <div
            key={`${g.emoji}|${g.label}`}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-md"
          >
            <span className="text-2xl">{g.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-body-2 font-medium truncate">{g.label}</p>
                {g.count > 1 && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-caption-2 font-semibold tabular-nums">
                    {g.count}번
                  </span>
                )}
              </div>
              <p className="text-caption-2 text-gray-500">
                마지막 {new Date(g.lastAt).toLocaleString("ko-KR")}
              </p>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-center text-gray-400 py-12">아직 기록이 없어요</p>
        )}
      </div>
    </div>
  );
}
