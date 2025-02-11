"use client";

import { ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";

export default function NotificationsHeader() {
  const session = useSession();

  const handleBackNavigate = () => {
    window.history.back();
  };

  if (!session.data?.user) {
    return null;
  }

  return (
    <div className="flex h-20 items-center gap-8 border-b border-white/40 px-2">
      <button onClick={handleBackNavigate} className="flex items-center gap-2">
        <ChevronLeft size={30} />
        <span className="text-xl font-bold">Back</span>
      </button>
    </div>
  );
}
