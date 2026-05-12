import { useEffect } from "react";
import { getBootstrap } from "@/services/bootstrapClient";
import { useBootstrapStore } from "@/stores/bootstrapStore";
import { useSessionStore } from "@/stores/sessionStore";

export function useBootstrapInit(accessToken, { onSuccess, onError } = {}) {
  const { hydrate } = useBootstrapStore();
  const { setBootstrapVersion } = useSessionStore();

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function init() {
      try {
        const data = await getBootstrap(accessToken);
        if (cancelled) return;
        hydrate(data);
        if (data.bootstrap_version) setBootstrapVersion(data.bootstrap_version);
        if (onSuccess) onSuccess(data);
      } catch (err) {
        if (cancelled) return;
        if (onError) onError(err);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [accessToken]);
}
