import { useState } from "react";

export default function ChatInput({ pending, disabled, onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || pending || disabled) {
      return;
    }

    onSend(trimmed);
    setMessage("");
  };

  return (
    <div className="chat-input-shell gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4">
      <textarea
        className="chat-input min-h-[52px] rounded-[22px] border-slate-200 bg-white px-4 py-3 text-base"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
          }
        }}
        rows={2}
        placeholder="Hỏi tôi bất cứ điều gì..."
        aria-label="Câu hỏi cho trợ lý"
        disabled={pending || disabled}
      />
    </div>
  );
}
