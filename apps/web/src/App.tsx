import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { createSupabaseClient, useInitSession } from '@chamapp/api';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { MainPage } from './pages/MainPage';
import { CalendarPage } from './pages/CalendarPage';
import { MyPage } from './pages/MyPage';

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
      <Route path="/" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
