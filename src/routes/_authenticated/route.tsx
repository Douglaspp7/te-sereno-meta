import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw redirect({ to: "/auth" });
    }

    // Ignorar validação de assinatura se já estiver na tela de ativação
    if (location.pathname === '/activate') {
      return { user };
    }

    // Buscar o status da assinatura
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile for subscription check:", profileError);
    }

    const status = profile?.subscription_status || 'active'; // Fallback to active to avoid breaking existing users if missing

    if (status === 'inactive' || status === 'expired') {
      throw redirect({ to: "/activate" });
    }

    return { user };
  },
  component: () => <Outlet />,
});
