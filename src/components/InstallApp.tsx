import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

const DISMISS_KEY = "mireto21:install-prompt-dismissed-at";
// Re-show after 7 days if user dismissed (standard PWA pattern)
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
// Delay before showing so it doesn't pop in front of the login form
const SHOW_DELAY_MS = 3000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed? Never show.
    const isAppMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    setIsStandalone(isAppMode);
    if (isAppMode) return;

    // Respect prior dismissal for a cooldown window (standard pattern).
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
        return;
      }
    } catch {}

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIOS(iOS);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS never fires beforeinstallprompt — show our manual hint after a delay.
    let timer: number | undefined;
    if (iOS) {
      timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
    setShowIOSPrompt(false);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {}
      setDeferredPrompt(null);
      dismiss();
    }
  };

  if (isStandalone) return null;
  if (!visible) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      {/* Bottom banner — standard PWA install pattern. Doesn't block the form. */}
      <div className="fixed inset-x-0 bottom-4 z-40 mx-auto w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
        <div className="pointer-events-auto relative flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">
              Instala MiReto21
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-tight">
              {isIOS ? "Añádela a tu pantalla de inicio" : "Accede más rápido desde tu inicio"}
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow active:scale-95"
          >
            Instalar
          </button>
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="shrink-0 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showIOSPrompt && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-sm rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-0 sm:zoom-in-95 duration-300">
            <button
              onClick={dismiss}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex items-center justify-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Download className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-center font-display text-xl font-bold text-foreground">
              Instalar en iPhone
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Para tener MiReto21 como una app nativa en tu pantalla de inicio:
            </p>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-xl bg-secondary/30 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blue-500 shadow-sm">
                  <Share className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  1. Toca el botón de <strong className="text-blue-500">Compartir</strong> en la barra de Safari.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-secondary/30 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-foreground shadow-sm">
                  <PlusSquare className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  2. Selecciona <strong>"Agregar a Inicio"</strong> en el menú.
                </p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="mt-6 w-full rounded-2xl bg-foreground py-4 text-center font-bold text-background active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
