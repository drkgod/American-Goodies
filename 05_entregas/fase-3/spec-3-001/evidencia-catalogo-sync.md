# Evidência — Trazer o catálogo real do Omie produto a produto (SPEC-3-001, CA-3-01)

Data: 28/10/2026 · Skip v0.0.170 (ref b2387dd), publicada e provada (status sem pendências além de `.skip.config.json`).

## O que foi construído
- `src/lib/pcp/catalogo-sync.ts`: contrato puro — sub-lotes pequenos, cursor de retomada, parada no primeiro
  bloqueio (HTTP 425 ou "consumo redundante") com próxima tentativa em +12 h, erro transitório sem avançar o
  cursor, catálogo anterior mantido até o lote novo ficar completo.
- `pocketbase/hooks/pcp_catalogo_sync.js`: `POST /backend/v1/pcp/catalogo/sync` (perfil técnico). Lista de códigos
  = posição de estoque ativa; lote de staging; pausa de 350 ms; ativação atômica só com a lista inteira. Só leitura.
- `tests/pcp/spec-3-001-catalogo-sync.test.mjs`: 8 provas (P3.01-01 e derivadas).

## Provas
- QA do Skip (setup, análise estática, build, integrações): verde. **A suíte de testes não rodou** (`qa.test.ran = false`;
  o template não tem executor) e não havia Node local: os testes ficam escritos, mas **não foram executados**.
- Teste de mesa refeito contra o código final (8 casos): bloqueio no 3º código (cursor 2, +12 h), guarda (0 chamadas
  antes da hora, 1 depois), sub-lotes de 2 (3 chamadas, sem repetir), troca só com lote completo, não encontrado vira
  faltante, erro não avança, classificação 425/consumo redundante/ok/ausente/500, entrada imutável.

## Pendente (não provado)
- P3.01-03: leitura real e conferência de três produtos com o Omie. A chave do Omie está bloqueada desde 23/10
  (CL-PEND-006); o endpoint não foi chamado de propósito para não renovar o bloqueio. A task fica em andamento.
- A lista de códigos usa só o estoque; fichas e pedidos entram na task da lista de faltantes (CA-3-02).

## Risco encontrado
- `pocketbase/hooks/pcp_catalogo_dirigido_run.js` (temporário da fase 2) tem um token de acesso fixo no código.
  Recomendo remover o arquivo; não alterei por estar fora do recorte desta task.

## Atualização 28/10/2026 — testes executados de verdade
Foi baixado o Node.js v24.22.1 (nodejs.org, checksum SHA-256 conferido) numa pasta temporária, sem instalar no computador.
Comando: `node --test tests/pcp/*.test.mjs` sobre os módulos do Skip v0.0.174 e os testes das SPECs 3-001 e 3-002.
Resultado: **28 testes, 28 passaram, 0 falharam** (8 de sincronização do catálogo, 4 de faltantes, 6 de conversão dos 90 dias, 10 de envio da produção).
Os módulos testados são os mesmos do Skip, copiados sem os comentários longos; a execução não toca o Omie nem o banco.
Isso substitui o "só teste de mesa" dos itens acima para essas funções. O que continua sem prova: leitura real do Omie, tela no navegador e a
regressão da fase 2 (testes `spec-2-*`, que não foram copiados para rodar).
