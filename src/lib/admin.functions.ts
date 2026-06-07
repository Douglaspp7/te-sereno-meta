import { createServerFn } from "@tanstack/react-start";

export const getAllowlist = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("hotmart_allowlist")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  });

export const deleteAllowlistEmail = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("hotmart_allowlist")
      .delete()
      .eq("email", email);
      
    if (error) throw error;
    return true;
  });
