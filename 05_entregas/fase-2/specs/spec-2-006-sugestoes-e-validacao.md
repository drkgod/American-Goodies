# SPEC-2-006 — Sugestões explicadas e demonstração integrada

**Fase:** 2 · **Revisão:** 13/10/2026 (pacote liberado em09/10) · **Origem:** RQ-003/008/009; CL-006; CL-PEND-001.
**Tipo:** sistema · **Dono funcional:** PCP revisa produção; Compras necessidade; equipe valida.
**Degrau da solução:** reuso do projeto Skip 62774, autenticação/backend/banco nativos; construção mínima do recorte, sem outro provider.

## Contexto e decisões fechadas

Histórico/parâmetros dependem das SPECs anteriores; nenhuma margem/prazo foi fornecida neste pacote.

Transição autorizada em 09/10: pendências entram nesta fase ainda abertas. Omie é fonte oficial. Construir primeiro fundamento/contratos/telas com demonstração identificada, depois conexões reais. Construir em sequência, sem pedir autorização nem teste entre tasks; sem teste humano nesta fase (emenda de 26/10): toda task fecha pela prova automática.

## Resultado observável

PCP vê sugestão explicada por produto/capacidade; Compras vê necessidade de insumo; equipe demonstra percurso completo.

## Limites e dependências

- **Inclui:** Cálculo determinístico proposto para aprovação/configuração, memória de cálculo e demonstração integrada.
- **Fora desta fase/recorte:** Cotar/comprar/aprovar financeiramente, produzir automaticamente, IA ou somar intenção Nuvemshop duplicada.
- **Entradas/pré-condições:** SPEC-2-001/002 para cálculo; 003–005 para prova final; parâmetros/método aprovados e fonte de recebimentos confirmada para compra.
- **Saídas:** resultado observável e evidência sanitizada em 05_entregas/fase-2/spec-2-006/, com a prova automática por task.
- **Superfícies afetadas:** /sugestoes e /planejamento, pcp_sugestoes e resumo por área.
- **Dependências humanas:** cliente fornece cadastro/matriz/parâmetros e decisões; executor implementa/verifica. Não inventar nomes/alçadas/prazos.

## Dados e integrações

pcp_sugestoes: id,tipo producao|compra,item,unidade,período,versao_parametros,lotes_origem,entradasJSON,formula_id,quantidade nullable,pendencias[],estado calculada|bloqueada|revisada|descartada,revisor/motivo. Chave tipo/item/período/hash para replay; consulta sempre revalida escopo.

baseline90-v1 é PROPOSTA de configuração para CL-006, não regra empresarial já aprovada. PCP aceita esse método ou devolve regra diferente ao consultor antes de cálculo real. Sem aprovação, demonstrar fixture isolada e quantidade real=null; não executar expressão arbitrária.

Proposta: média diária=vendas_liquidas90/90; projeção=média×horizonte_dias×(1+margem); demanda_alvo=max(projeção,pedidos_oficiais_firmes_no_horizonte); necessidade=max(0,alvo+estoque_minimo-saldo_oficial_utilizavel-producao_programada_nao_realizada). Todos os parâmetros na unidade oficial; saldo negativo permanece sinalizado. Arredondar para cima ao múltiplo de lote aprovado; aplicar lote mínimo, validar calendário/capacidade e mostrar excedente sem ampliar horizonte. Compra: consumo_insumo=soma(q_produto×componente_por_unidade); falta=max(0,consumo+minimo_insumo-saldo_insumo-compras_confirmadas_a_receber_no_horizonte). Sem contrato de compras a receber, esse termo não vira0: compra bloqueada até leitura comprovada. Lote/múltiplo/unidade/prazo aprovados definem sugestão/data necessária; nenhuma compra é enviada.

### Contrato transversal

Reusar código/provider/guards atuais do projeto Skip. O submódulo local foi encontrado em versão de template e não prova produção: ler código, migrations, coleções e package.json atuais pelo projeto conectado antes de alterar; não substituir frontend pelo clone antigo. src/lib/pcp e tests/pcp são destinos previstos se ausentes, não arquivos já implantados.

Novas coleções têm demonstracao e isolamento no servidor; nunca unir fixtures com snapshots reais. Autorização em cada chamada por conta ativa, ação, área e ponto. Servidor fixa autor/aplicativo/hora; negar CRUD direto de coleções operacionais, incluindo perfis administrativos funcionais. Administração de perfis/configuração não concede edição ou exclusão de eventos, conferências, aprovações ou tentativas. Contas privilegiadas da plataforma que tecnicamente contornem regras ficam fora do fluxo operacional: manutenção excepcional exige autorização, backup e registro de auditoria separado; não usar credencial privilegiada na UI nem para corrigir apontamento. Secrets só backend; logs de correlação sanitizados, sem payload/credenciais.

