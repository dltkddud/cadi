import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import StylingApp from "@/MainService";

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[2rem] shadow-2xl overflow-y-auto border border-neutral-300 relative text-neutral-900">
        {isOnboarded ? (
          <StylingApp />
        ) : (
          <Onboarding onComplete={() => setIsOnboarded(true)} />
        )}
      </div>
    </div>
  );
}
