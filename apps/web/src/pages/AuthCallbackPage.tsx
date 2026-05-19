import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@chamapp/api';
import { useToast } from '@chamapp/ui';

/** 쿼리스트링과 해시 양쪽에서 파라미터를 읽는다 (GoTrue는 케이스에 따라 둘 다 사용) */
function readParam(name: string): string | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return search.get(name) ?? hash.get(name);
}

// PKCE 코드 교환은 보통 1~2초. 그 안에 세션이 안 잡히면 실패로 간주.
const EXCHANGE_TIMEOUT_MS = 7000;

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session, loading } = useSession();
  // 한 번 처리(이동)하면 다른 effect가 중복 실행하지 않도록 가드
  const handled = useRef(false);

  const finish = (to: string, message?: string) => {
    if (handled.current) return;
    handled.current = true;
    if (message) toast.show(message, 'error');
    navigate(to, { replace: true });
  };

  // 1) URL에 에러 파라미터가 있으면 즉시 처리 (만료/이미 사용됨 등)
  //    — 세션 로딩을 기다릴 필요 없이 가장 먼저 검사
  useEffect(() => {
    const error = readParam('error');
    const errorCode = readParam('error_code');
    const errorDesc = readParam('error_description');
    if (!error && !errorCode) return;

    const isExpired =
      errorCode === 'otp_expired' || error === 'access_denied';
    finish(
      '/login',
      isExpired
        ? '로그인 링크가 만료되었거나 이미 사용되었어요.\n새 링크를 받아 다시 시도해주세요. (메일 보안 검사가 링크를 미리 열면 만료될 수 있어요)'
        : decodeURIComponent(errorDesc ?? '').replace(/\+/g, ' ').trim() ||
            '로그인에 실패했어요. 다시 시도해주세요.',
    );
    // finish/navigate/toast는 안정적이므로 마운트 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 세션이 잡히면 메인으로. 코드 없이 들어온 경우 바로 로그인으로.
  useEffect(() => {
    if (handled.current || loading) return;
    if (session) {
      finish('/main');
      return;
    }
    // 세션도 없고 교환할 code도 없으면(직접 진입 등) 즉시 로그인으로
    const hasCode = readParam('code') !== null;
    if (!hasCode) finish('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading]);

  // 3) code는 있는데 제한 시간 내 세션이 안 잡히면 교환 실패로 안내
  useEffect(() => {
    const hasCode = readParam('code') !== null;
    if (!hasCode) return;
    const timer = window.setTimeout(() => {
      finish(
        '/login',
        '로그인 처리에 실패했어요.\n링크를 받은 것과 같은 브라우저에서 열었는지 확인하고 다시 시도해주세요.',
      );
    }, EXCHANGE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-full items-center justify-center bg-white">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
      <p className="mt-4 text-caption-1 text-gray-500">로그인 처리 중...</p>
    </div>
  );
}
