import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getSupabaseClient,
  useRequestSignupCode,
  useSetPassword,
  useVerifyEmailOtp,
} from "@chamapp/api";
import { Button, Input, useToast } from "@chamapp/ui";

type Step = "email" | "code" | "password";

interface EmailForm {
  email: string;
}
interface CodeForm {
  code: string;
}
interface PasswordForm {
  password: string;
  confirm: string;
}

// 글자(한글/영문) + 숫자 + 특수문자 모두 포함, 6자 이상
// (Supabase의 Minimum password length=6 과 일치)
const PASSWORD_RULE =
  /^(?=.*[A-Za-z가-힣])(?=.*\d)(?=.*[^\sA-Za-z0-9가-힣]).{6,}$/;

// 이미 발송한 인증코드의 유효 기간 (Supabase의 OTP 유효시간 10분과 동일)
const OTP_VALID_MS = 10 * 60 * 1000; // 10분
const OTP_PENDING_KEY = "signup_pending_otp";

interface PendingOtp {
  email: string;
  expiresAt: number;
}

function readPendingOtp(): PendingOtp | null {
  try {
    const raw = window.localStorage.getItem(OTP_PENDING_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as PendingOtp;
    if (typeof v?.email !== "string" || typeof v?.expiresAt !== "number") {
      return null;
    }
    if (Date.now() >= v.expiresAt) return null;
    return v;
  } catch {
    return null;
  }
}

function writePendingOtp(email: string) {
  try {
    window.localStorage.setItem(
      OTP_PENDING_KEY,
      JSON.stringify({ email, expiresAt: Date.now() + OTP_VALID_MS }),
    );
  } catch {
    // localStorage 사용 불가(예: private mode) — 무시
  }
}

function clearPendingOtp() {
  try {
    window.localStorage.removeItem(OTP_PENDING_KEY);
  } catch {
    /* noop */
  }
}

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const requestCode = useRequestSignupCode();
  const verifyOtp = useVerifyEmailOtp();
  const setPassword = useSetPassword();

  // 로그인 화면에서 미완료/미가입으로 넘어온 경우 이메일·자동시작 전달
  const navState = (location.state ?? null) as {
    email?: string;
    autostart?: boolean;
  } | null;

  const [step, setStep] = useState<Step>("email");
  const [sentEmail, setSentEmail] = useState("");
  const completedRef = useRef(false);
  const autoStartedRef = useRef(false);

  const emailForm = useForm<EmailForm>({
    defaultValues: { email: navState?.email ?? "" },
  });
  const codeForm = useForm<CodeForm>();
  const pwForm = useForm<PasswordForm>();

  // 진입 시 이전(미완료) 세션 정리 → 항상 처음부터.
  // 완료 전 이탈 시에도 정리해서 "가입 미완료" 상태로 남기고 재진입 시 처음부터.
  useEffect(() => {
    getSupabaseClient().auth.signOut();
    return () => {
      if (!completedRef.current) getSupabaseClient().auth.signOut();
    };
  }, []);

  const onEmailSubmit = async ({ email }: EmailForm) => {
    // 같은 이메일로 이미 발송한 코드가 아직 유효하면 재발송 생략 → 바로 코드 입력 화면
    const pending = readPendingOtp();
    if (pending && pending.email.toLowerCase() === email.toLowerCase()) {
      toast.show(
        "유효한 인증코드가 있어요.\n메일로 받은 코드를 입력해주세요.",
        "info",
      );
      setSentEmail(pending.email);
      codeForm.reset();
      setStep("code");
      return;
    }
    try {
      await requestCode.mutateAsync({ email });
      writePendingOtp(email);
      setSentEmail(email);
      codeForm.reset();
      setStep("code");
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "코드 전송에 실패했어요.",
        "error",
      );
    }
  };

  // 로그인에서 미완료/미가입으로 넘어온 경우: 자동으로 인증코드 발송 시작
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (navState?.autostart && navState.email) {
      autoStartedRef.current = true;
      void onEmailSubmit({ email: navState.email });
    }
    // 최초 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResend = async () => {
    try {
      await requestCode.mutateAsync({ email: sentEmail });
      writePendingOtp(sentEmail);
      toast.show("인증 코드를 다시 보냈어요.", "success");
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "재전송에 실패했어요.",
        "error",
      );
    }
  };

  const onCodeSubmit = async ({ code }: CodeForm) => {
    try {
      await verifyOtp.mutateAsync({ email: sentEmail, token: code });
      clearPendingOtp(); // 코드 사용됨
      pwForm.reset();
      setStep("password");
    } catch (err) {
      codeForm.resetField("code");
      toast.show(
        err instanceof Error ? err.message : "인증에 실패했어요.",
        "error",
      );
    }
  };

  const onPasswordSubmit = async ({ password }: PasswordForm) => {
    try {
      await setPassword.mutateAsync({ password });
      completedRef.current = true; // 이후 unmount 시 세션 유지
      clearPendingOtp();
      toast.show("가입이 완료됐어요!", "success");
      navigate("/main", { replace: true });
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "가입 완료에 실패했어요.",
        "error",
      );
    }
  };

  // ── 3단계: 비밀번호 설정(계정 생성) ─────────────────────────────────
  if (step === "password") {
    return (
      <div className="flex flex-col min-h-full bg-white px-6 py-12">
        <div className="mb-10">
          <h1 className="text-display-2 text-gray-900 mb-2">계정 생성</h1>
          <p className="text-body-2 text-gray-600">
            로그인에 사용할 비밀번호를 설정해주세요
          </p>
        </div>

        <form
          onSubmit={pwForm.handleSubmit(onPasswordSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            type="email"
            label="이메일"
            value={sentEmail}
            disabled
            readOnly
          />
          <Input
            type="password"
            label="비밀번호"
            placeholder="영문/숫자/특수문자 포함 6자 이상"
            autoComplete="new-password"
            {...pwForm.register("password", {
              required: "비밀번호를 입력해주세요",
              pattern: {
                value: PASSWORD_RULE,
                message:
                  "영문/숫자/특수문자를 모두 포함해 6자 이상이어야 해요",
              },
            })}
            error={pwForm.formState.errors.password?.message}
          />
          <Input
            type="password"
            label="비밀번호 재확인"
            placeholder="비밀번호를 한 번 더 입력"
            autoComplete="new-password"
            {...pwForm.register("confirm", {
              required: "비밀번호를 한 번 더 입력해주세요",
              validate: (v) =>
                v === pwForm.getValues("password") ||
                "비밀번호가 일치하지 않아요",
            })}
            error={pwForm.formState.errors.confirm?.message}
          />
          <Button type="submit" fullWidth disabled={setPassword.isPending}>
            {setPassword.isPending ? "가입 처리 중..." : "가입 완료"}
          </Button>
        </form>

        <p className="mt-6 text-caption-2 text-gray-400 text-center">
          이 화면을 벗어나면 가입이 완료되지 않으며 처음부터 다시 진행해야 해요.
        </p>
      </div>
    );
  }

  // ── 2단계: 인증 코드 입력 ───────────────────────────────────────────
  if (step === "code") {
    return (
      <div className="flex flex-col min-h-full bg-white px-6 py-12">
        <div className="mb-10">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <span className="text-3xl">📬</span>
          </div>
          <h1 className="text-title-1 text-gray-900 mb-2">인증 코드 입력</h1>
          <p className="text-body-2 text-gray-600">
            <span className="text-gray-900 font-medium">{sentEmail}</span> 으로
            보낸
            <br />
            메일로 받은 6자리 인증 코드를 입력해주세요.
          </p>
        </div>

        <form
          onSubmit={codeForm.handleSubmit(onCodeSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            label="인증 코드"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            placeholder="000000"
            maxLength={6}
            className="text-center tracking-[0.4em] text-title-2"
            {...codeForm.register("code", {
              required: "인증 코드를 입력해주세요",
              pattern: {
                value: /^\d{6}$/,
                message: "6자리 숫자를 입력해주세요",
              },
            })}
            error={codeForm.formState.errors.code?.message}
          />
          <Button type="submit" fullWidth disabled={verifyOtp.isPending}>
            {verifyOtp.isPending ? "확인 중..." : "다음"}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1 mt-6 text-caption-1">
          <span className="text-gray-500">코드를 못 받으셨나요?</span>
          <button
            type="button"
            onClick={onResend}
            disabled={requestCode.isPending}
            className="text-blue-500 font-medium hover:text-blue-600 disabled:opacity-50"
          >
            {requestCode.isPending ? "전송 중..." : "다시 보내기"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setStep("email")}
          className="mt-8 self-center text-caption-1 text-gray-500 hover:text-gray-700"
        >
          ← 다른 이메일로 시도
        </button>
      </div>
    );
  }

  // ── 1단계: 이메일 입력 ──────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-white px-6 py-12">
      <div className="mb-12">
        <h1 className="text-display-2 text-gray-900 mb-2">이메일로 가입하기</h1>
        <p className="text-body-2 text-gray-600">
          인증 코드를 받을 이메일을 입력해주세요
        </p>
      </div>

      <form
        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
        className="flex flex-col gap-4"
      >
        <Input
          type="email"
          label="이메일"
          autoComplete="email"
          placeholder="you@example.com"
          {...emailForm.register("email", {
            required: "이메일을 입력해주세요",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "올바른 이메일 형식이 아니에요",
            },
          })}
          error={emailForm.formState.errors.email?.message}
        />
        <Button type="submit" fullWidth disabled={requestCode.isPending}>
          {requestCode.isPending ? "전송 중..." : "이메일로 인증코드 받기"}
        </Button>
      </form>

      <div className="flex items-center justify-center gap-1 mt-8 text-caption-1">
        <span className="text-gray-500">이미 계정이 있으신가요?</span>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-500 font-medium hover:text-blue-600"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
