import { useEffect } from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { Session, User } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
// 인증 에러 정규화
// ============================================================================

export type AuthErrorCode =
  | 'rate_limit'
  | 'invalid_otp'
  | 'invalid_email'
  | 'invalid_credentials'
  | 'weak_password'
  | 'account_google'
  | 'account_exists'
  | 'no_account'
  | 'incomplete'
  | 'network'
  | 'unknown';

/** UI에 그대로 노출 가능한, 코드가 붙은 인증 에러 */
export class AuthFlowError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthFlowError';
    this.code = code;
  }
}

/** Supabase auth 에러를 사용자 친화 메시지로 매핑 */
export function mapAuthError(error: unknown): AuthFlowError {
  const err = error as
    | { message?: string; status?: number; code?: string; name?: string }
    | undefined;
  const msg = (err?.message ?? '').toLowerCase();
  const status = err?.status;
  const code = err?.code;

  // Supabase 요청 제한(429). 두 종류를 구분:
  //  (a) 같은 이메일 짧은 쿨다운: "...you can only request this after N seconds"
  //  (b) 프로젝트 메일 발송 한도 초과(내장 메일 서비스 시간당 쿼터 등)
  const isRateLimited =
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('only request this after') ||
    msg.includes('too many requests');
  if (isRateLimited) {
    const afterSec = msg.match(/after (\d+)\s*seconds?/)?.[1];
    if (afterSec) {
      return new AuthFlowError(
        'rate_limit',
        `방금 인증 메일을 보냈어요.\n약 ${afterSec}초 후에 다시 요청할 수 있어요. 메일함(스팸함 포함)을 먼저 확인해주세요.`,
      );
    }
    return new AuthFlowError(
      'rate_limit',
      '인증 메일 발송 한도를 초과했어요.\n잠시 후(최대 1시간) 다시 시도해주세요. 반복되면 메일 발송(SMTP) 설정을 확인해야 해요.',
    );
  }

  // 인증 코드(OTP)가 틀렸거나 만료됨
  if (
    code === 'otp_expired' ||
    code === 'otp_disabled' ||
    msg.includes('token has expired') ||
    msg.includes('invalid otp') ||
    msg.includes('otp_expired') ||
    (msg.includes('token') && msg.includes('invalid'))
  ) {
    return new AuthFlowError(
      'invalid_otp',
      '인증 코드가 올바르지 않거나 만료되었어요.\n코드를 다시 확인하시거나 재전송해주세요.',
    );
  }

  // 이메일/비밀번호 로그인 실패
  if (
    code === 'invalid_credentials' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid email or password')
  ) {
    return new AuthFlowError(
      'invalid_credentials',
      '이메일 또는 비밀번호가 올바르지 않아요.',
    );
  }

  // 비밀번호가 보안 요건 미달 (서버측 정책)
  if (
    code === 'weak_password' ||
    msg.includes('password should be at least') ||
    msg.includes('weak password')
  ) {
    return new AuthFlowError(
      'weak_password',
      '비밀번호가 보안 요건을 충족하지 않아요.\n더 복잡한 비밀번호로 다시 설정해주세요.',
    );
  }

  // 이메일 형식/주소 문제
  if (
    code === 'validation_failed' ||
    msg.includes('invalid email') ||
    msg.includes('email address') ||
    msg.includes('unable to validate email')
  ) {
    return new AuthFlowError(
      'invalid_email',
      '이메일 주소를 다시 확인해주세요.',
    );
  }

  // 네트워크/연결 오류
  if (
    err?.name === 'TypeError' ||
    msg.includes('failed to fetch') ||
    msg.includes('network')
  ) {
    return new AuthFlowError(
      'network',
      '네트워크 연결을 확인하고 다시 시도해주세요.',
    );
  }

  return new AuthFlowError(
    'unknown',
    '요청을 처리하지 못했어요.\n잠시 후 다시 시도해주세요.',
  );
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
      if (error) throw mapAuthError(error);
      return data;
    },
  });
}

