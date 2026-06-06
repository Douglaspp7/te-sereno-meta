import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço preparado para integração futura com Webhooks da Hotmart.
 * Atualmente atua como uma interface mockada.
 */
export class HotmartService {
  /**
   * Valida se uma compra é legítima na Hotmart.
   */
  static async validatePurchase(transactionId: string, email: string): Promise<boolean> {
    console.log(`[HotmartService] Verificando compra ${transactionId} para ${email}...`);
    // Mock: Na prática, isso fará uma call pra uma Edge Function do Supabase
    // que checa a API da Hotmart.
    return true;
  }

  /**
   * Atualiza a assinatura do usuário no Supabase.
   */
  static async syncSubscription(userId: string, plan: 'basic' | 'premium', expiresAt?: Date): Promise<void> {
    console.log(`[HotmartService] Sincronizando assinatura de ${userId} para ${plan}...`);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_started_at: new Date().toISOString(),
        subscription_expires_at: expiresAt ? expiresAt.toISOString() : null
      })
      .eq('id', userId);

    if (error) {
      console.error("[HotmartService] Erro ao sincronizar assinatura:", error);
      throw error;
    }
  }

  /**
   * Cancela o acesso do usuário.
   */
  static async cancelAccess(userId: string): Promise<void> {
    console.log(`[HotmartService] Cancelando acesso de ${userId}...`);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'expired'
      })
      .eq('id', userId);

    if (error) {
      console.error("[HotmartService] Erro ao cancelar acesso:", error);
      throw error;
    }
  }
}
