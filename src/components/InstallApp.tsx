import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

const DISMISS_KEY = "mireto21:install-prompt-seen";

export function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isAppMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    setIsStandalone(isAppMode);
    if (isAppMode) return;

    // Already seen the prompt before? Don't show again.
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {}

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect Android Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const markSeen = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  // Auto-dismiss after 5 seconds so it doesn't block the login form
  useEffect(() => {
    if (isStandalone || dismissed) return;
    if (!deferredPrompt && !isIOS) return;
    if (showIOSPrompt) return;
    const t = setTimeout(() => markSeen(), 5000);
    return () => clearTimeout(t);
  }, [isStandalone, dismissed, deferredPrompt, isIOS, showIOSPrompt]);

  if (isStandalone || dismissed) return null;

  // Show only when we have something useful to do:
  // - Android: a native install prompt is available
  // - iOS: we can show manual instructions
  if (!deferredPrompt && !isIOS) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {}
      setDeferredPrompt(null);
      markSeen();
    }
  };

  const handleClose = () => {
    markSeen();
  };

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all active:scale-95 border border-white/20"
        >
          <Download className="h-4 w-4" />
          Instalar App
        </button>
        <button
          onClick={handleClose}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/20 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showIOSPrompt && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-sm rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-0 sm:zoom-in-95 duration-300">
            <button
              onClick={() => {
                setShowIOSPrompt(false);
                markSeen();
              }}
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
              onClick={() => {
                setShowIOSPrompt(false);
                markSeen();
              }}
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
