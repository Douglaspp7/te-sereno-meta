import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthRedirect,
});

function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/", replace: true });
  }, [navigate]);

  return null;
}
