import { useNavigate } from "react-router-dom";
import { Button } from "@chamapp/ui";

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* TODO: Lottie 애니메이션 자리 */}
        <div className="w-40 h-40 rounded-full bg-blue-50 flex items-center justify-center mb-8 animate-fade-in">
          <span className="text-7xl">🔨</span>
        </div>

        <h1 className="text-display-1 text-gray-900 mb-4 animate-fade-in-up">
          오늘도, 잘 참았다
        </h1>
        <p className="text-body-1 text-gray-600 leading-relaxed animate-fade-in-up max-w-xs">
          참아야 했던 순간을
          <br />
          기록하고 응원받는 곳
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <Button fullWidth onClick={() => navigate("/login")}>
          로그인으로 기록하기
        </Button>
        <Button
          fullWidth
          variant="secondary"
          onClick={() => navigate("/main?guest=1")}
        >
          기록 없이 참아보기
        </Button>
      </div>
    </div>
  );
}
