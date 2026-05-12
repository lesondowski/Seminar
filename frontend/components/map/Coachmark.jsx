import { useState } from "react";
import { Lightbulb, X } from "lucide-react";

const SESSION_KEY = "coachmark_dismissed";

export default function Coachmark() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_KEY) === "1";
  });

  if (dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="coachmark" role="tooltip">
      <Lightbulb size={16} />
      <span>Di chuyển đến gần điểm tham quan để nhận gợi ý và nghe audio tự động</span>
      <button className="icon-btn" onClick={dismiss} aria-label="Đóng gợi ý">
        <X size={14} />
      </button>
    </div>
  );
}
