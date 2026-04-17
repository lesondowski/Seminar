import React, { useState } from 'react';
import { ChatIcon, CloseIcon } from '../common/Icons';
import { useChatbot } from '../../utils/chatbot/ChatbotContext';

export default function ChatbotWidget() {
  const { isOpen, setIsOpen, messages, sendMessage, isSending, suggestionPrompts } = useChatbot();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    await sendMessage(text);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[9999] w-14 h-14 rounded-full bg-[#333333] text-white shadow-2xl hover:bg-[#444444] transition"
          title="Chatbot"
        >
          <span className="inline-flex items-center justify-center w-full h-full"><ChatIcon className="w-6 h-6" /></span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[9999] md:inset-auto md:bottom-5 md:right-5 md:w-[360px] md:h-[560px]">
          <div className="absolute inset-0 bg-black/30 md:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-0 bg-white md:relative md:rounded-2xl md:border md:border-[#DDDDDD] md:shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-[#333333] text-white flex items-center justify-between">
              <div>
                <p className="font-bold">Tro ly am thuc</p>
                <p className="text-xs opacity-80">Hoi dap nhanh theo khu vuc</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/10">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 py-2 border-b border-[#DDDDDD] flex flex-wrap gap-2">
              {suggestionPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-2.5 py-1.5 text-xs rounded-full bg-[#F5F5F5] text-[#333333] hover:bg-[#EAEAEA]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FAFAFA]">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm ${
                      message.sender === 'user'
                        ? 'bg-[#333333] text-white rounded-br-md'
                        : 'bg-white border border-[#DDDDDD] text-[#212121] rounded-bl-md'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="text-xs text-[#757575]">Dang tra loi...</div>
              )}
            </div>

            <div className="p-3 border-t border-[#DDDDDD] bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhap cau hoi..."
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-[#DDDDDD] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#333333]/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !input.trim()}
                  className="px-3 py-2 rounded-lg bg-[#333333] text-white text-sm font-semibold disabled:opacity-50"
                >
                  Gui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