Quantidades preservam decimais; rejeitar não finito e quantidade inválida. IDs em texto; conversão numérica na borda somente se inteiro seguro/exato, caso contrário bloquear. Unidade/local desconhecidos não viram default; não somar unidades incompatíveis. Negócio America/Sao_Paulo, auditoriaUTC.

### Contratos de firmeza e de preparação

O termo pedidos_oficiais_firmes_no_horizonte usa somente o mapa de status/data/saldo por linha aprovado pelo PCP e homologado na SPEC-2-001; o simples ingresso do pedido no Omie ou pagamento no canal não define firmeza. Sem mapa ou cobertura, esse termo énull e a sugestão de produção dependente fica bloqueada. Recebimentos confirmados continuam usando seu contrato separado, sem presumir0.

Criar/editar rascunho e aceitar sugestão exigem editar_programacao, concedida explicitamente na matriz nominal. Consultar sugestão não concede escrita. O comando revalida ação, área, versão/hash da sugestão e contexto das fontes/parâmetros; resultado alterado exige recálculo/revisão antes de aceitar. Não publicar nem executar compra/transação ao aceitar.

### Oráculos de lote e compra

Com necessidade 0, sugestão0, sem aplicar lote mínimo positivo. Com necessidade>0, resultado = teto(max(necessidade,lote_minimo)/multiplo_lote) × multiplo_lote; ambos aprovados e positivos. Aplicar capacidade depois do arredondamento e declarar excedente. Configuração de lote incompatível/ausente gera pendência.

Fixture positiva de compra: produzir100 UN com ficha0,05 KG/UN →consumo5 KG; mínimo2 KG; saldo1 KG; compras confirmadas a receber1,2 KG dentro do horizonte →falta4,8 KG; lote mínimo3 KG e múltiplo2 KG →sugestão6 KG. Pedido cancelado e recebimento fora do horizonte não abatem necessidade. Outra massa: falta1 KG com lote mínimo5 e múltiplo2 →6 KG; falta0 →0 KG. Recebimento desconhecido não é0, bloqueia. TDD registra resultado bruto, arredondado e memória antes/depois, cobrindo S1/S2.

Prova de produção não múltipla: mesmas entradas da fixtureT1, saldo19 →necessidade51, múltiplo10/lote mínimo10 →60 UN; capacidade50 →excedente10. Compra não produz pedido de compra real; efeito posterior pertence ao fluxo de compras, fora desta fase.

## Fluxo e regras

| Regra | Condição | Resultado | Exceção/ponto de parada |
|---|---|---|---|
| S1 | Faltante ou cobertura incompleta | Quantidade null e faltantes por item | Não reduzir denominador90 |
| S2 | Método/entradas aprovados | Guardar fórmula, período, lotes e entradas reproduzíveis | Pedido firme versus projeção usa máximo, sem soma duplicada |
| S3 | Aceitar sugestão | Somente rascunho, PCP ainda publica | Sem produção/compra automática |
| S4 | Provar fluxo integrado | Regressão F1 + F2 com permissões/falhas/recuperação | Falha mantém task aberta |

1. Construir cards e memória com fixture/banner.
2. PCP aprova método/parâmetros CL-006/CL-PEND-001; diferença exige emenda antes de código real.
3. Calcular por unidade e capacidade; Compras revisa necessidade apenas com dados confirmados.
4. Primeiro demonstrar timeout/perda de resposta, revogação, reinício e concorrência em adapter mock isolado conforme SPEC-2-005. Depois demonstrar o caso real expressamente autorizado:90 dias→sugestão→programação→apontamentos→dupla conferência→aprovação→uma conclusão ERP reconciliada. Não provocar falha/timeout na produção para cumprir o roteiro; caso real fica separado das provas negativas.

## Erros, concorrência e recuperação

- 401/403 nega sem pistas de registros/contagens; revogação limpa sessão.409 conserva estado, exige recarga, não sobrescreve revisão.
- Dado faltante mantém rascunho e motivo; falha de leitura mantém último lote com origem/hora/aviso, bloqueando somente operação dependente.
- Comando local persistido com UUID/hash: replay igual não duplica; mudança de payload conflita. Mutação dependente usa versão esperada/transação e prova concorrente.
- **Rollback:** desativar somente rotas/flags novas, preservando painel/acesso F1 e histórico. Migrations aditivas compatíveis; não apagar coleção/evento para reverter. Efeito confirmado no ERP exige decisão e reconciliação separadas; rollback do frontend não o desfaz.

### Execução no Skip e documentação técnica mínima

