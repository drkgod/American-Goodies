# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (15/10/2026):** 5/29 concluídas — 51356fad (matriz nominal v1.2), 49327a88 (21 contas reais ativas, troca obrigatória de senha, revogação dos perfis de teste @pcp.local), 3def6d06 + 45dc0e7d + 69ffd20a (três duplicatas do fundamento conciliadas — **critério CA-A4 fechado 3/3**), todas com teste humano aprovado pelo owner. Produção: v0.0.77 (ref 6e05dac, 14/10 16:44). Demais 24 tasks abertas; nenhuma task ativa (aguardando novo pedido do owner).

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.77 (ref 6e05dac, publicado 14/10 16:44).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23, regressão 8/8 registrada pelo executor. Histórico preservado em 05_entregas/fase-1/contratos-homologados; fontes/provas anteriores não foram apagadas.

Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c) e pontos da Keoma na matriz (2c4a9b7e). Todos os IDs foram preservados; duplicata não exige refazer sistema/tela.

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar uma task elegível em 04_fase-atual/fase.md. Construir fundamento com fixtures identificadas antes de conectar dados reais. Depois: programação/OP → apontamentos → expedição/câmara → consolidação → envio autorizado. Sugestões têm método/parâmetros sujeitos à aprovação do PCP.

Gates localizados: matriz/ações para acesso nominal (RESOLVIDO — matriz v1.2 + contas reais ativas); duplicatas do fundamento (RESOLVIDO — CA-A4 3/3); cadastro/unidade/ficha para cálculo/apontamento dependente; histórico/recebimentos completos para sugestões; autorização transacional específica para cada OP/efeito no Omie. Provas negativas de revogação/reinício/concorrência/timeout devem passar antes do primeiro POST real.

**Próxima ação:** executar uma task independente de fundamento ou regularização e pedir teste humano ao terminar. Pendência de entrada não impede fundamento sintético independente. Não executar tarefa seguinte antes do aceite explícito da anterior.

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. Ajustes de saldo reprogramado, resultado 0, pedidos firmes, ação editar_programacao e recuperação mock foram conferidos; IDs/status preservados. Projeto não alterado nem testes do produto executados nesta revisão. **Atualização publicada no GitHub:** revisão de 13/10 aprovada pelo consultor e sincronizada em drkgod/American-Goodies, branch main. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.