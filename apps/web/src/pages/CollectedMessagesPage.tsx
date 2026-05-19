import { useNavigate } from "react-router-dom";
import { useCollectedMessages, useSession } from "@chamapp/api";

export function CollectedMessagesPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const { data: messages = [], isLoading } = useCollectedMessages();

  if (loading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-full bg-white px-6 py-8">
      <h1 className="text-display-2 text-gray-900 mb-2">획득한 문장</h1>
      <p className="text-body-2 text-gray-500 mb-8">
        지금까지 받아본 응원 문장 {messages.length}개
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-50 rounded-md animate-pulse"
            />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <p className="text-center text-gray-400 py-16">
          아직 획득한 문장이 없어요.
          <br />
          꾹 참고 응원 문장을 모아보세요.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((m) => (
            <div key={m.id} className="p-4 bg-gray-50 rounded-md">
              <p className="text-body-1 text-gray-900 leading-relaxed">
                {m.message_content}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-caption-2 text-gray-400">
                  {new Date(m.first_collected_at).toLocaleDateString("ko-KR")}
                </span>
                {m.collect_count > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-caption-2 font-semibold tabular-nums">
                    {m.collect_count}번
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
