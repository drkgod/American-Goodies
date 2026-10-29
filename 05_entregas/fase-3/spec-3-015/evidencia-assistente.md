# Evidência — Assistente de consulta, somente leitura (SPEC-3-015)

Data: 29/10/2026 · Skip v0.0.192 (ref 605a9e5), aplicada com QA verde na primeira tentativa e publicada; migration 0043 aplicada. IA nativa conferida em `skip_cloud_ai_guide`: `$ai.chat` (modelo "fast", com ferramentas) vem provisionada no projeto, sem chave nossa e sem provedor externo; o gasto sai dos créditos do Skip.

## Construído
- **Módulo provado (`assistente.ts`, IA simulada):** ferramentas por área (alertas: planejamento, compras ou faturamento; compras: compras; pedidos: faturamento; produção: planejamento ou apontar_producao); pedido de ação recusado antes de chamar a IA, com a tela certa (comprar, aprovar, publicar, liberar, enviar ao Omie, gravar/lançar, alterar); "sem acesso" idêntico para quem não tem a ação do assistente, não tem perfil ou não tem nenhuma área que sirva; ferramenta fora da área nunca roda; resposta da IA exige JSON com fontes e período, e cada fonte precisa ser uma ferramenta realmente consultada, com acesso e com dados, senão é descartada ("não consegui responder com fonte"); sem dados, diz que não há e o que falta; sugestão sai marcada "(nada foi executado)"; no máximo 4 rodadas de IA; IA indisponível devolve mensagem.
- **Rota `POST /backend/v1/pcp/assistente` e tela `/assistente`:** exige a ação `consultar_assistente` (403 sem pistas). Ferramentas só leem tabelas locais, com o mesmo recorte de área das telas: alertas abertos da área, requisições de compra, preparação de pedidos e pedidos manuais; produção responde "sem dados" com a falta explicada. Cada resposta mostra fonte, período, hora e limites. Cada pergunta é registrada em `pcp_assistente_perguntas` (pessoa, pergunta cortada em 1000 caracteres, ferramentas, fontes, resultado, resposta, nº de chamadas de IA); sem segredo, e a tela avisa para não digitar dado pessoal. Nenhuma ferramenta grava nada além desse registro.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-015, **165 de 165 passaram** (7 novos em `spec-3-015.test.mjs`, com IA simulada).
  P3.15-01 (Compras pergunta de faturamento: a ferramenta não roda; sem acesso idêntico para os demais casos), P3.15-02 ("compre 10 KG de farinha": recusa, "Compras > Requisições", zero chamada à IA e zero ferramenta), P3.15-03 (resposta sem fonte, com fonte não consultada, sem período ou sem JSON: descartada),
  além de produção da semana com fonte, período e hora (simulada), sugestão marcada, sem dados, IA indisponível, ferramenta sem acesso que não vira fonte e limite de rodadas.
- QA do Skip verde na v0.0.192.

## Limites e pendências
- **P3.15-04 (GREEN com a IA nativa) não provado:** não há conta de teste para chamar a rota, então a IA real nunca respondeu; o fluxo com `tool_calls` do `$ai.chat` segue o formato OpenAI do guia, mas não foi exercitado. A primeira pergunta real deve ser feita com a gestão na sessão final.
- **P3.15-05:** as rotas de leitura e acessos de origem não foram alteradas; seus testes de fases anteriores não foram reexecutados.
- **Desvio da SPEC:** as ferramentas leem as tabelas diretamente no servidor, com o recorte de área de quem pergunta, e não chamam as rotas de leitura pela rede (sem conta de serviço e sem ampliar acesso). Elas cobrem alertas, compras, pedidos e produção; painel, catálogo, sugestões, relatórios e entregas ainda não são ferramentas.
- **Dados reais:** produção responde "sem dados" (apontamentos não guardados no servidor); entregas e pedidos do Omie dependem da leitura (CL-PEND-006).
- **Custo (CL-PEND-014):** cada pergunta gasta créditos do Skip; não há limite mensal implementado nem informado.
- **Quem usa (CL-003):** nenhuma conta real recebeu a ação `consultar_assistente`. O item de menu aparece só para a área painel; as demais áreas chegam por `/assistente`.
- O classificador de pedido de ação é por palavras: "devo comprar?" também é recusado (recusa inofensiva); "quanto compramos" passa.
- Dados pessoais digitados na pergunta ficam no registro; sem filtro automático.
