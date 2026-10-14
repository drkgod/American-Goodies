# Proposta de Fase 2 — RASCUNHO para aprovação do consultor

> **Este arquivo é um DRAFT preparado pelo executor (MCC/ETHOS) com base nas lacunas reais
> registradas durante a Fase 1. NÃO é escopo aprovado: nada daqui é implementado sem pacote
> oficial (SPECs/tasks) definido pelo consultor e gates de aceite.**

- Data: 2026-10-09 · Autor: MCC (ETHOS) · Estado: aguardando consultor

## Base factual (lacunas e pendências registradas na Fase 1)

1. **Produção e Compras sem fonte** — os dois blocos do painel estão explicitamente
   bloqueados (`fonte_nao_integrada_na_fase_1`); a operação ainda não vê OPs nem compras.
2. **Ficha técnica ausente** — a API autorizada do Omie não expõe ficha/receita; catálogo
   mostra estado explícito.
3. **Cadastro de produtos VAZIO** (0 registros) — catálogo pronto, lista quando povoado.
4. **Matriz nominal (CL-003) pendente** — acesso real por pessoa bloqueado; perfis
   sintéticos @pcp.local são fixtures de teste (produção já no ar com eles).
5. **Estoque sem histórico diário** — a fonte expõe só posição atual; o "painel DIÁRIO"
   de estoque exige snapshots diários (cron) para virar série histórica.
6. **Canal da loja própria (Lunet)** — oficiais com referência `OH…` (~2.545 pedidos) são
   de outro canal não identificado no painel; SPEC-1-003 registrou não criar conexão por
   inferência.

## Escopo candidato (ordem sugerida por dependência)

| # | Pacote candidato | Resolve | Dependência |
|---|---|---|---|
| P2-1 | Leitura de OPs e compras do Omie (contrato a reconciliar na conta) + blocos do painel | lacuna 1 | CL-001 ✓; contrato real da conta |
| P2-2 | Snapshots diários de estoque (cron) + série histórica no painel | lacuna 5 | P2-1 (mesma mecânica) |
| P2-3 | Matriz nominal aprovada + contas reais por pessoa + revogação dos perfis sintéticos | lacuna 4 | decisão do cliente (CL-003) |
| P2-4 | Ficha técnica (quando a API expor) + cenários de incompletude com cadastro povoado | lacunas 2–3 | Omie/cliente |
| P2-5 | Canal da loja própria (identificar origem dos `OH…`; conexão Lunet se comprovada) | lacuna 6 | consultor |

## O que NÃO está proposto (fora de escopo, como na Fase 1)

Baixa de produção, cotação/aprovação de compras, entrada fiscal, faturamento, escrita no ERP
ou nos canais, IA/sugestões.

## Gates de cada pacote (mesmo padrão da Fase 1)

Pré-condições → implementação → prova com dados reais → teste humano → aceite explícito;
secrets sempre no servidor; nenhuma escrita nas fontes.
