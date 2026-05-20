import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { createSupabaseClient, useInitSession } from '@chamapp/api';
import { ToastProvider } from '@chamapp/ui';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { MainPage } from './pages/MainPage';
import { CalendarPage } from './pages/CalendarPage';
import { MyPage } from './pages/MyPage';
import { AccountPage } from './pages/AccountPage';
import { HammerSelectPage } from './pages/HammerSelectPage';
import { ItemManagePage } from './pages/ItemManagePage';
import { CollectedMessagesPage } from './pages/CollectedMessagesPage';
import { Layout } from './components/Layout';
import { GuestRoute } from './components/GuestRoute';

// Supabase 클라이언트 초기화
createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  useInitSession();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestRoute>
            <OnboardingPage />
          </GuestRoute>
        }
      />
      <Route element={<Layout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        {/* 가입 중에는 OTP 검증으로 세션이 생기므로 GuestRoute로 감싸지 않음 */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/messages" element={<CollectedMessagesPage />} />
        <Route path="/hammers" element={<HammerSelectPage />} />
        <Route path="/items" element={<ItemManagePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/my" element={<MyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            {/* 모바일 전용 적응형 셸: PC에선 가운데 폰 너비 컬럼, 양옆은 연회색 */}
            <div className="min-h-screen bg-gray-100 flex justify-center">
              <div className="w-full max-w-[480px] min-h-screen bg-white shadow-card">
                <AppContent />
              </div>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
