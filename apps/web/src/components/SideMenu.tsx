import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile, useSession, useSignOut } from "@chamapp/api";

export interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

interface MenuLeaf {
  label: string;
  path: string;
}
interface MenuGroup {
  key: string;
  label: string;
  children: MenuLeaf[];
}

const GROUPS: MenuGroup[] = [
  {
    key: "records",
    label: "내 기록",
    children: [
      { label: "캘린더 보기", path: "/calendar" },
      { label: "획득한 문장", path: "/messages" },
    ],
  },
  {
    key: "settings",
    label: "설정하기",
    children: [
      { label: "망치 선택", path: "/hammers" },
      { label: "참을 항목 관리", path: "/items" },
      { label: "계정 관리", path: "/account" },
    ],
  },
];

export function SideMenu({ open, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const signOut = useSignOut();

  // 현재 경로가 속한 그룹은 펼친 채로 시작
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      GROUPS.map((g) => [
        g.key,
        g.children.some((c) => c.path === location.pathname),
      ]),
    ),
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    onClose();
    navigate("/", { replace: true });
  };

  const nickname = profile?.nickname?.trim();

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-fade-in"
      />
      {/* 가운데 폰 컬럼에 맞춰 드로어 정렬 (PC에서도 컬럼 우측 끝에 붙음) */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="relative w-full max-w-[480px] h-full flex justify-end">
          <aside
            role="dialog"
            aria-modal="true"
            className="pointer-events-auto relative w-72 max-w-[80vw] h-full bg-white animate-slide-in-right flex flex-col"
          >
        <div className="flex items-center justify-end h-12 px-2 shrink-0">
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 active:scale-95 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 닉네임 헤더 → 계정 관리 */}
        <button
          type="button"
          onClick={() => go("/account")}
          className="flex items-center justify-between gap-2 mx-3 mb-2 px-4 py-4 rounded-lg bg-gray-50 hover:bg-gray-100 active:scale-[0.99] transition-all text-left"
        >
          <div className="min-w-0">
            <p className="text-subtitle text-gray-900 truncate">
              {nickname ? `${nickname}님, 반가워요` : "닉네임을 설정해주세요"}
            </p>
            <p className="text-caption-2 text-gray-500 mt-0.5">계정 관리</p>
          </div>
          <span className="text-gray-400 shrink-0">›</span>
        </button>

        <nav className="flex-1 overflow-y-auto py-2">
          {GROUPS.map((group) => {
            const expanded = !!openGroups[group.key];
            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={expanded}
                  className="flex items-center justify-between w-full px-6 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-body-1 font-semibold text-gray-900">
                    {group.label}
                  </span>
                  <Chevron expanded={expanded} />
                </button>
                {expanded && (
                  <div className="pb-1">
                    {group.children.map((leaf) => {
                      const active = location.pathname === leaf.path;
                      return (
                        <button
                          key={leaf.path}
                          type="button"
                          onClick={() => go(leaf.path)}
                          className={`flex items-center w-full pl-10 pr-6 py-3 text-left transition-colors ${
                            active
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                          }`}
                        >
                          <span className="text-body-2">{leaf.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4 shrink-0">
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
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-gray-400 transition-transform ${
        expanded ? "rotate-180" : ""
      }`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
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
