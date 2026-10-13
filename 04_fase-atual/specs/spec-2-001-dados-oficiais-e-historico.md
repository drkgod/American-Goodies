# SPEC-2-001 — Catálogo, fichas, unidades e histórico oficial

**Fase:** 2 · **Revisão:** 13/10/2026 (pacote liberado em09/10) · **Origem:** RQ-003/008/012; P4; CL-001.
**Tipo:** sistema · **Dono funcional:** cliente mantém cadastro/receita; executor reconcilia leitura.
**Degrau da solução:** reuso do projeto Skip 62774, autenticação/backend/banco nativos; construção mínima do recorte, sem outro provider.

## Contexto e decisões fechadas

Produtos Omie vazios; estoque foi rotulado UN sem confirmação pelo cadastro. Contratos intermediários de canais registram vínculo0, superado pela prova final de 44.

Transição autorizada em 09/10: pendências entram nesta fase ainda abertas. Omie é fonte oficial. Construir primeiro fundamento/contratos/telas com demonstração identificada, depois conexões reais. Uma task por sessão; teste humano explícito antes da seguinte.

## Resultado observável

Produto piloto tem unidade/ficha comprovadas e histórico oficial de 90 dias com qualidade visível.

## Limites e dependências

- **Inclui:** Pendência de cadastro pelo cliente; leitura de produto/estrutura/unidade/local e histórico de vendas/produção; adendos de contratos.
- **Fora desta fase/recorte:** Cadastrar produtos/alterar receita pelo agente, ajustar saldo físico ou inferir unidade/conversão.
- **Entradas/pré-condições:** Leitura Omie existente; acesso nominal para homologação; mapa e amostra da conta antes de adapter real.
- **Saídas:** resultado observável e evidência sanitizada em 05_entregas/fase-2/spec-2-001/, com aceite por task.
- **Superfícies afetadas:** provider/normalizadores PCP, snapshots existentes e tela de qualidade; 07-sistemas/pcp/contratos-fase-2.md.
- **Dependências humanas:** cliente fornece cadastro/matriz/parâmetros e decisões; executor implementa/verifica. Não inventar nomes/alçadas/prazos.

## Dados e integrações

Reusar pcp_execucoes/pcp_lotes/pcp_dados/pcp_fontes com lease/geração e ativação atômica. Novos recursos: estrutura_produto, vendas_90d, producao_90d. Lote: aplicativo_ref, período, timezone, cobertura_completa, versao_mapa. Linha normalizada: documento_id, linha_id, produto_id e local_id em texto, unidade_oficial nullable, quantidade decimal, tipo/status, data_operacional, origem_id e referência da devolução/cancelamento. Chave = aplicativo+recurso+documento+linha; não combinar por código/valor.

