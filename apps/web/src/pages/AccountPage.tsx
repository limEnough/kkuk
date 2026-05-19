import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  useProfile,
  useSession,
  useSignOut,
  useUpdateProfile,
} from "@chamapp/api";
import { Button, Input, useToast } from "@chamapp/ui";

interface NicknameForm {
  nickname: string;
}

export function AccountPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading } = useSession();
  const { data: profile } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const signOut = useSignOut();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NicknameForm>({ defaultValues: { nickname: "" } });

  // 프로필 로드되면 폼 채우기
  useEffect(() => {
    if (profile) reset({ nickname: profile.nickname ?? "" });
  }, [profile, reset]);

  if (loading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }

  const onSubmit = async ({ nickname }: NicknameForm) => {
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        nickname: nickname.trim(),
      });
      toast.show("닉네임을 저장했어요.", "success");
      reset({ nickname: nickname.trim() });
    } catch {
      toast.show("저장에 실패했어요. 잠시 후 다시 시도해주세요.", "error");
    }
  };

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-6 py-8">
      <h1 className="text-display-2 text-gray-900 mb-8">계정 관리</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <Input
          label="닉네임"
          placeholder="닉네임을 입력해주세요"
          maxLength={20}
          autoFocus={!profile?.nickname}
          error={errors.nickname?.message}
          {...register("nickname", {
            required: "닉네임을 입력해주세요",
            validate: (v) =>
              v.trim().length > 0 || "공백만 있을 수는 없어요",
          })}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-caption-1 text-gray-700 font-medium">
            이메일
          </span>
          <div className="h-12 px-4 flex items-center rounded-md bg-gray-100 text-body-1 text-gray-500">
            {user.email ?? "—"}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={updateProfile.isPending || !isDirty}
        >
          {updateProfile.isPending ? "저장 중..." : "저장"}
        </Button>
      </form>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signOut.isPending}
        className="mt-auto py-4 text-caption-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
      >
        로그아웃
      </button>
    </div>
  );
}
