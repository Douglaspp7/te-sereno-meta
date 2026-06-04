import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed (standalone) → never show
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (standalone) return;

    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (iOS) {
      setIsIOS(true);
      setVisible(true);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferred(null);
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-full max-w-md px-4">
      <div className="relative rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-xl">
        <button
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Instalar aplicación</h3>
            {isIOS ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Toca <span className="font-medium">Compartir</span> y luego{" "}
                <span className="font-medium">Añadir a pantalla de inicio</span>.
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  Acceso rápido desde tu pantalla de inicio, sin abrir el navegador.
                </p>
                <Button
                  id="install-button"
                  size="sm"
                  onClick={handleInstall}
                  className="mt-3 w-full"
                >
                  Instalar app
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