Usar o projeto conectado62774; acesso ausente impede alteração do sistema, sem criar substituto. Antes de migrations/hooks, consultar pelo MCP skip_cloud_migrations_guide e skip_cloud_hooks_guide e ler código/coleções atuais. Guias verificados em13/10/2026 descrevem PocketBase v0.36/goja; confirmar versão do projeto, que não foi acessível pelo conector desta revisão.

Hooks não executam Node.js: o runner Node dos testes é externo. Rotas novas usam /backend/v1/ e um routerAdd por arquivo; UI chama pelo cliente PocketBase existente, pb.send, contra o backend gerenciado. A URL pública do frontend não é o backend. Preservar VITE_POCKETBASE_URL gerenciado; descobrir backend via skip_cloud_get_backend_url, sem sobrescrever o cliente gerado.

Guardas e mutações locais usam $app.runInTransaction, com txApp dentro da transação; chamada HTTP externa ocorre após o commit. Consultar estado HTTP explicitamente e tratar falha de transporte separadamente. Helpers do handler precisam respeitar o isolamento goja descrito no guia; não assumir globais Node ou funções de outra VM.

Depois do recorte, skip_project_apply_changes executa QA. Conferir o resultado de cada etapa e qa.test.ran: teste não executado ou script vazio não conta como prova. Se build/lint/test tiverem nomes diferentes em package.json, registrar e usar os scripts existentes equivalentes; não inventar saída aprovada. Deploy em produção exige a autorização aplicável. Registrar versão/rotas/comandos efetivamente inspecionados em 07-sistemas/pcp/ambiente-execucao.md.

## Instruções de execução para o Ethos, Codex ou Claude Code

1. Ler esta SPEC/índice operacional, registros de 07-sistemas/pcp e código real do projeto 62774. Não criar outro projeto.
2. Selecionar somente task elegível em 04_fase-atual/fase.md; respeitar leva, pré-condições e aceite anterior. Publicação conjunta não autoriza executar cadeia simultaneamente.
3. Implementar contratos/coleções/endpoints/tela do recorte, primeiro com fixtures isoladas. Reusar autenticação/componentes; não editar cliente PocketBase gerado para facilitar teste.
4. Rodar RED antes do comportamento e GREEN/regressão abaixo; registrar comando/versão/saída. npm test que apenas imprime ausência de testes não é prova.
5. Pré-condição ausente mantém task aberta; recorte independente pode seguir. Regra/contrato incompatível retorna para emenda; não preencher por suposição.
6. Ao terminar uma task com a prova automática, seguir para a próxima elegível sem pedir teste. Sem teste humano: todas as tasks fecham pela prova automática (emenda de 26/10). Publicar este pacote não executou nenhuma task da F2.

## Checklist de execução

- [ ] Task/pré-condições verificadas no estado real.
- [ ] Fundamento demonstrável antes da conexão.
- [ ] Regras/autorizações/contratos implementados no recorte.
- [ ] RED/GREEN/bordas/concorrência e regressão com prova.
- [ ] Evidência da prova automática registrada.

## Critérios de aceite

- [ ] **CA-S1:** Origem/período/parâmetros/fórmula visíveis; ausência produznull, nunca default.
- [ ] **CA-S2:** Método aprovado reproduz quantidade/lote/capacidade; não duplica projeção e pedido firme.
- [ ] **CA-S3:** Aceitar cria apenas rascunho; ação/publicação continuam controladas; sem compra/transação automática.
- [ ] **CA-S4:** Percurso F2 e regressão F1 provados pela regressão automática; falha/timeout recuperável sem duplicar efeito.

## TDD da SPEC

Fixtures e scripts serão criados pelo executor junto ao teste; esta geração não implantou produto nem testes.

| Teste | Critério | Condição/ação | Oráculo |
|---|---|---|---|
| T1 | CA-S1/S2 | Vendas900 UN/90 dias; horizonte7; margem0; mínimo10; saldo20; produção futura10; firmes50; múltiplo10 | Projeção70; alvo70; necessidade50; sugestão50; memória exata |
| T2 | CA-S2 | Mesma fixture, firmes80 | Alvo80; necessidade60; não soma70+80 |
| T3 | CA-S1 | 89 datas ou ficha ausente ou compras a receber desconhecidas | Null/faltantes no recorte; outros itens válidos preservados |
| T4 | CA-S2/S3 | Capacidade30 para sugestão50; aceitar | Excedente20; só rascunho; publicação acima capacidade negada |
| T5 | CA-S4 | Em mock: percurso100/98/97/96, depois coincidente e resposta perdida; separado: caso real autorizado sem falha fabricada | Mock recupera por consulta sem novo POST; caso real reconcilia uma conclusão; autorização específica e F1 preservadas |
| T6 | CA-S1/S2 | Mapa de pedidos firmes ausente ou saldo de linha desconhecido; depois mapa sintético aprovado20/5 e replay | Antes quantidade=null/bloqueada; depois15 UN firmes uma vez, sem usar todos os pedidos importados |
| T7 | CA-S3 | Conta com consulta, sem editar_programacao, aceita sugestão; depois ação aprovada; repetir/alterar versão | Primeiro403 e zero rascunho; concessão explícita cria rascunho no próprio escopo sem publicar/comprar; replay não duplica, versão alterada409 |

