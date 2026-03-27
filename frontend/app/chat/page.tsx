"use client";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const send = async () => {
    const res = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: input }),
    });
    const data = await res.json();
    setMessages([...messages, "You: " + input, "AI: " + data.answer]);
    setInput("");
  };

  return (
    <div className="p-4">
      <div className="h-[70vh] overflow-auto border p-2 mb-2">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={send} className="mt-2 bg-black text-white px-4 py-2">
        Send
      </button>
    </div>
  );
}