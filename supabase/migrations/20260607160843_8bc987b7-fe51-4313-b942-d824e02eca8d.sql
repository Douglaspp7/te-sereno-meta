
CREATE POLICY "No client access to email_send_log" ON public.email_send_log AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client access to email_unsubscribe_tokens" ON public.email_unsubscribe_tokens AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client access to suppressed_emails" ON public.suppressed_emails AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client access to email_send_state" ON public.email_send_state AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
