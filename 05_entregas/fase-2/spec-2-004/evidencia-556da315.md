# Evidência — Task 556da315: Construir as duas telas de conferência (SPEC-2-004, CA-C1/C2, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (bloco anterior aprovado 09:02)
- **Versões Skip**: 0.0.86 (contrato+testes, QA ok) → 0.0.87 (tela /conferencias, QA ok) → **0.0.88** (acesso de demonstração, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.88, ref f3dbb95** (12:13 UTC; status: lastPublishedRef = f3dbb95 = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/conferencia.ts`: registrarConferencia (ponto sem acesso nega sem pistas; quantidade finita ≥0; conferência 0 exige motivo; câmara sem expedição eficaz da OP é bloqueada — C2; replay UUID+hash idempotente, hash diferente = 409), montarFila (quatro quantidades independentes: produzido/encaixotado/recebido/câmara; deltas preservados; ausência NUNCA vira 0 — null explícito; divergência bloqueia; igualdade decimal exata libera fila revisável SEM transação/envio — envio é gate da SPEC-2-005).
2. **Tela** `/conferencias`: registro das duas etapas com motivo obrigatório para 0, fila de consolidação com 4 quantidades/deltas/pendências e tabela de conferências registradas. Banner "Tela de demonstração" permanente.
3. **Testes TDD** `tests/pcp/spec-2-004-conferencia.test.mjs`: 8 testes (T0–T5, oráculos T1/T2/T3/T5 da SPEC; C4/T4 fica na task 30118f65).

## Acesso de demonstração (impedimento do teste resolvido)

- Impedimento: owner não tem senha da Angela; Keoma (conta do owner) não tem a área conferir_expedicao na matriz v1.2 → não conseguiria abrir /conferencias.
- Solução (recorte sintético, sem ampliar acesso real): rota /conferencias protegida pela área "painel" durante a DEMONSTRAÇÃO (flag DEMO_CONFERENCIA em src/components/Layout.tsx, marcada para remoção na task d77447ab — uso real), e os botões "Conferir" só ficam ativos quando o perfil tem a ação conferir_expedicao (Keoma vê a tela em modo visualização, com nota explicativa).
- A conferência REAL continua restrita a Angela/Cristiano/Kevin (pontos expedicao/camara_fria) — nada mudou na matriz nem nos perfis Skip.

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.88, ref f3dbb95) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **8/8 pass** — T1: 100/98/97/96 com deltas −2/−1/−1 e fila bloqueada; T2a: câmara sem expedição bloqueada; T2b: ponto errado nega; T2c: replay idempotente + 409; T3: tudo 100 → revisável/coincidente; T5a: 0 sem motivo negado, com motivo registra, ausência não vira 0; T5b: recebimento 1 vs produzido 0 é divergência |
| Publicação | skip_project_publish → publishedRef **f3dbb95** (12:13:49Z); status confirma lastPublishedRef=f3dbb95=versionHash |
| Isolamento | fixtures sintéticas (OP-S-2-001 v2); nenhuma chamada de rede |

## Observação de escopo

Conferências REAIS (etapas encerradas, pontos nominais, replay em produção) são a task d77447ab; revisão de divergências e invalidação de aprovações (CA-C4, T4) é a 30118f65. Esta task entrega as duas telas com o fundamento sintético (CA-C1/C2 no recorte).

## Teste humano — roteiro (bloco: conferências sintéticas) — com a SUA conta (Keoma)

1. Entrar normalmente com keoma.targino@mccfranchising.com.br.
2. Menu **Conferências** (aparece no menu; a tela abre em modo visualização com nota explicativa — seu perfil não tem a ação de conferir, e é isso mesmo): a fila mostra produzido 100 / encaixotado 98 e as duas conferências ausentes (nada preenchido com 0).
3. Botões "Conferir" desabilitados (modo visualização) — a conferência real é de Angela/Cristiano/Kevin.
4. Confirmar que Painel/Catálogo/Qualidade/Planejamento/Apontamentos continuam funcionando.

### Alternativa: teste completo com os botões ativos

Se quiser exercitar os botões (registrar expedição 97, câmara 96, 0 sem motivo → negado etc.), duas opções:
- **a)** Entrar com a conta da Angela (angela.silva@mccfranchising.com.br) com a senha inicial do cofre PCP_INITIAL_PASSWORDS — se ela nunca trocou; ou
- **b)** Eu reseto a senha inicial da Angela para um valor novo (migração idempotente, como já feito na 49327a88) e te entrego no chat.

Estado da task: no ar, aguardando teste do bloco.