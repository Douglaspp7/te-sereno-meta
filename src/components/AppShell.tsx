import type { ReactNode } from "react";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-8">
      {children}
      {!hideNav && <PWAInstallPrompt />}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header className="px-5 pt-8 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {!isHome && (
            <Link to="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-white shadow-sm transition active:scale-[0.98]">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <div>
            <h1 className="font-display text-3xl text-foreground leading-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
