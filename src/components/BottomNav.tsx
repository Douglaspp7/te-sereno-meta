import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, ShoppingCart, TrendingUp, PlaySquare } from "lucide-react";

const items = [
  { to: "/", label: "Inicio", icon: Home, match: (p: string) => p === "/" },
  { to: "/plan", label: "Plan", icon: ClipboardList, match: (p: string) => p.startsWith("/plan") },
  { to: "/ejercicios", label: "Ejercicios", icon: PlaySquare, match: (p: string) => p.startsWith("/ejercicios") },
  { to: "/compras", label: "Compras", icon: ShoppingCart, match: (p: string) => p.startsWith("/compras") },
  { to: "/progreso", label: "Progreso", icon: TrendingUp, match: (p: string) => p.startsWith("/progreso") },
] as const;


export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.match(path);
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-9 w-12 items-center justify-center rounded-full transition ${
                    active ? "bg-accent" : ""
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
