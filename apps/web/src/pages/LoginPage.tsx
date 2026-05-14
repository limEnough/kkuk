import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSignInWithEmail, useSignInWithGoogle } from '@chamapp/api';
import { Button, Input } from '@chamapp/ui';

interface EmailForm {
  email: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const signInGoogle = useSignInWithGoogle();
  const signInEmail = useSignInWithEmail();
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<EmailForm>();

  const onEmailSubmit = async ({ email }: EmailForm) => {
    await signInEmail.mutateAsync({ email });
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="flex flex-col min-h-screen bg-white px-6 py-12 items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-8">
          <span className="text-4xl">📬</span>
        </div>
        <h1 className="text-title-1 text-gray-900 mb-3">이메일을 확인해주세요</h1>
        <p className="text-body-2 text-gray-600 mb-8">
          로그인 링크를 보내드렸어요.
          <br />
          링크를 누르면 자동으로 로그인됩니다.
        </p>
        <Button variant="tertiary" onClick={() => setEmailSent(false)}>
          다시 보내기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12">
      <div className="mb-12">
        <h1 className="text-display-2 text-gray-900 mb-2">로그인</h1>
        <p className="text-body-2 text-gray-600">
          기록을 이어가려면 로그인해주세요
        </p>
      </div>

      {/* Google 로그인 */}
      <button
        onClick={() => signInGoogle.mutate(undefined)}
        disabled={signInGoogle.isPending}
        className="flex items-center justify-center gap-3 w-full h-14 rounded-md bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all text-subtitle text-gray-900 disabled:opacity-50"
      >
        <GoogleIcon />
        Google로 계속하기
      </button>

      {/* 구분선 */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-caption-1 text-gray-400">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 이메일 매직링크 */}
      <form onSubmit={handleSubmit(onEmailSubmit)} className="flex flex-col gap-4">
        <Input
          type="email"
          label="이메일"
          placeholder="you@example.com"
          {...register('email', {
            required: '이메일을 입력해주세요',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '올바른 이메일 형식이 아니에요',
            },
          })}
          error={errors.email?.message}
        />
        <Button type="submit" fullWidth disabled={signInEmail.isPending}>
          {signInEmail.isPending ? '전송 중...' : '이메일로 로그인 링크 받기'}
        </Button>
      </form>

      <button
        onClick={() => navigate(-1)}
        className="mt-8 text-caption-1 text-gray-500 hover:text-gray-700"
      >
        ← 돌아가기
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC04"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
