# Evidência — SPEC-1-005 · Task ca5ece04: Mostrar atualização e falhas em cada bloco (CA-P3, CA-P4)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: ca5ece04-40ed-4c93-8fa4-1e0875505fbe
- Versões do projeto Skip 62774: 0.0.57–0.0.58 (QA nativo ok)

## Implementação (sobre a task ee794334)

- **Aviso de lote antigo após erro (CA-P3)**: quando o `estado_tecnico` da fonte não é
  `ok`, cada bloco acrescenta a pendência "Última tentativa de atualização FALHOU (estado:
  X) — exibindo dado do último sucesso (horário); dado pode estar desatualizado" — o lote
  válido anterior nunca é apresentado como recém-atualizado.
- **Estados diferenciados (CA-P3)**: ZERO VÁLIDO (lista vazia com lote ativo e leitura ok,
  ex.: catálogo com cadastro vazio) ≠ INDISPONÍVEL (sem lote/sem acesso, com motivo) ≠ LOTE
  ANTIGO (aviso acima) ≠ SALDO AUSENTE (null ≠ zero, linha a linha).
- **Permissão por bloco no servidor (CA-P4)**: bloco sem área devolve APENAS
  `{autorizado:false}` — sem linhas, contagem, motivo ou pistas do setor.

## Prova real (conta do cliente)

1. **Lote antigo (CA-P3)**: migration temporária 0016 marcou a fonte estoque como
   `falha_teste_lote_antigo` (lote e último sucesso PRESERVADOS) → bloco Estoque respondeu
   `disponivel:true, total:1057` COM a pendência de aviso (estado + horário do último
   sucesso) — dado antigo nunca vira fresco; migration 0017 restaurou `ok` (revalidado:
   `estado_tecnico: ok, pendencias: []`).
2. **Zero válido vs indisponível (CA-P3)**: produtos com lote ativo vazio → zero legítimo
   com pendência explicativa (prova da SPEC-1-004); estoque sem lote → `sem_lote_ativo`
   com orientação técnica; produção/compras → `fonte_nao_integrada_na_fase_1`.
3. **Permissão por bloco (CA-P4)**: `usuario-teste-compras` (áreas compras+painel) →
   `estoque/producao/pedidos` = `autorizado:false` SEM linhas/contagem/pistas; `compras`
   = autorizado com bloqueio explícito de Fase 1; resposta idêntica via UI (blocos ocultos
   mostram só "Sem permissão").
4. **Conteúdo externo (CA-P4)**: a UI renderiza via JSX (React escapa texto) — descrições
   da fonte nunca executam script; nenhum HTML arbitrário é montado no cliente.
5. Regressão: painel completo estável (estoque 1057, oficiais 5393, canal 270/2647/44/373/10);
   health 200.

## Teste humano (roteiro)

1. Painel: conferir que cada bloco mostra fonte/lote/último sucesso/estado.
2. (Com o executor) falhar uma fonte propositalmente → bloco mantém o dado com o aviso de
   lote antigo; recuperação devolve o estado ok.
3. Entrar com o perfil de Compras → só o bloco de Compras aparece com conteúdo; os demais
   dizem "Sem permissão para esta área".