| Etapa | Ação concreta | Resultado/evidência |
|---|---|---|
| RED | Criar asserções T1–T7 antes do comportamento; registrar falha de aceite, não erro de setup | red.md com critério/comando/versão/falha |
| GREEN | Menor implementação e as mesmas entradas/oráculos | Asserções/capturas/recibos; contagem de efeitos correta |
| REFACTOR/REGRESSÃO | Repetir cenários, conta sem ação, replay e concorrência; login/logout/painel/filtro/catálogo/canais F1 | Sem ampliar acesso/duplicar/perder fonte; M043055 compara com lote atual, não fixar53 eternamente |

**Comandos:** ler package.json/runner atuais no Skip e registrar comando/versão exatos. Sem runner confiável, criar testes Node nativos assert/strict em tests/pcp/spec-2-006.test.mjs e fixtures em tests/pcp/fixtures/fase-2/; rodar node --test tests/pcp/spec-2-006.test.mjs. Função pura usa mesmo módulo da aplicação ou bundle pelo Vite existente, nunca fórmula reimplementada no teste. Provas servidor usam HTTP/script contra demonstração isolada; token via ambiente seguro, jamais impresso. Rodar os scripts de build/lint existentes e o QA nativo, registrando os comandos equivalentes inspecionados em package.json; build/lint não substituem provas de aceite.

**Não técnico:** documento/card: registrar condição anterior, item exibido, ação do responsável, estado posterior e referência verificável. RED=ausência/contradição; GREEN=aprovação/vínculo comprovado; regressão preservaIDs/evidências. Para software, exigir RED/GREEN das asserções.

**Massa:** entradas e resultados da tabela; nunca promovê-los a dados/metas reais. **Erros:** sem perfil, dado/unidade ausente, replay divergente, revisão concorrente, fonte indisponível e casos específicos acima. Teste mutante real exige autorização específica de OP/quantidade/efeito.

## Handoff e operação

Demonstrar resultado ao dono funcional. Operar por ações autorizadas, acompanhar faltantes/fontes. Pendência conserva task aberta; documento não concede permissão nem substitui backend.

## Tasks vinculadas

| ID | Task | Critério/recorte | Pré-condições | Prova/evidência |
|---|---|---|---|---|
| 0baec76e-80af-412c-9554-9472f7928743 | Construir as sugestões com memória de cálculo | CA-S1/S2, recorte sintético | contratos internos dados/parâmetros disponíveis; fixtures identificadas | 05_entregas/fase-2/spec-2-006/; UUID acima |
| 2ea1e7ab-5fe4-4e02-a7a1-901539bfdc8a | Calcular as sugestões com os dados reais | CA-S1/S2 | documentos/valores de parâmetros e fontes disponíveis; aprovação do método é primeiro passo desta task e gate interno antes de qualquer cálculo real | 05_entregas/fase-2/spec-2-006/; UUID acima |
| 8bb4ef77-1232-4f16-a7d6-ea2df09ad829 | Levar a sugestão somente para rascunho | CA-S3 | sugestões aceitas e conta com editar_programacao nominalmente aprovada; nenhum acesso ampliado | 05_entregas/fase-2/spec-2-006/; UUID acima |
| 0d876150-60b6-46bb-ada4-722b90d870a3 | Validar o fluxo completo com a equipe (teste final da fase) | — | dispensada em 26/10 (sem teste humano na fase 2) | — |

Status/metadados editáveis pertencem somente ao arquivo canônico.

## Emendas

09/10/2026: geração F2 com pendências herdadas autorizadas pelo consultor. Regra/contrato diferente durante execução exige emenda rastreada.

13/10/2026: revisão documental do pacote; explicitados contratos/guardas e cenários de erro aplicáveis, com TDD acoplado. IDs e critérios existentes preservados; nenhuma task ou transação executada.

26/10/2026: retirados os testes humanos da fase 2, por decisão do consultor (Rodrigo). Todas as tasks fecham pela prova automática (RED/GREEN/regressão e QA do Skip) registrada em 05_entregas. A única trava humana que permanece é a autorização do dono antes do primeiro envio real ao Omie (6e38e5a3), porque grava no ERP — é trava de segurança, não teste. A validação final com a equipe (0d876150) foi dispensada.