Cadastro: ListarProdutosResumido já registrado em 07-sistemas/pcp/contratos-omie.md. Documentação candidata: [Estrutura](https://app.omie.com.br/api/v1/geral/malha/), [Resumo de vendas](https://app.omie.com.br/api/v1/produtos/nfe/), [OP](https://app.omie.com.br/api/v1/produtos/op/). Não são contratos homologados da conta. Registrar método, endpoint, request, caminhos exatos dos campos/status, chave, fim de paginação e amostra sanitizada em contratos-fase-2.md antes do adapter. Vendas oficiais concluídas segundo mapa aprovado; cancelamento/devolução exige referência/sinal comprovados. Ausência impede cálculo afetado, não cria venda líquida presumida.

### Contrato transversal

Reusar código/provider/guards atuais do projeto Skip. O submódulo local foi encontrado em versão de template e não prova produção: ler código, migrations, coleções e package.json atuais pelo projeto conectado antes de alterar; não substituir frontend pelo clone antigo. src/lib/pcp e tests/pcp são destinos previstos se ausentes, não arquivos já implantados.

Novas coleções têm demonstracao e isolamento no servidor; nunca unir fixtures com snapshots reais. Autorização em cada chamada por conta ativa, ação, área e ponto. Servidor fixa autor/aplicativo/hora; negar CRUD direto de coleções operacionais, incluindo perfis administrativos funcionais. Administração de perfis/configuração não concede edição ou exclusão de eventos, conferências, aprovações ou tentativas. Contas privilegiadas da plataforma que tecnicamente contornem regras ficam fora do fluxo operacional: manutenção excepcional exige autorização, backup e registro de auditoria separado; não usar credencial privilegiada na UI nem para corrigir apontamento. Secrets só backend; logs de correlação sanitizados, sem payload/credenciais.

Quantidades preservam decimais; rejeitar não finito e quantidade inválida. IDs em texto; conversão numérica na borda somente se inteiro seguro/exato, caso contrário bloquear. Unidade/local desconhecidos não viram default; não somar unidades incompatíveis. Negócio America/Sao_Paulo, auditoriaUTC.

### Contrato de pedidos firmes no horizonte

Reusar os pedidos oficiais Omie, sem somar a intenção da Nuvemshop. Antes de calcular pedidos_oficiais_firmes_no_horizonte, o PCP aprova em 07-sistemas/pcp/contratos-fase-2.md a lista de status elegíveis/excluídos, o campo de data operacional, os limites inclusivos do horizonte, a quantidade ainda a atender por linha, a unidade e o tratamento comprovado de cancelamento/devolução/atendimento parcial. O executor registra endpoint/método, caminhos dos campos, identidade aplicativo+pedido+linha, cobertura e amostra autorizada; não presume que todo pedido importado é firme ou que quantidade pedida equivale a saldo aberto.

Esse contrato integra a task Comprovar as leituras de histórico e compras; a task Importar os 90 dias e recebimentos confirmados também carrega e reconcilia o saldo dos pedidos oficiais elegíveis. Se status, data, saldo, unidade ou cobertura não puderem ser comprovados/aprovados, quantidade firme=null e a sugestão de produção dependente permanece bloqueada, sem default0. Fixtures sintéticas usam mapa explicitamente identificado; não aprovam a regra empresarial.

Prova D3/D4 complementar: com mapa sintético aprovado, linha confirmada de20 UN, atendidas5 UN e data dentro do horizonte contribui15 UN; cancelada7 UN e linha fora do horizonte3 UN contribuem0; replay da primeira continua15. Data de borda é inclusiva conforme mapa. Saldo/status desconhecido produznull e bloqueio do item; homologação real compara saldo e data de uma linha no Omie.

### Contrato complementar de compras confirmadas

Recurso de leitura compras_a_receber: aplicativo/documento_id/linha_id, produto_id, unidade_oficial, quantidade_pedida, quantidade_recebida, quantidade_restante, data_prevista_local, status_origem, cancelado, fornecedor_id e cobertura_completa. Quantidade restante nunca excede pedido nem é negativa; quando houver devolução/cancelamento, mapa da conta define efeito comprovado, sem cálculo presumido. Chave = aplicativo+pedido+linha. Compra entra somente se aprovada/confirmada e não cancelada conforme mapa de status homologado; campos/status não expostos geram pendência, não zero. Histórico financeiro/fiscal não integra este recurso. O adapter lê pedidos de compra por contrato confirmado no serviço oficial; incluir endpoint/request/caminho de cada campo, amostra real, paginação e status em contratos-fase-2.md antes de ligar leitura. Sem cobertura completa/status/data/unidade compatíveis, bloquear apenas sugestão de compra.

Prova complementar D3/D4: fixture com pedido aprovado20 KG, recebidos5 KG e chegada dentro do horizonte →15 KG restantes; pedido cancelado7 KG e chegada fora do horizonte3 KG →não elegíveis; replay não duplica; quantidade restante desconhecida →bloqueia sugestão, não vira0. Homologação real compara uma linha do pedido na fonte.

## Fluxo e regras

| Regra | Condição | Resultado | Exceção/ponto de parada |
|---|---|---|---|
| D1 | Cadastro vazio | Cliente preenche produto piloto no Omie; executor sincroniza/compara | Não criar produto falso para aceite |
| D2 | Posição sem unidade comprovada | Unidade desconhecida explícita; bloquear cálculo/evento dependente | Retirar default UN como unidade oficial; preservar saldo |
| D3 | Ficha exposta | Guardar produto/componentes/quantidades/unidades e versão ou fingerprint | Sem receita reconstruída por planilha |
| D4 | 90 dias | D-89 até D inclusive em America/Sao_Paulo; origem completa e replay por chave | Página falha não ativa lote parcial |
| D5 | Documento intermediário contraditório | Adendo datado cita 44 vínculos e 3344 canal na prova de 08/10 | Contagem histórica não é valor eterno |

1. Construir contratos e tela de qualidade com fixtures isoladas.
2. Cliente cadastra/valida produto no ERP; executor comprova mapa de leitura, unidade e ficha com amostra autorizada.
3. Importar histórico paginado em staging, provar deduplicação/cancelamentos/devoluções e ativar lote completo.
4. Acrescentar adendos datados nos contratos correntes e no relatório integrado sem apagar evidências anteriores.

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
6. Mostrar resultado da única task e pedir teste humano explícito; só depois concluir e iniciar próxima. Publicar este pacote não executou nenhuma task da F2.

## Checklist de execução

- [ ] Task/pré-condições verificadas no estado real.
- [ ] Fundamento demonstrável antes da conexão.
- [ ] Regras/autorizações/contratos implementados no recorte.
- [ ] RED/GREEN/bordas/concorrência e regressão com prova.
- [ ] Evidência e teste humano explícito antes de concluir.

## Critérios de aceite

- [ ] **CA-D1:** Produto piloto real corresponde ao cadastro Omie com unidade oficial; ausências explícitas.
- [ ] **CA-D2:** Ficha real coincide em identidade/quantidade/unidade; unidade null nunca vira UN nem habilita cálculo.
- [ ] **CA-D3:** Cada recurso real tem mapa de campos/status/paginação e amostra autorizada comparada.
- [ ] **CA-D4:** Exatamente90 datas; replay sem duplicação; falha preserva lote anterior com aviso e não ativa incompleto.
- [ ] **CA-D5:** Contratos e relatório possuem adendo coerente com lote/aceite final de 08/10, preservando original.

## TDD da SPEC

Fixtures e scripts serão criados pelo executor junto ao teste; esta geração não implantou produto nem testes.

| Teste | Critério | Condição/ação | Oráculo |
|---|---|---|---|
| T1 | CA-D1/D2 | COOKIE-1 UN, ficha INS-1=0,05 KG; P2 unidade null; P3 ficha null | Valores oficiais preservados; P2/P3 bloqueados; sem KG→UN |
| T2 | CA-D3/D4 | 100 UN concluídas;20 canceladas; devolução vinculada10; linha repetida;90 datas | Fixture do mapa:90 UN líquidas; uma linha/chave; data externa excluída |
| T3 | CA-D4 | Falhar página2, repetir1 e trocar geração | Lote anterior ativo; aviso incompleto; geração antiga recusada |
| T5 | CA-D3/D4 | Pedidos firmes: confirmado20/atendido5; cancelado7; fora do horizonte3; replay; campo/status desconhecido | Mapa sintético resulta15, não25; replay mantém15; desconhecido=null e bloqueia; uso real só após regra PCP e amostra homologadas |
| T4 | CA-D5 | Comparar contratos antigos com prova final 44/3344 | Adendo com fonte/data; histórico não apagado |

| Etapa | Ação concreta | Resultado/evidência |
|---|---|---|
| RED | Criar asserções T1–T5 antes do comportamento; registrar falha de aceite, não erro de setup | red.md com critério/comando/versão/falha |
| GREEN | Menor implementação e as mesmas entradas/oráculos | Asserções/capturas/recibos; contagem de efeitos correta |
| REFACTOR/REGRESSÃO | Repetir cenários, conta sem ação, replay e concorrência; login/logout/painel/filtro/catálogo/canais F1 | Sem ampliar acesso/duplicar/perder fonte; M043055 compara com lote atual, não fixar53 eternamente |

**Comandos:** ler package.json/runner atuais no Skip e registrar comando/versão exatos. Sem runner confiável, criar testes Node nativos assert/strict em tests/pcp/spec-2-001.test.mjs e fixtures em tests/pcp/fixtures/fase-2/; rodar node --test tests/pcp/spec-2-001.test.mjs. Função pura usa mesmo módulo da aplicação ou bundle pelo Vite existente, nunca fórmula reimplementada no teste. Provas servidor usam HTTP/script contra demonstração isolada; token via ambiente seguro, jamais impresso. Rodar os scripts de build/lint existentes e o QA nativo, registrando os comandos equivalentes inspecionados em package.json; build/lint não substituem provas de aceite.

**Não técnico:** documento/card: registrar condição anterior, item exibido, ação do responsável, estado posterior e referência verificável. RED=ausência/contradição; GREEN=aprovação/vínculo comprovado; regressão preservaIDs/evidências. Para software, exigir RED/GREEN das asserções.

**Massa:** entradas e resultados da tabela; nunca promovê-los a dados/metas reais. **Erros:** sem perfil, dado/unidade ausente, replay divergente, revisão concorrente, fonte indisponível e casos específicos acima. Teste mutante real exige autorização específica de OP/quantidade/efeito.

## Teste humano do cliente

Cliente compara produto/ficha e uma linha do histórico com Omie; demonstra unidade/ficha ausente. CL-001 é acesso e não substitui aceite.

Guardar referência funcional do tester, data, caso/versão, resultado e mensagem explícita. CL de envio/acesso é pré-condição, não aceite. Separar demonstração sintética e homologação real.

## Handoff e operação

Demonstrar resultado ao dono funcional. Operar por ações autorizadas, acompanhar faltantes/fontes. Pendência conserva task aberta; documento não concede permissão nem substitui backend.

## Tasks vinculadas

| ID | Task | Critério/recorte | Pré-condições | Prova/evidência |
|---|---|---|---|---|
| 4e0fcf1c-1670-4cde-9dc9-693b3c7eee49 | Povoar o cadastro de produtos no ERP | CA-D1 | responsável do cliente autorizado a manter cadastro ERP; nenhum produto/receita inventado pelo agente | 05_entregas/fase-2/spec-2-001/; UUID acima |
| e57df8ff-99ae-4856-ac1f-53b713c8e99c | Construir a visão de qualidade dos dados | CA-D1/D2/D4, recorte sintético | projeto Skip atual lido; dispensa cadastro/API real para fundamento | 05_entregas/fase-2/spec-2-001/; UUID acima |
| 5d8793fb-216f-4322-8fed-c5ec7a1a0b0d | Reconciliar catálogo, unidades e fichas | CA-D1/D2/D3 | fundamento aceito, cadastro piloto, acesso nominal e contrato de leitura autorizados | 05_entregas/fase-2/spec-2-001/; UUID acima |
| 9318a299-f764-4dc7-8ec8-3cb7c86b7c79 | Comprovar as leituras de histórico e compras | CA-D3 | catálogo/ficha conciliados, consulta autorizada e documentação oficial da conta | 05_entregas/fase-2/spec-2-001/; UUID acima |
| e6aa4afa-94fe-45e9-95d8-875df96a1cf1 | Importar os 90 dias e recebimentos confirmados | CA-D4 | contratos de leitura comprovados e aceitos; unidades oficiais | 05_entregas/fase-2/spec-2-001/; UUID acima |
| a6bf06fb-20ee-497d-be63-69f03cad854a | Reconciliar os documentos de operação | CA-D5 | evidências finais F1 e contratos intermediários disponíveis | 05_entregas/fase-2/spec-2-001/; UUID acima |

Status/metadados editáveis pertencem somente ao arquivo canônico.

## Emendas

09/10/2026: geração F2 com pendências herdadas autorizadas pelo consultor. Regra/contrato diferente durante execução exige emenda rastreada.

13/10/2026: revisão documental do pacote; explicitados contratos/guardas e cenários de erro aplicáveis, com TDD acoplado. IDs e critérios existentes preservados; nenhuma task ou transação executada.
