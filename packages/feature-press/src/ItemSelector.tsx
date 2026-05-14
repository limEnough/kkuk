import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateItem, useItems, type Item } from '@chamapp/api';
import { BottomSheet, Button, EmojiPicker, Input } from '@chamapp/ui';

export interface SelectedItem {
  id: string | null;
  label: string;
  emoji: string;
  category: string | null;
  subText: string | null;
}

export interface ItemSelectorProps {
  userId: string | null;
  onSelect: (item: SelectedItem) => void;
}

interface AddItemForm {
  label: string;
  subText: string;
}

export function ItemSelector({ userId, onSelect }: ItemSelectorProps) {
  const { data: items = [], isLoading } = useItems();
  const createItem = useCreateItem();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [emojiTouched, setEmojiTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddItemForm>({
    defaultValues: { label: '', subText: '' },
  });

  const openSheet = () => {
    reset({ label: '', subText: '' });
    setSelectedEmoji(null);
    setEmojiTouched(false);
    setSheetOpen(true);
  };

  const onSubmit = async ({ label, subText }: AddItemForm) => {
    if (!userId) return;
    setEmojiTouched(true);
    if (!selectedEmoji) return; // 이모지 미선택 시 에러 표시 (제출 막음)

    const item = await createItem.mutateAsync({
      userId,
      label: label.trim(),
      subText: subText.trim() || null,
      emoji: selectedEmoji,
    });
    setSheetOpen(false);
    onSelect({
      id: item.id,
      label: item.label,
      emoji: item.emoji,
      category: item.category,
      subText: item.sub_text,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12">
      <div className="mb-8">
        <p className="text-caption-1 text-gray-500 mb-1">오늘은</p>
        <h1 className="text-display-2 text-gray-900">무엇을 참아볼까요?</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[88px] bg-gray-50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onSelect={onSelect} />
          ))}

          {/* + 추가 버튼 (항목 끝, 로그인 시에만) */}
          {userId && <AddItemCard onClick={openSheet} />}
        </div>
      )}

      {!userId && (
        <p className="mt-8 text-caption-1 text-gray-500 text-center">
          로그인하면 나만의 항목을 추가할 수 있어요
        </p>
      )}

      {/* 항목 추가 시트 */}
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
            {...register('label', {
              required: '이름을 입력해주세요',
              validate: (v) =>
                v.trim().length > 0 || '공백만 있을 수는 없어요',
            })}
          />

          <Input
            label="부제"
            placeholder="예: 알람 하나만 더..."
            maxLength={30}
            hint="화면에 함께 보여줄 짧은 한 마디 (선택)"
            {...register('subText')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-caption-1 text-gray-700 font-medium">
              이모지
              <span className="text-error ml-0.5">*</span>
            </label>

            {/* 현재 선택 미리보기 */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`
                  w-14 h-14 rounded-md flex items-center justify-center text-3xl
                  ${selectedEmoji ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-100'}
                `}
              >
                {selectedEmoji ?? (
                  <span className="text-caption-2 text-gray-400">미선택</span>
                )}
              </div>
              <p className="text-caption-1 text-gray-500">
                {selectedEmoji
                  ? '아래에서 다시 선택할 수 있어요'
                  : '아래에서 하나를 골라주세요'}
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
            {createItem.isPending ? '추가하는 중...' : '추가하기'}
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}

// ============================================================================
// ItemCard — 이모지 + 라벨 + 부제 (2줄 레이아웃)
// ============================================================================
function ItemCard({
  item,
  onSelect,
}: {
  item: Item;
  onSelect: (item: SelectedItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: item.id,
          label: item.label,
          emoji: item.emoji,
          category: item.category,
          subText: item.sub_text,
        })
      }
      className="
        flex flex-col items-start gap-1
        p-4 min-h-[88px]
        rounded-lg bg-gray-50 hover:bg-gray-100
        active:scale-[0.98] transition-all text-left
      "
    >
      <span className="text-2xl leading-none mb-1">{item.emoji}</span>
      <span className="text-body-2 font-semibold text-gray-900 leading-tight line-clamp-1">
        {item.label}
      </span>
      {item.sub_text && (
        <span className="text-caption-2 text-gray-500 leading-snug line-clamp-2">
          {item.sub_text}
        </span>
      )}
    </button>
  );
}

function AddItemCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="새 항목 추가"
      className="
        flex flex-col items-center justify-center gap-1.5
        p-4 min-h-[88px]
        rounded-lg bg-white border border-dashed border-gray-300
        text-gray-500 hover:bg-gray-50 hover:border-gray-400
        active:scale-[0.98] transition-all
      "
    >
      <span className="text-2xl leading-none">+</span>
      <span className="text-caption-1 font-medium">새 항목</span>
    </button>
  );
}
