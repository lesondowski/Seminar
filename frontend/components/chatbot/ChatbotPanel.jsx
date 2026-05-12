import { useEffect, useRef } from "react";
import { ArrowLeft, BriefcaseBusiness, Navigation2 } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useBootstrapStore } from "@/stores/bootstrapStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";
import ChatInput from "@/components/chatbot/ChatInput";
import PromptChip from "@/components/chatbot/PromptChip";
import { postChat } from "@/services/chatClient";
import { buildAssistantReply } from "@/components/chatbot/localAssistant";

const GREETING = "Xin chào! Tôi có thể giúp gì cho chuyến tham quan của bạn hôm nay tại trung tâm thành phố?";
const SUGGESTIONS = ["Gợi ý quán cà phê gần đây", "Giờ mở cửa", "Lịch sử địa điểm"];

export default function ChatbotPanel({ onClose }) {
  const messagesEndRef = useRef(null);

  const messages = useChatStore((s) => s.messages);
  const pending = useChatStore((s) => s.pending);
  const rateLimited = useChatStore((s) => s.rateLimited);
  const inputLocked = useChatStore((s) => s.inputLocked);
  const pushMessage = useChatStore((s) => s.pushMessage);
  const setPending = useChatStore((s) => s.setPending);
  const setRateLimited = useChatStore((s) => s.setRateLimited);
  const setIsOpen = useChatStore((s) => s.setIsOpen);
  const bootstrapVersion = useBootstrapStore((s) => s.bootstrapVersion);
  const accessToken = useSessionStore((s) => s.accessToken);
  const poiList = useVisitorExploreStore((s) => s.poiList);
  const selectedPOI = useVisitorExploreStore((s) => s.selectedPOI);

  useEffect(() => {
    setIsOpen(true);
    return () => setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      pushMessage({ role: "bot", content: GREETING, ts: Date.now() });
    }
  }, [messages.length, pushMessage]);

  async function sendMessage(text) {
    if (!text.trim() || pending || inputLocked) {
      return;
    }

    pushMessage({ role: "user", content: text, ts: Date.now() });
    setPending(true);

    try {
      if (accessToken && bootstrapVersion) {
        const response = await postChat(
          {
            message: text,
            bootstrap_version: bootstrapVersion,
            language: "vi",
            poi_id: selectedPOI || undefined,
          },
          accessToken
        );
        pushMessage({
          role: "bot",
          content: response.data?.answer || "Tôi đã nhận câu hỏi của bạn.",
          ts: Date.now(),
        });
        setRateLimited(false);
      } else {
        const result = buildAssistantReply({
          query: text,
          poiList,
          contextPoiId: selectedPOI,
        });
        pushMessage({
          role: "bot",
          content: result.text,
          poi: result.poi,
          actions: result.actions,
          ts: Date.now(),
        });
      }
    } catch (err) {
      if (err?.status === 429 || err?.error?.code === "RATE_LIMITED") {
        setRateLimited(true);
      }
      pushMessage({ role: "error", content: err?.error?.message || "Hiện tôi chưa thể tạo thêm gợi ý mới. Hãy thử lại sau ít giây.", ts: Date.now() });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="chatbot-panel max-h-[90vh] rounded-t-[28px] bg-[#f8f8fb] md:mx-auto md:max-w-[760px] md:rounded-[30px]">
      <header className="chatbot-header rounded-t-[28px] border-b border-transparent bg-white/90 px-4 py-3 shadow-[0_8px_22px_rgba(16,24,20,0.08)] backdrop-blur md:px-5 md:py-4">
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full text-teal-700" type="button" onClick={onClose}>
          <ArrowLeft size={22} />
        </button>
        <h3 className="text-2xl font-bold text-slate-900 md:text-[2rem]">Trợ lý ảo GPS</h3>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <div className="chatbot-messages gap-3 px-4 py-4 md:gap-4 md:px-5 md:py-5">
        <div className="text-center text-sm text-slate-400 md:text-base">Hôm nay</div>

        <div className="chip-row">
          {SUGGESTIONS.map((suggestion) => (
            <PromptChip key={suggestion} label={suggestion} onClick={() => sendMessage(suggestion)} />
          ))}
        </div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role !== "user" && (
              <span className="mr-2 mt-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white md:mr-3 md:h-11 md:w-11">
                <BriefcaseBusiness size={18} />
              </span>
            )}
            <div className={`chat-bubble chat-bubble--${msg.role} max-w-[88%] ${msg.role === "user" ? "rounded-[24px] rounded-tr-md bg-teal-700 text-white" : "rounded-[20px] rounded-tl-md bg-white text-slate-900 shadow-[0_10px_24px_rgba(16,24,20,0.08)]"} px-4 py-3 text-base leading-7 md:max-w-[84%] md:px-5 md:py-4 md:text-[1.05rem] md:leading-9`}>
              <div>{msg.content}</div>
              <div className={`mt-3 text-sm ${msg.role === "user" ? "text-white/70" : "text-slate-400"}`}>{msg.ts ? new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</div>

              {msg.poi && (
                <div className="mt-3 overflow-hidden rounded-[18px] border border-slate-200 bg-white text-slate-900 md:mt-4 md:rounded-[22px]">
                  <div className="flex items-center gap-3 p-3 md:gap-4 md:p-4">
                    <img src={msg.poi.image} alt="" className="h-16 w-20 rounded-[14px] object-cover md:h-20 md:w-24 md:rounded-[18px]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold md:text-xl">{msg.poi.name}</div>
                      <div className="mt-1 text-sm text-slate-500 md:text-base">Cách đây {msg.poi.distanceKm} km</div>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 md:h-12 md:w-12">
                      <Navigation2 size={18} />
                    </span>
                  </div>
                  {msg.actions?.length ? (
                    <div className="flex gap-2 overflow-x-auto px-3 pb-3 md:gap-3 md:px-4 md:pb-4">
                      {msg.actions.map((action) => (
                        <button key={action} type="button" className="shrink-0 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700 md:px-5 md:py-3 md:text-lg" onClick={() => sendMessage(action)}>
                          {action}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ))}

        {pending && (
          <div className="chat-bubble chat-bubble--bot chat-bubble--pending rounded-[24px] bg-white shadow-[0_10px_24px_rgba(16,24,20,0.08)]">
            Dang soan phan hoi
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {rateLimited && (
        <div className="status-banner status-banner--warning">
          Ban dang gui qua nhanh. Vui long thu lai sau it phut.
        </div>
      )}

      <ChatInput
        pending={pending}
        disabled={inputLocked}
        onSend={sendMessage}
      />
    </div>
  );
}
