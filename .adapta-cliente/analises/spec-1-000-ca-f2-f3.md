# Análise — SPEC-1-000, CA-F2/F3: Montar as telas com dados de demonstração

Data: 2026-10-01 · Executor: MCC (ETHOS) · Etapa: aguardando autorização

## Objetivo e resultado observável

Navegação, catálogo e os quatro blocos do painel demonstráveis com fixtures sintéticas e aviso
permanente de demonstração (CA-F2); vazio, erro e ausência distintos, fixture nunca publicada
como snapshot real e nenhuma chamada a Omie/Nuvemshop (CA-F3) — agora com prova formal (TDD
GREEN + rastreio de rede), não apenas inspeção manual.

## Estado atual (herdado da task CA-F1, concluída)

- Telas `Painel.tsx` (4 blocos + seletor de estado) e `Catalogo.tsx` existem, com banner.
- Provider de demonstração existe, com estados ok/vazio/indisponivel/falha e fixtures isoladas.
- Rotas `/catalogo` e `/painel` registradas; QA do build 0.0.4 passou.
- **Lacuna:** `tests/pcp/spec-1-000.test.mjs` contém as asserções de RED (provavam ausência) —
  stale após a implementação; precisa ser reescrito como GREEN.
- **Lacuna:** nenhuma prova automatizada de que o provider não faz chamadas externas.
- **Lacuna:** rastreio de requisições da prévia ainda não registrado como evidência.

## Plano concreto

1. Reescrever `tests/pcp/spec-1-000.test.mjs` como GREEN:
   - contrato do provider: estados, `fonte: 'demonstracao'`, `observado_em` ISO, fixtures
     exatas da SPEC (P1=10 UN/A, P2=2 KG/B, OP-1, C-1, OM-11/OM-L1 oficiais, NS-10 intenção);
   - estados vazio/indisponivel/falha retornam `dados: null` e mensagem própria (sem fabricar dado);
   - isolamento: nenhuma referência a Omie/Nuvemshop/fetch/rede no módulo do provider (varredura
     estática do código-fonte das telas e do provider);
   - navegação: rotas `/catalogo` e `/painel` presentes em `src/App.tsx`; banner presente nas
     duas telas.
2. Executar o runner e registrar comando/resultado na evidência.
3. Rastreio de rede da prévia (requisições observadas ao abrir /painel e /catalogo) registrado
   na evidência — prova de zero chamada a domínios externos de ERP/canal.
4. Atualizar `05_entregas/fase-1/spec-1-000/evidencia-ca-f2-f3.md`.

## Matriz critério → prova

| Critério | Prova |
|---|---|
| CA-F2 | Testes GREEN de fixtures/rotas/banner + captura da prévia |
| CA-F3 | Testes GREEN dos 3 estados + varredura estática (zero rede) + rastreio de requisições da prévia |

## Riscos e limites

- Recorte mínimo: apenas testes e evidência; nenhuma mudança de produto prevista. Se um teste
  GREEN revelar defeito real nas telas/provider, a correção entra nesta task (mesma SPEC, mesmo
  critério) e é retestada.
- O rastreio de rede completo e a conferência final do fundamento (CA-F1–F4) permanecem na
  terceira task ("Conferir o fundamento antes das conexões").

## Verificação automática e teste humano

- Automática: `node --test tests/pcp/spec-1-000.test.mjs` + QA nativo do Skip.
- Humano (Keoma): navegar na prévia, conferir banner, fixtures e os três estados alternando o
  seletor; confirmar que nada sugere dado real do Omie.
