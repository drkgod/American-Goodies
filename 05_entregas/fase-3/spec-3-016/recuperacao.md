# Relatório de recuperação (SPEC-3-016) — só contagens, sem dados

Data: 29/10/2026 · Autorizado pelo dono (criação de um projeto de teste descartável no Skip).

## Restauração da cópia num ambiente separado (P3.16-04)

- **Ambiente:** projeto de teste Skip nº 70908 ("TESTE descartável - restauração American Goodies"), vazio, separado da produção (62774). Nada foi feito na produção.
- **Pacote usado: de DEMONSTRAÇÃO**, gerado pelo mesmo módulo de exportação (`exportacao.ts`) com dados fictícios — não é a exportação dos dados reais da produção. Não consegui exportar a produção porque a rota exige uma conta com `exportar_dados` e não há conta de teste; as contagens reais ficam para a sessão final.
- **Como foi restaurado:** uma migration única (só no ambiente de teste) leu os CSVs do pacote, criou as 38 coleções (colunas de texto, sem o esquema original) e carregou os registros, incluindo CSV com aspas, ponto e vírgula e quebra de linha dentro do campo.
- **Conferência:** contagens do ambiente separado × resumo do pacote, por coleção.

| Coleção | Resumo do pacote | Restaurado |
|---|---|---|
| pcp_historico_vendas_periodo | 50 | 50 |
| pcp_tabelas_preco | 4 | 4 |
| pcp_requisicoes | 3 | 3 |
| pcp_unidades | 2 | 2 |
| pcp_alertas | 1 | 1 |
| pcp_pedidos_manuais | 1 | 1 |
| demais 32 coleções (vazias) | 0 | 0 |

- **Resultado:** 38 de 38 coleções e 61 de 61 registros iguais; `conferirRestauracao` devolveu `ok`. Com uma coleção removida de propósito (`pcp_volumes`), a prova falha e aponta a coleção.
- **Limites:** o esquema original (tipos de campo, índices, regras) não foi reproduzido, só os dados e as contagens; a restauração real exigirá aplicar as migrations do sistema e importar os CSVs. O backup nativo do Skip não apareceu nas ferramentas disponíveis.

## Recuperação das leituras (P3.16-05)
Provada em teste automático (`tests/pcp/spec-3-016.test.mjs`) com a rotina real de leitura do catálogo do Omie (SPEC-3-001): a falha mantém o lote válido anterior, a retomada continua do cursor sem reler nem duplicar, e o bloqueio 425 respeita a espera de 12 horas. A leitura da Nuvemshop é coberta por testes de integração da fase 1 que exigem conta de teste e não foram reexecutados.

## Descarte
O projeto de teste 70908 pode ser apagado quando o dono quiser (a plataforma não me deixa apagar projeto). A rota pública usada para ler as contagens foi removida e a versão sem ela foi aplicada ao ambiente de teste.
