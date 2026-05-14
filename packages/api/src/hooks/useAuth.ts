import { useEffect } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';
import type { Session, User } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { getSupabaseClient } from '../client';

// ============================================================================
// 세션 상태 (Jotai)
// ============================================================================

export const sessionAtom = atom<Session | null>(null);
export const sessionLoadingAtom = atom<boolean>(true);

export const userAtom = atom<User | null>((get) => get(sessionAtom)?.user ?? null);

export const isAuthenticatedAtom = atom<boolean>((get) => get(sessionAtom) !== null);

// ============================================================================
// 세션 초기화 훅 — 앱 루트에서 한 번 호출
// ============================================================================

export function useInitSession() {
  const [, setSession] = useAtom(sessionAtom);
  const [, setLoading] = useAtom(sessionLoadingAtom);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .finally(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
    // setSession/setLoading은 jotai setter라 안정적
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ============================================================================
// 현재 사용자 조회
// ============================================================================

export function useSession() {
  const session = useAtomValue(sessionAtom);
  const loading = useAtomValue(sessionLoadingAtom);
  return { session, user: session?.user ?? null, loading };
}

// ============================================================================
// 로그인 — Google OAuth
// ============================================================================

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async (redirectTo?: string) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// 로그인 — 이메일 매직링크 (비밀번호 없음)
// ============================================================================

export function useSignInWithEmail() {
  return useMutation({
    mutationFn: async ({
      email,
      redirectTo,
    }: {
      email: string;
      redirectTo?: string;
    }) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            redirectTo ?? `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// 로그아웃
// ============================================================================

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}
