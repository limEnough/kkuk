import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession, useSignOut } from "@chamapp/api";
import { SideMenu } from "./SideMenu";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!user;
  const isOnLogin = location.pathname === "/login";
  const isMain = location.pathname === "/main";

  const handleBack = () => {
    // location.key가 'default'면 이 앱에서의 첫 진입(링크/직접 접속 등)이라
    // 돌아갈 SPA 히스토리가 없음 → 메인으로 보냄
    if (location.key === "default") {
      navigate("/main", { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleAuthClick = async () => {
    if (isLoggedIn) {
      await signOut.mutateAsync();
      navigate("/", { replace: true });
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-2 bg-white border-b border-gray-100">
        <div>
          {!(isMain && isLoggedIn) && (
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 active:scale-95 transition-all"
            >
              <BackIcon />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isOnLogin && (
            <button
              type="button"
              onClick={handleAuthClick}
              disabled={signOut.isPending}
              className="px-3 h-9 rounded-md text-caption-1 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoggedIn ? "로그아웃" : "로그인"}
            </button>
          )}
          {isLoggedIn && (
            <button
              type="button"
              aria-label="메뉴 열기"
              onClick={() => setMenuOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 active:scale-95 transition-all"
            >
              <HamburgerIcon />
            </button>
          )}
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function BackIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-900"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-900"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
