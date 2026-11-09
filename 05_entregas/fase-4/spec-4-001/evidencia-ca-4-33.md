# Evidência — CA-4-33 (produção do servidor em relatório, alerta e exportação)

Data: 09/11/2026 · Skip v0.0.206 (ref 1ee38b8) · tarefa em andamento (`[/]`).

## O que foi feito
- `pcp_exportacao`: lista com `pcp_programacoes`, `pcp_apontamentos`, `pcp_conferencias_op`, `pcp_aprovacoes_consolidacao`; coleção com o campo `demonstracao` só exporta e conta os reais. `exportacao.ts` (recuperação) lê a mesma lista e o pacote marca `demonstracao_fora`.
- `pcp_relatorios` (bloco produção): última programação real × apontamentos × conferências do servidor, na conta de `relatorioProducao`; consumo continua "sem dados" até a ficha real. Tela `/relatorios` mostra o bloco com "sem dado" no lugar de zero.
- `pcp_alertas_rodar` (RN-02): ordens da programação real sem apontamento e com dia programado anterior a hoje geram o alerta de produção atrasada (`regraProducao`); demonstração fica fora.
- Módulo puro `producao-fontes.ts` (espelho em `07-sistemas/pcp/codigo/`); os hooks repetem a conta.

## Provas
- `green-CA-4-33.txt`: 9 testes; `regressao.txt`: 245 de 245.

## Limites
- Não exercitado contra o servidor (sem usuário de teste). O espelho dos hooks e das telas de relatório ainda não foi feito.
- Escolhas de produzido, conferido e unidade em `06_notas/producao-nos-relatorios-escolhas-2026-11-09.md`.
