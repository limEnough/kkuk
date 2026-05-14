import { useMemo, useState } from 'react';
import { groupByCategory, searchEmojis } from './emoji-data';

export interface EmojiPickerProps {
  /** 현재 선택된 이모지 (단일) */
  value: string | null;
  /** 선택 시 호출 */
  onChange: (emoji: string) => void;
  /** 최대 높이 (스크롤 영역). 기본 320px */
  maxHeight?: number;
}

/**
 * 검색 가능한 이모지 셀렉터 (단일 선택)
 *
 * - 상단: 검색 인풋 (한글/영문 키워드)
 * - 본문: 카테고리별로 그룹핑된 이모지 그리드
 * - 선택: 클릭 즉시 onChange (단일 선택)
 */
export function EmojiPicker({
  value,
  onChange,
  maxHeight = 320,
}: EmojiPickerProps) {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const filtered = searchEmojis(query);
    return groupByCategory(filtered);
  }, [query]);

  const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="flex flex-col gap-3">
      {/* 검색 인풋 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이모지 검색 (예: 음식, 화남, smile)"
          className="
            w-full h-11 pl-10 pr-4 rounded-md
            bg-gray-100 text-body-2 text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
          "
        />
        <SearchIcon />
        {query && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* 결과 영역 */}
      <div
        className="overflow-y-auto pr-1 -mr-1"
        style={{ maxHeight }}
      >
        {totalCount === 0 ? (
          <p className="text-center text-caption-1 text-gray-400 py-12">
            검색 결과가 없어요
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.category}>
                <p className="text-caption-2 text-gray-500 mb-2 font-medium">
                  {group.label}
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {group.items.map((entry) => {
                    const selected = value === entry.char;
                    return (
                      <button
                        key={entry.char}
                        type="button"
                        onClick={() => onChange(entry.char)}
                        aria-label={entry.keywords[0] ?? entry.char}
                        aria-pressed={selected}
                        className={`
                          aspect-square flex items-center justify-center rounded-md text-2xl
                          transition-all active:scale-95
                          ${
                            selected
                              ? 'bg-blue-50 ring-2 ring-blue-500'
                              : 'hover:bg-gray-100'
                          }
                        `}
                      >
                        {entry.char}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
