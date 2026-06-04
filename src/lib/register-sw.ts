import { toast } from "sonner";

const SW_URL = "/sw.js";

function isPreviewHost(host: string) {
  return (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  );
}

async function unregisterApp() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => {
        const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
        return url.endsWith(SW_URL);
      })
      .map((r) => r.unregister()),
  );
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const url = new URL(window.location.href);
  const inIframe = window.self !== window.top;
  const isProd = import.meta.env.PROD;
  const host = window.location.hostname;
  const refused =
    !isProd ||
    inIframe ||
    isPreviewHost(host) ||
    url.searchParams.get("sw") === "off";

  if (refused) {
    await unregisterApp();
    return;
  }

  try {
    const { Workbox } = await import("workbox-window");
    const wb = new Workbox(SW_URL);

    wb.addEventListener("waiting", () => {
      toast("Nueva versión disponible", {
        description: "Actualiza para obtener las últimas mejoras.",
        duration: Infinity,
        action: {
          label: "Actualizar",
          onClick: () => {
            wb.addEventListener("controlling", () => window.location.reload());
            wb.messageSkipWaiting();
          },
        },
      });
    });

    await wb.register();
  } catch (err) {
    console.warn("[sw] registration failed", err);
  }
}
