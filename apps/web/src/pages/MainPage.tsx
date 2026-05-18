import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useCreatePressRecord,
  useHammers,
  useProfile,
  useSession,
} from "@chamapp/api";
import {
  ItemSelector,
  PressArea,
  PressResult,
  type SelectedItem,
} from "@chamapp/feature-press";
import { pickCheerMessage, type CheerMessage } from "@chamapp/messages";
import { useToast } from "@chamapp/ui";

type Step = "select" | "press" | "result";

export function MainPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "1";

  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data: hammers = [] } = useHammers();
  const createRecord = useCreatePressRecord();

  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [resultMessage, setResultMessage] = useState<CheerMessage | null>(null);

  const selectedHammer =
    hammers.find((h) => h.id === profile?.selected_hammer_id) ?? hammers[0];
  const hammerImage = selectedHammer?.image_url ?? "/hammers/red.png";

  const handleSelect = (item: SelectedItem) => {
    setSelected(item);
    setStep("press");
  };

  const handleComplete = async (durationMs: number) => {
    if (!selected) return;
    const message = pickCheerMessage(selected.category);
    setResultMessage(message);

    if (user?.id) {
      try {
        await createRecord.mutateAsync({
          userId: user.id,
          itemId: selected.id,
          itemLabel: selected.label,
          itemEmoji: selected.emoji,
          durationMs,
          messageId: message.id,
          messageContent: message.content,
        });
      } catch (e) {
        console.error("기록 저장 실패", e);
        toast.show(
          "기록 저장에 실패했어요.\n네트워크를 확인하고 다시 시도해주세요.",
          "error",
        );
      }
    }

    setStep("result");
  };

  const handleAgain = () => {
    setStep("select");
    setSelected(null);
    setResultMessage(null);
  };

  if (step === "select") {
    return <ItemSelector userId={user?.id ?? null} onSelect={handleSelect} />;
  }

  if (step === "press" && selected) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <button
          onClick={() => setStep("select")}
          className="self-start m-4 text-caption-1 text-gray-500"
        >
          ← 다른 항목 선택
        </button>
        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <PressArea
            emoji={selected.emoji}
            label={selected.label}
            subText={selected.subText}
            hammerImageUrl={hammerImage}
            onComplete={handleComplete}
          />
        </div>
      </div>
    );
  }

  if (step === "result" && selected && resultMessage) {
    return (
      <PressResult
        emoji={selected.emoji}
        label={selected.label}
        message={resultMessage.content}
        isGuest={isGuest || !user}
        onAgain={handleAgain}
        onGoCalendar={() => navigate("/calendar")}
        onSignUp={() => navigate("/login")}
      />
    );
  }

  return null;
}
