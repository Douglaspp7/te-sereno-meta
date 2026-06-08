import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    const android = /android/.test(ua);
    setIsIOS(iOS);
    setIsAndroid(android);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
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
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferred(null);
    } else {
      setShowAndroidHelp(true);
    }
  };

  if (installed) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                Instala MiReto21 en tu teléfono
              </h3>
              {isIOS ? (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Accede más rápido y sin abrir el navegador.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowIOSModal(true)}
                    className="mt-3 w-full"
                  >
                    Ver cómo instalar
                  </Button>
                </>
              ) : (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Toca el botón para añadirla a tu pantalla de inicio.
                  </p>
                  <Button
                    id="install-button"
                    size="sm"
                    onClick={handleInstall}
                    className="mt-3 w-full"
                  >
                    {deferred ? "Instalar app" : isAndroid ? "Ver cómo instalar" : "Instalar app"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-sm rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground"
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
              Sigue estos pasos en Safari:
            </p>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-xl bg-secondary/30 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blue-500 shadow-sm">
                  <Share className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  1. Toca el botón <strong className="text-blue-500">Compartir</strong> en la barra de Safari.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-secondary/30 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-foreground shadow-sm">
                  <PlusSquare className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  2. Selecciona <strong>"Añadir a pantalla de inicio"</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full rounded-2xl bg-foreground py-4 text-center font-bold text-background active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {showAndroidHelp && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-sm rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <button
              onClick={() => setShowAndroidHelp(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex items-center justify-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Download className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-center font-display text-xl font-bold text-foreground">
              Instalar en Android
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sigue estos pasos en Chrome:
            </p>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-xl bg-secondary/30 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-foreground shadow-sm font-bold">
                  ⋮
                </div>
                <p className="text-sm font-medium text-foreground">
                  1. Toca el menú <strong>⋮</strong> en la esquina superior derecha.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-secondary/30 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">
                  <PlusSquare className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  2. Selecciona <strong>"Instalar app"</strong> o <strong>"Añadir a pantalla de inicio"</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAndroidHelp(false)}
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
