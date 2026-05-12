import { useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 min

export function useChatRuntime(sessionId) {
  const { reset } = useChatStore();

  // Clear chat when session changes or on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [sessionId]);
}
