import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className={`mx-auto min-h-screen w-full max-w-md bg-background ${hideNav ? "" : "pb-24"}`}>
      {children}
      {!hideNav && <PWAInstallPrompt />}
      {!hideNav && <BottomNav />}
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
  return (
    <header className="px-5 pt-8 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
