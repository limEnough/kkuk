import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMonthlyRecords, useRecentRecords, useSession } from "@chamapp/api";

interface ItemGroup {
  emoji: string;
  label: string;
  count: number;
  lastAt: string;
}

interface TopItem {
  emoji: string;
  label: string;
  count: number;
}

interface MonthBucket {
  year: number;
  month: number; // 1~12
  total: number;
  top: TopItem | null;
}

const CHART_MONTHS = 12;

export function CalendarPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const [view, setView] = useState({ year: nowYear, month: nowMonth });
  const { year, month } = view;

  const { data: records = [] } = useMonthlyRecords(year, month);
  const { data: recentRecords = [] } = useRecentRecords(CHART_MONTHS);

  // 최근 12개월 버킷: 월별 총 횟수 + 가장 많이 참은 항목
  const buckets = useMemo<MonthBucket[]>(() => {
    const list: MonthBucket[] = [];
    const tally = new Map<number, Map<string, TopItem>>();
    for (let i = CHART_MONTHS - 1; i >= 0; i--) {
      const d = new Date(nowYear, nowMonth - 1 - i, 1);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        total: 0,
        top: null,
      });
    }
    const idx = new Map(
      list.map((b, i) => [`${b.year}-${b.month}`, i] as const),
    );

    for (const r of recentRecords) {
      const d = new Date(r.created_at);
      const bi = idx.get(`${d.getFullYear()}-${d.getMonth() + 1}`);
      if (bi === undefined) continue;
      const bucket = list[bi];
      if (!bucket) continue;
      bucket.total += 1;
      let items = tally.get(bi);
      if (!items) {
        items = new Map();
        tally.set(bi, items);
      }
      const key = `${r.item_emoji_snapshot}|${r.item_label_snapshot}`;
      const cur = items.get(key);
      if (cur) cur.count += 1;
      else
        items.set(key, {
          emoji: r.item_emoji_snapshot,
          label: r.item_label_snapshot,
          count: 1,
        });
    }

    for (const [bi, items] of tally) {
      const bucket = list[bi];
      if (!bucket) continue;
      let top: TopItem | null = null;
      for (const v of items.values()) {
        if (!top || v.count > top.count) top = v;
      }
      bucket.top = top;
    }
    return list;
  }, [recentRecords, nowYear, nowMonth]);

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

  // 기록이 있는 월 집합 (최근 12개월 데이터 기준)
  const monthsWithRecords = useMemo(() => {
    const set = new Set<string>();
    for (const r of recentRecords) {
      const d = new Date(r.created_at);
      set.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
    }
    return set;
  }, [recentRecords]);

  const prev =
    month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next =
    month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  const isFuture = (y: number, m: number) =>
    y > nowYear || (y === nowYear && m > nowMonth);

  const canPrev = monthsWithRecords.has(`${prev.year}-${prev.month}`);
  const canNext =
    !isFuture(next.year, next.month) &&
    monthsWithRecords.has(`${next.year}-${next.month}`);

  if (loading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      <div className="flex items-center gap-1 mb-2 -ml-2">
        <button
          type="button"
          aria-label="이전 달"
          disabled={!canPrev}
          onClick={() => setView(prev)}
          className="flex items-center justify-center w-9 h-9 rounded-md text-gray-700 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-25 disabled:pointer-events-none"
        >
          <CaretLeft />
        </button>
        <h1 className="text-display-2 text-gray-900 px-1">
          {year}년 {month}월
        </h1>
        <button
          type="button"
          aria-label="다음 달"
          disabled={!canNext}
          onClick={() => setView(next)}
          className="flex items-center justify-center w-9 h-9 rounded-md text-gray-700 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-25 disabled:pointer-events-none"
        >
          <CaretRight />
        </button>
      </div>
      <p className="text-body-2 text-gray-500 mb-8">
        {month}월 {groups.length}개의 항목을 모두 {records.length}번 참았어요
      </p>

      <YearBarChart
        buckets={buckets}
        onSelectMonth={(y, m) => setView({ year: y, month: m })}
      />

      <div className="h-8" />

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

function CaretLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <polygon points="14.5 6.5 14.5 17.5 8 12" />
    </svg>
  );
}

function CaretRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <polygon points="9.5 6.5 9.5 17.5 16 12" />
    </svg>
  );
}

// ============================================================================
// 최근 12개월 막대그래프 (X: 월, Y: 참은 횟수) + 호버/터치 툴팁
// ============================================================================
function YearBarChart({
  buckets,
  onSelectMonth,
}: {
  buckets: MonthBucket[];
  onSelectMonth: (year: number, month: number) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...buckets.map((b) => b.total));
  const activeBucket = active === null ? null : buckets[active];

  // 모바일: 차트 바깥을 탭하면 툴팁 닫기 (hover가 없으므로)
  useEffect(() => {
    if (active === null) return;
    const onOutside = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setActive(null);
      }
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [active]);

  return (
    <div
      ref={containerRef}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setActive(null);
      }}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setActive(null);
        }
      }}
      className="rounded-lg bg-gray-50 px-4 pt-4 pb-3"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-caption-1 text-gray-500">최근 12개월</p>
        <p className="text-caption-2 text-gray-400">최대 {max}번</p>
      </div>

      <div className="relative pt-16">
        {/* 툴팁 */}
        {activeBucket && (
          <div
            className="absolute top-0 z-10 -translate-x-1/2"
            style={{ left: `${((active! + 0.5) / buckets.length) * 100}%` }}
          >
            <div className="min-w-[150px] max-w-[210px] rounded-md bg-gray-900 px-3 py-2 text-white shadow-floating">
              <p className="text-caption-2 text-gray-300">
                {activeBucket.year}.{activeBucket.month}
              </p>
              <p className="text-body-2 font-semibold">
                {activeBucket.total}번 참음
              </p>
              {activeBucket.top ? (
                <p className="mt-1 text-caption-1 text-gray-200">
                  <span className="mr-1">{activeBucket.top.emoji}</span>
                  {activeBucket.top.label} · {activeBucket.top.count}번
                </p>
              ) : (
                <p className="mt-1 text-caption-2 text-gray-400">기록 없음</p>
              )}
              {activeBucket.total > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectMonth(activeBucket.year, activeBucket.month);
                    setActive(null);
                  }}
                  className="mt-2 w-full rounded bg-white/10 hover:bg-white/20 active:bg-white/25 py-1.5 text-caption-1 font-medium text-white transition-colors"
                >
                  이 달 보기 →
                </button>
              )}
            </div>
          </div>
        )}

        {/* 막대 */}
        <div className="flex items-end gap-1 h-[140px]">
          {buckets.map((b, i) => {
            const h = b.total === 0 ? 0 : (b.total / max) * 100;
            const isActive = active === i;
            return (
              <button
                key={`${b.year}-${b.month}`}
                type="button"
                aria-label={`${b.year}년 ${b.month}월 ${b.total}번`}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setActive(i);
                }}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group flex-1 h-full flex items-end"
              >
                <span
                  className={`w-full rounded-t-sm transition-colors ${
                    b.total === 0
                      ? "bg-gray-200"
                      : isActive
                        ? "bg-blue-600"
                        : "bg-blue-400 group-hover:bg-blue-500"
                  }`}
                  style={{
                    height: b.total === 0 ? "3px" : `${Math.max(h, 4)}%`,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* X축 (월) */}
        <div className="flex gap-1 mt-2">
          {buckets.map((b, i) => (
            <span
              key={`${b.year}-${b.month}-label`}
              className={`flex-1 text-center text-caption-2 tabular-nums ${
                active === i ? "text-blue-600 font-semibold" : "text-gray-400"
              }`}
            >
              {b.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
