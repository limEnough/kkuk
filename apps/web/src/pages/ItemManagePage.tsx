import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  useCreateItem,
  useDeleteItem,
  useItems,
  useSession,
  type Item,
} from "@chamapp/api";
import {
  BottomSheet,
  Button,
  EmojiPicker,
  Input,
  useToast,
} from "@chamapp/ui";

interface AddItemForm {
  label: string;
  subText: string;
}

export function ItemManagePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading } = useSession();
  const { data: items = [], isLoading } = useItems();
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [emojiTouched, setEmojiTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddItemForm>({ defaultValues: { label: "", subText: "" } });

  if (loading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }

  const myItems = items.filter((i) => i.user_id === user.id && !i.is_default);
  const defaultItems = items.filter((i) => i.is_default || i.user_id === null);

  const openSheet = () => {
    reset({ label: "", subText: "" });
    setSelectedEmoji(null);
    setEmojiTouched(false);
    setSheetOpen(true);
  };

  const onSubmit = async ({ label, subText }: AddItemForm) => {
    setEmojiTouched(true);
    if (!selectedEmoji) return;
    try {
      await createItem.mutateAsync({
        userId: user.id,
        label: label.trim(),
        subText: subText.trim() || null,
        emoji: selectedEmoji,
      });
      setSheetOpen(false);
      toast.show("항목을 추가했어요.", "success");
    } catch {
      toast.show("추가에 실패했어요. 잠시 후 다시 시도해주세요.", "error");
    }
  };

  const remove = async (item: Item) => {
    if (!window.confirm(`'${item.label}' 항목을 삭제할까요?`)) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.show("항목을 삭제했어요.", "success");
    } catch {
      toast.show("삭제에 실패했어요. 잠시 후 다시 시도해주세요.", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      <h1 className="text-display-2 text-gray-900 mb-2">참을 항목 관리</h1>
      <p className="text-body-2 text-gray-500 mb-8">
        나만의 항목을 추가하거나 삭제할 수 있어요
      </p>

      <Button fullWidth variant="secondary" onClick={openSheet}>
        + 새 항목 추가
      </Button>

      {/* 내 항목 */}
      <h2 className="text-subtitle text-gray-900 mt-8 mb-3">내 항목</h2>
      {isLoading ? (
        <div className="h-16 bg-gray-50 rounded-md animate-pulse" />
      ) : myItems.length === 0 ? (
        <p className="text-caption-1 text-gray-400 py-6 text-center">
          아직 추가한 항목이 없어요
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {myItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-md"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-body-2 font-medium truncate">
                  {item.label}
                </p>
                {item.sub_text && (
                  <p className="text-caption-2 text-gray-500 truncate">
                    {item.sub_text}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label={`${item.label} 삭제`}
                onClick={() => remove(item)}
                disabled={deleteItem.isPending}
                className="shrink-0 px-2 py-1 rounded text-caption-1 text-error hover:bg-error/10 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 기본 항목 (읽기 전용) */}
      <h2 className="text-subtitle text-gray-900 mt-8 mb-3">기본 항목</h2>
      <div className="flex flex-col gap-2">
        {defaultItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-4 bg-gray-50/60 rounded-md"
          >
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-body-2 font-medium text-gray-700 truncate">
                {item.label}
              </p>
              {item.sub_text && (
                <p className="text-caption-2 text-gray-400 truncate">
                  {item.sub_text}
                </p>
              )}
            </div>
            <span className="shrink-0 text-caption-2 text-gray-400">기본</span>
          </div>
        ))}
      </div>

      {/* 추가 시트 */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="새 항목 추가"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pb-2"
        >
          <Input
            label="이름"
            placeholder="예: 늦잠 참기"
            maxLength={20}
            required
            autoFocus
            error={errors.label?.message}
            {...register("label", {
              required: "이름을 입력해주세요",
              validate: (v) =>
                v.trim().length > 0 || "공백만 있을 수는 없어요",
            })}
          />

          <Input
            label="부제"
            placeholder="예: 알람 하나만 더..."
            maxLength={30}
            hint="화면에 함께 보여줄 짧은 한 마디 (선택)"
            {...register("subText")}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-caption-1 text-gray-700 font-medium">
              이모지
              <span className="text-error ml-0.5">*</span>
            </label>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-14 h-14 rounded-md flex items-center justify-center text-3xl ${
                  selectedEmoji
                    ? "bg-blue-50 ring-2 ring-blue-500"
                    : "bg-gray-100"
                }`}
              >
                {selectedEmoji ?? (
                  <span className="text-caption-2 text-gray-400">미선택</span>
                )}
              </div>
              <p className="text-caption-1 text-gray-500">
                {selectedEmoji
                  ? "아래에서 다시 선택할 수 있어요"
                  : "아래에서 하나를 골라주세요"}
              </p>
            </div>
            <EmojiPicker
              value={selectedEmoji}
              onChange={(emoji) => {
                setSelectedEmoji(emoji);
                setEmojiTouched(true);
              }}
              maxHeight={280}
            />
            {emojiTouched && !selectedEmoji && (
              <p className="text-caption-2 text-error mt-1">
                이모지를 선택해주세요
              </p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={createItem.isPending}
            className="mt-2"
          >
            {createItem.isPending ? "추가하는 중..." : "추가하기"}
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
