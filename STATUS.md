# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado:** pacote liberado pelo consultor em 09/10/2026, pronto para execução. Sete SPECs com TDD e29 tasks;29 UUIDs reais reconciliados. Nenhuma taskF2 executada nesta liberação.
**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. ProduçãoF1: https://mcc-automacao-fabrica-98125.goskip.app, v0.0.61 conforme prova registrada em 08/10.

## Transição e pendências

Fase 1 encerrada no recorte homologado:18 entregas, aceite explícito do owner em 08/10 às 18:23, regressão 8/8 registrada pelo executor. Histórico preservado em 05_entregas/fase-1/contratos-homologados; fontes/provas anteriores não foram apagadas.

Transferidos ainda abertos: cadastro de produtos no ERP, aprovação da matriz nominalCL-003 e três cards duplicados dofundamento para conciliação oficial. Todos osIDs foram preservados; duplicata não exige refazer sistema/tela.

## Execução da fase

Ler04_fase-atual/specs/00-INDICE.md e selecionar uma task elegível em 04_fase-atual/fase.md. Construir fundamento com fixtures identificadas antes de conectar dados reais. Depois: programação/OP→apontamentos→expedição/câmara→consolidação→envio autorizado. Sugestões têm método/parâmetros sujeitos à aprovação doPCP.

Gates localizados: matriz/ações para acesso nominal; cadastro/unidade/ficha para cálculo/apontamento dependente; histórico/recebimentos completos para sugestões; autorização transacional específica para cadaOP/efeito no Omie. Provas negativas de revogação/reinício/concorrência/timeout devem passar antes do primeiroPOST real.

**Próxima ação:** executar uma task independente de fundamento ou regularização e pedir teste humano ao terminar. Pendência de entrada não impede fundamento sintético independente. Não executar tarefa seguinte antes do aceite explícito da anterior.

## Revisão documental — 13/10/2026

As sete SPECs e29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. Ajustes de saldo reprogramado, resultado0, pedidos firmes, ação editar_programacao e recuperação mock foram conferidos; IDs/status preservados. Projeto não alterado nem testes do produto executados nesta revisão. **Atualização publicada no GitHub:** revisão de13/10 aprovada pelo consultor e sincronizada em drkgod/American-Goodies, branch main. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.
