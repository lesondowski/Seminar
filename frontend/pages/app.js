import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSessionStore } from "@/stores/sessionStore";
import { useBootstrapStore } from "@/stores/bootstrapStore";
import { useUiStore } from "@/stores/uiStore";
import { scanQr } from "@/services/authClient";
import { paymentMock } from "@/services/authClient";
import { getBootstrap } from "@/services/bootstrapClient";
import QRAccessRouter from "@/components/access/QRAccessRouter";
import MockPayment from "@/components/access/MockPayment";
import AccessError from "@/components/access/AccessError";
import VisitorMapHome from "@/components/map/VisitorMapHome";
import ChatbotPanel from "@/components/chatbot/ChatbotPanel";
import POIDetail from "@/components/poi/POIDetail";
import TourList from "@/components/tour/TourList";
import TourActive from "@/components/tour/TourActive";
import ItineraryListPanel from "@/components/tour/ItineraryListPanel";
import SuggestionCard from "@/components/map/SuggestionCard";
import Coachmark from "@/components/map/Coachmark";
import POIListPanel from "@/components/poi/POIListPanel";
import SuggestionPanel from "@/components/map/SuggestionPanel";
import { useGPSRuntime } from "@/hooks/useGPSRuntime";
import { useAudioRuntime } from "@/hooks/useAudioRuntime";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";
import { useTourStore } from "@/stores/tourStore";
import { buildPoiPath, parsePoiId } from "@/utils/poiLinks";

const PHASE = {
  HOME: "home",
  QR_ENTRY: "qr_entry",
  PAYMENT: "payment",
  BOOTSTRAP_LOADING: "bootstrap_loading",
  READY: "ready",
  ERROR: "error",
};

const HOME_AUTO_QR_CODE = "SITE-ENTRY-ABC123";

function normalizePath(path) {
  if (!path) return "";
  const clean = path.split("?")[0].split("#")[0];
  if (clean.length > 1 && clean.endsWith("/")) {
    return clean.slice(0, -1);
  }
  return clean;
}