// ============================================================================
// 이메일 계정 상태 조회 (none|google|email_incomplete|email_complete)
// ============================================================================

export type EmailAccountStatus =
  | 'none'
  | 'google'
  | 'email_incomplete'
  | 'email_complete';

async function fetchEmailStatus(
  email: string,
): Promise<EmailAccountStatus | null> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.rpc('email_account_status', {
      p_email: email,
    });
    if (error || !data) return null;
    return data as EmailAccountStatus;
  } catch {
    return null;
  }
}

/** 이메일 상태를 단독 조회 (화면에서 사전 분기용) */
export function useEmailStatus() {
  return useMutation<EmailAccountStatus | null, AuthFlowError, { email: string }>(
    {
      mutationFn: ({ email }) => fetchEmailStatus(email),
    },
  );
}

// ============================================================================
// 회원가입 — 이메일 인증코드 발송
//   google / email_complete 이면 차단, none / email_incomplete 만 발송
// ============================================================================

export function useRequestSignupCode() {
  return useMutation<
    EmailAccountStatus | null,
    AuthFlowError,
    { email: string }
  >({
    mutationFn: async ({ email }) => {
      const status = await fetchEmailStatus(email);
      if (status === 'google') {
        throw new AuthFlowError(
          'account_google',
          '이미 Google로 가입된 이메일이에요.\n"Google로 계속하기"로 로그인해주세요.',
        );
      }
      if (status === 'email_complete') {
        throw new AuthFlowError(
          'account_exists',
          '이미 가입된 이메일이에요.\n비밀번호로 로그인해주세요.',
        );
      }
      // none | email_incomplete | null → 코드 발송 (신규 가입 / 가입 재개)
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw mapAuthError(error);
      return status;
    },
  });
}

// ============================================================================
// 회원가입 — 비밀번호 설정 (코드 인증으로 로그인된 상태에서 호출)
// ============================================================================

export function useSetPassword() {
  return useMutation<void, AuthFlowError, { password: string }>({
    mutationFn: async ({ password }) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw mapAuthError(error);
    },
  });
}

// ============================================================================
// 로그인 — 이메일 + 비밀번호
// ============================================================================

export function useSignInWithPassword() {
  const qc = useQueryClient();
  return useMutation<void, AuthFlowError, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      const status = await fetchEmailStatus(email);
      if (status === 'none') {
        throw new AuthFlowError(
          'no_account',
          '가입되지 않은 이메일이에요.\n"이메일로 가입하기"로 진행해주세요.',
        );
      }
      if (status === 'google') {
        throw new AuthFlowError(
          'account_google',
          'Google로 가입된 이메일이에요.\n"Google로 계속하기"로 로그인해주세요.',
        );
      }
      if (status === 'email_incomplete') {
        throw new AuthFlowError(
          'incomplete',
          '가입이 완료되지 않았어요.\n"이메일로 가입하기"에서 마저 진행해주세요.',
        );
      }
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw mapAuthError(error);
    },
    onSuccess: () => {
      // 이전 사용자 캐시 폐기
      qc.clear();
    },
  });
}

// ============================================================================
// 로그인 — 이메일 6자리 인증 코드 확인
// ============================================================================

export function useVerifyEmailOtp() {
  return useMutation<
    void,
    AuthFlowError,
    { email: string; token: string }
  >({
    mutationFn: async ({ email, token }) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: token.trim(),
        type: 'email',
      });
      if (error) throw mapAuthError(error);
    },
  });
}

// ============================================================================
// 로그아웃
// ============================================================================

export function useSignOut() {
  const qc = useQueryClient();
  const setSession = useSetAtom(sessionAtom);
  return useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseClient();
      // local: 이 브라우저의 저장된 세션(localStorage)만 제거
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // 저장된 세션/사용자 상태 즉시 비우고, 이전 사용자 데이터 캐시도 폐기
      setSession(null);
      qc.clear();
    },
  });
}
