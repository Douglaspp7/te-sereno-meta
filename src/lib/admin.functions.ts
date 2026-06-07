import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getAllowlist = createServerFn({ method: "GET" })
  .handler(async () => {
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
    const { error } = await supabaseAdmin
      .from("hotmart_allowlist")
      .delete()
      .eq("email", email);
      
    if (error) throw error;
    return true;
  });
