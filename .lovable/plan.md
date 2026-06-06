## Objetivo

Deixar o app pronto para comercialização via Hotmart:
- Apenas compradores aprovados conseguem acessar (allowlist por email).
- Compradores entram com o próprio email via magic link.
- `douglasp7@hotmail.com` é admin e entra com senha fixa `517243`.

## Situação atual

- A tabela `profiles` **não tem** as colunas `subscription_status`, `subscription_plan`, etc. — o código em `activate.tsx` e `_authenticated/route.tsx` referencia colunas que não existem, então hoje **todo mundo entra**.
- O login do admin com senha já está implementado no `index.tsx`.
- O fluxo do magic link já funciona.

## O que vou construir

### 1. Banco de dados (migration)

**Adicionar à `profiles`:**
- `subscription_status` (`text`, default `'inactive'`)
- `subscription_plan` (`text`, nullable)
- `subscription_started_at` (`timestamptz`, nullable)
- `subscription_expires_at` (`timestamptz`, nullable)
- `hotmart_transaction_id` (`text`, nullable)
- `is_admin` (`boolean`, default `false`)

**Nova tabela `hotmart_allowlist`** (compradores aprovados que ainda não criaram conta):
- `email` (PK), `transaction_id`, `plan`, `purchased_at`, `status` (`active` / `refunded` / `cancelled`).
- Acessível apenas pelo `service_role` (webhook).

**Atualizar trigger `handle_new_user`:**
- Quando um usuário se cadastra, busca o email em `hotmart_allowlist`.
- Se encontrado e `status='active'` → cria profile já com `subscription_status='active'`.
- Senão → `'inactive'` (será mandado para `/activate`).
- Caso especial: email `douglasp7@hotmail.com` entra como `is_admin=true` e `subscription_status='active'`.

### 2. Webhook Hotmart

Rota pública `POST /api/public/hotmart/webhook`:
- Verifica o `hottok` (token secreto da Hotmart) — request rejeitado se inválido.
- Eventos tratados:
  - `PURCHASE_APPROVED` / `PURCHASE_COMPLETE` → insere/atualiza em `hotmart_allowlist` como `active` **e** ativa o profile se já existir.
  - `PURCHASE_REFUNDED` / `PURCHASE_CHARGEBACK` / `PURCHASE_CANCELED` → marca allowlist como `refunded`/`cancelled` e seta profile como `expired`.
- Usa `supabaseAdmin` (server-only).

### 3. Tela `/activate` (ajuste)

Hoje ela "ativa" no clique sem validar nada (mock). Vou trocar por:
- Exibe instruções: "Compre na Hotmart com este email" + link da página de vendas (placeholder até você passar a URL).
- Botão **"Já comprei, verificar"** que chama um serverFn `checkPurchase()` que consulta `hotmart_allowlist` pelo email do usuário logado e, se ativo, atualiza o profile.
- Botão **"Sair"** para trocar de conta.

### 4. Admin bootstrap

- Garantir que `douglasp7@hotmail.com` existe como usuário com senha `517243`, `is_admin=true`, `subscription_status='active'`. Faço via insert depois da migration.

### 5. Segredo necessário

Vou pedir o **`HOTMART_HOTTOK`** (token que a Hotmart envia em cada webhook — você pega na configuração do produto na Hotmart, aba "Ferramentas → Webhook").

## Detalhes técnicos

- Webhook em `src/routes/api/public/hotmart/webhook.ts` (`createFileRoute` com handler POST).
- ServerFn `checkHotmartPurchase` em `src/lib/hotmart.functions.ts` usando `requireSupabaseAuth` + `supabaseAdmin` (import dinâmico).
- URL do webhook a configurar na Hotmart: `https://mireto21.com/api/public/hotmart/webhook`.

## O que vou pedir depois

1. O segredo `HOTMART_HOTTOK`.
2. URL da página de vendas Hotmart (opcional, para colocar na tela `/activate`).

Confirma para eu seguir?