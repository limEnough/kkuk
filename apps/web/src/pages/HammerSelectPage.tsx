import { useNavigate } from "react-router-dom";
import {
  useHammers,
  useProfile,
  useSession,
  useUpdateProfile,
} from "@chamapp/api";
import { useToast } from "@chamapp/ui";

const DEFAULT_HAMMER_SRC = "/hammers/img-origin.png";

export function HammerSelectPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data: hammers = [], isLoading } = useHammers();
  const updateProfile = useUpdateProfile();

  if (loading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }

  const selectedId = profile?.selected_hammer_id ?? hammers[0]?.id ?? null;

  const select = async (hammerId: string) => {
    if (hammerId === selectedId || updateProfile.isPending) return;
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        selectedHammerId: hammerId,
      });
      toast.show("망치를 바꿨어요.", "success");
    } catch {
      toast.show("변경에 실패했어요. 잠시 후 다시 시도해주세요.", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-6 py-8">
      <h1 className="text-display-2 text-gray-900 mb-2">망치 선택</h1>
      <p className="text-body-2 text-gray-500 mb-8">
        꾹 누를 때 두드릴 망치를 골라주세요
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {hammers.map((h) => {
            const isSelected = h.id === selectedId;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => select(h.id)}
                disabled={updateProfile.isPending}
                aria-pressed={isSelected}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 ${
                  isSelected
                    ? "bg-blue-50 ring-2 ring-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <img
                  src={h.image_url || DEFAULT_HAMMER_SRC}
                  alt={h.name}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.endsWith(DEFAULT_HAMMER_SRC)) {
                      img.src = DEFAULT_HAMMER_SRC;
                    }
                  }}
                  className="w-20 h-20 object-contain"
                />
                <span
                  className={`text-body-2 font-medium ${
                    isSelected ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {h.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