export function VisitorAppPage({ forcedPoiId = null }) {
  const router = useRouter();
  const [phase, setPhase] = useState(PHASE.HOME);
  const [apiLoading, setApiLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [poiListMode, setPoiListMode] = useState("browse");

  const setSession = useSessionStore((s) => s.setSession);
  const sessionAccessToken = useSessionStore((s) => s.accessToken);
  const sessionRequiresPayment = useSessionStore((s) => s.requiresPayment);
  const sessionId = useSessionStore((s) => s.sessionId);
  const setBootstrapVersion = useSessionStore((s) => s.setBootstrapVersion);
  const clearSession = useSessionStore((s) => s.clearSession);
  const hydrate = useBootstrapStore((s) => s.hydrate);
  const bootstrapLoaded = useBootstrapStore((s) => s.loaded);
  const resetBootstrap = useBootstrapStore((s) => s.reset);
  const site = useBootstrapStore((s) => s.site);
  const pois = useBootstrapStore((s) => s.pois);
  const language = useUiStore((s) => s.language);
  const activeSurface = useUiStore((s) => s.activeSurface);
  const openSurface = useUiStore((s) => s.openSurface);
  const itineraryDraftPoiIds = useVisitorExploreStore((s) => s.itineraryDraftPoiIds);
  const addPoiToItinerary = useVisitorExploreStore((s) => s.addPoiToItinerary);
  const startCustomJourney = useTourStore((s) => s.startCustomJourney);
  const goToNextPoi = useTourStore((s) => s.goToNextPoi);
  const goToPreviousPoi = useTourStore((s) => s.goToPreviousPoi);

  const isReady = phase === PHASE.READY && bootstrapLoaded;
  const queryPoiId = useMemo(() => parsePoiId(router.query?.poiId), [router.query?.poiId]);
  const routePoiId = useMemo(() => parsePoiId(router.query?.id), [router.query?.id]);
  const initialPoiId = forcedPoiId || routePoiId || queryPoiId;

  async function navigateIfChanged(method, path, options = { shallow: true }) {
    const currentPath = normalizePath(router.asPath);
    const targetPath = normalizePath(path);
    if (!targetPath || currentPath === targetPath) {
      return;
    }

    if (method === "replace") {
      await router.replace(path, undefined, options);
      return;
    }

    await router.push(path, undefined, options);
  }

  // GPS runtime — only active when visitor is on the map
  useGPSRuntime(isReady);
  // Audio element lifecycle
  useAudioRuntime();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const mode = url.searchParams.get("mode");
      if (mode === "qr") {
        setPhase(PHASE.QR_ENTRY);
      } else {
        setPhase(PHASE.BOOTSTRAP_LOADING);
        void handleQrSubmit(HOME_AUTO_QR_CODE, { fallbackToQrOnError: true });
      }
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (!isReady || !initialPoiId) return;

    const poiExists = (pois || []).some((poi) => poi.id === initialPoiId);
    if (!poiExists) {
      void navigateIfChanged("replace", "/app");
      setSelectedPoiId(null);
      openSurface("map");
      return;
    }

    setSelectedPoiId(initialPoiId);
    openSurface("poi");

    if (queryPoiId && router.pathname === "/app") {
      void navigateIfChanged("replace", buildPoiPath(initialPoiId));
    }
  }, [initialPoiId, isReady, openSurface, pois, queryPoiId, router.isReady]);

  function openPoiDetail(id) {
    const poiId = parsePoiId(id);
    if (!poiId) return;

    setSelectedPoiId(poiId);
    openSurface("poi");

    const nextPath = buildPoiPath(poiId);
    void navigateIfChanged("push", nextPath);
  }

  function closePoiDetail() {
    setSelectedPoiId(null);
    openSurface("map");
    void navigateIfChanged("push", "/app");
  }

  async function handleQrSubmit(qrCode, options = {}) {
    const { fallbackToQrOnError = false } = options;
    setApiLoading(true);
    setErrorState(null);
    try {
      const result = await scanQr(qrCode);
      setSession(result.data);
      if (result.data.requires_payment) {
        setPhase(PHASE.PAYMENT);
      } else {
        setPhase(PHASE.BOOTSTRAP_LOADING);
        await loadBootstrap(result.data.access_token, { fallbackToQrOnError });
      }
    } catch (err) {
      if (fallbackToQrOnError) {
        clearSession();
        resetBootstrap();
        setSelectedPoiId(null);
        openSurface("map");
        setErrorState(null);
        setPhase(PHASE.QR_ENTRY);
        return;
      }

      setErrorState({
        code: err.error?.code,
        message: err.error?.message,
        canRetry: true,
      });
      setPhase(PHASE.ERROR);
    } finally {
      setApiLoading(false);
    }
  }

  async function handlePaymentConfirm() {
    setApiLoading(true);
    setErrorState(null);
    try {
      await paymentMock(sessionId, sessionAccessToken);
      setPhase(PHASE.BOOTSTRAP_LOADING);
      await loadBootstrap(sessionAccessToken);
    } catch (err) {
      setErrorState({
        code: err.error?.code,
        message: err.error?.message || "Thanh toan chua hoan tat. Vui long thu lai.",
        canRetry: true,
      });
      setPhase(PHASE.ERROR);
    } finally {
      setApiLoading(false);
    }
  }

  async function loadBootstrap(token, options = {}) {
    const { fallbackToQrOnError = false } = options;
    try {
      const data = await getBootstrap(token);
      hydrate(data);
      setBootstrapVersion(data.bootstrap_version);
      setPhase(PHASE.READY);
    } catch (err) {
      const status = err?.status;
      if (status === 401 || fallbackToQrOnError) {
        clearSession();
        resetBootstrap();
        setSelectedPoiId(null);
        openSurface("map");
        setErrorState(null);
        setPhase(PHASE.QR_ENTRY);
        return;
      } else {
        setErrorState({
          code: err?.error?.code,
          message: "Khong the tai du lieu tham quan. Vui long thu lai hoac quet lai ma QR.",
          canRetry: true,
        });
      }
      setPhase(PHASE.ERROR);
    }
  }

  if (phase === PHASE.ERROR) {
    return (
      <main className="surface-shell">
        <AccessError
          title={errorState?.code === "QR_INVALID" ? "Ma khong hop le" : "Co loi xay ra"}
          message={errorState?.message}
          onRetry={() => setPhase(PHASE.QR_ENTRY)}
          onReset={() => window.location.replace("/")}
        />
      </main>
    );
  }

  if (phase === PHASE.BOOTSTRAP_LOADING) {
    return (
      <main className="surface-shell">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Dang tai ban do va du lieu tham quan</p>
        </div>
      </main>
    );
  }

  if (phase === PHASE.PAYMENT) {
    return (
      <main className="surface-shell">
        <MockPayment onConfirm={handlePaymentConfirm} loading={apiLoading} />
      </main>
    );
  }

  if (phase === PHASE.QR_ENTRY) {
    return (
      <>
        <QRAccessRouter onSubmit={handleQrSubmit} loading={apiLoading} />
      </>
    );
  }

  if (isReady) {
    return (
      <main className="app-shell">
        <VisitorMapHome
          onOpenChat={() => openSurface("chat")}
          onOpenItinerary={() => openSurface("itinerary")}
          onSelectPoi={openPoiDetail}
        />

        {/* POI Detail overlay */}
        {activeSurface === "poi" && selectedPoiId && (
          <div className="surface-overlay" onClick={closePoiDetail}>
            <div onClick={(event) => event.stopPropagation()}>
              <POIDetail
                poiId={selectedPoiId}
                onClose={closePoiDetail}
              />
            </div>
          </div>
        )}

        {/* Tour surfaces */}
        {activeSurface === "tour" && (
          <div className="surface-overlay">
            <TourList onClose={() => openSurface("map")} />
          </div>
        )}
        {activeSurface === "tour-active" && (
          <div className="surface-overlay">
            <TourActive onSelectPoi={openPoiDetail} />
          </div>
        )}
        {activeSurface === "poi-list" && (
          <div className="surface-overlay">
            <POIListPanel
              onClose={() => openSurface("map")}
              onSelectPoi={(id) => {
                if (poiListMode === "itinerary-add") {
                  addPoiToItinerary(id);
                  setPoiListMode("browse");
                  openSurface("itinerary");
                  return;
                }
                openPoiDetail(id);
              }}
            />
          </div>
        )}
        {activeSurface === "suggestions" && (
          <div className="surface-overlay">
            <SuggestionPanel
              onClose={() => openSurface("map")}
              onSelectPoi={openPoiDetail}
            />
          </div>
        )}
        {activeSurface === "itinerary" && (
          <div className="surface-overlay">
            <ItineraryListPanel
              onClose={() => openSurface("map")}
              onSelectPoi={openPoiDetail}
              onAddMore={() => {
                setPoiListMode("itinerary-add");
                openSurface("poi-list");
              }}
              onNextPoi={() => {
                goToNextPoi();
                openSurface("tour-active");
              }}
              onPreviousPoi={() => {
                goToPreviousPoi();
                openSurface("tour-active");
              }}
              onStartJourney={() => {
                startCustomJourney(itineraryDraftPoiIds);
                openSurface("tour-active");
              }}
            />
          </div>
        )}

        {/* Chat */}
        {activeSurface === "chat" && (
          <ChatbotPanel
            language={language}
            onClose={() => openSurface("map")}
          />
        )}

        {/* Floating UI */}
        <SuggestionCard
          onSelect={openPoiDetail}
        />
        <Coachmark />
      </main>
    );
  }

  return (
    <main className="surface-shell">
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Dang khoi dong</p>
      </div>
    </main>
  );
}

export default function AppPage() {
  return <VisitorAppPage />;
}

