"use client";

import { ChevronLeft } from "lucide-react";

export default function TopbarPostDetails() {
  const handleBackNavigate = () => {
    window.history.back();
  };

  return (
    <button onClick={handleBackNavigate}>
      <ChevronLeft />
    </button>
  );
}
