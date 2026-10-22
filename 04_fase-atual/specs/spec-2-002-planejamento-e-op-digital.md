# SPEC-2-002 — Calendário, capacidade e programação com OP digital

**Fase:** 2 · **Revisão:** 13/10/2026 (pacote liberado em09/10) · **Origem:** RQ-002/008; CL-006; CL-PEND-001.
**Tipo:** sistema · **Dono funcional:** PCP fornece parâmetros e publica; executor implementa.
**Degrau da solução:** reuso do projeto Skip 62774, autenticação/backend/banco nativos; construção mínima do recorte, sem outro provider.

## Contexto e decisões fechadas

F1 não programa. CL-006 e parâmetros de calendário/capacidade precisam ser entregues/aprovados.

Transição autorizada em 09/10: pendências entram nesta fase ainda abertas. Omie é fonte oficial. Construir primeiro fundamento/contratos/telas com demonstração identificada, depois conexões reais. Construir em sequência, sem pedir autorização nem teste entre tasks; teste humano só onde a task indicar (P5 do índice).

## Resultado observável

PCP programa por recurso/data, identifica excesso de capacidade e publica OP digital versionada para a área.

## Limites e dependências

- **Inclui:** Fundamento, parâmetros aprovados, dias exclusivos, programação/reprogramação e OP local.
- **Fora desta fase/recorte:** Criar/baixar OP no ERP, decidir metas/margens/calendário pelo PCP ou alterar apontamento histórico.
- **Entradas/pré-condições:** Fixtures habilitam fundamento; publicação real exige SPEC-2-000/001 e parâmetros aprovados.
- **Saídas:** resultado observável e evidência sanitizada em 05_entregas/fase-2/spec-2-002/, com aceite por task.
- **Superfícies afetadas:** /planejamento e /ops, src/lib/pcp; novas coleções nativas descritas abaixo.
- **Dependências humanas:** cliente fornece cadastro/matriz/parâmetros e decisões; executor implementa/verifica. Não inventar nomes/alçadas/prazos.

## Dados e integrações

pcp_parametros: versão, produto/recurso, unidade, capacidade_dia, lote_minimo, multiplo_lote, margem, horizonte_dias, estoque_minimo (por produto), minimo_insumo (por insumo), prazo_fornecedor_dias, saldo_utilizavel_regra, precisão, aprovador/data. Prazo/calendário de recebimento e a regra de saldo utilizável exigem aprovação explícita; sem valor, cálculo afetado permanece bloqueado. pcp_calendario: recurso,data_local,disponivel,familia_exclusiva nullable,capacidade_fracao,versão. pcp_programacoes: id,versão,estado,referencia_parametros,lotes_fonte,autor/tempos. pcp_ops: UUID,programa_versão,produto,unidade,quantidade,recurso,data,area/ponto,estado,demonstracao. Índices únicos de recurso/data/versão e OP/versão; mutations autorizadas em transação, CRUD direto negado.

Programação: rascunho→publicada→substituida|cancelada. OP: programada→em_execucao→aguardando_conferencia→conferida→aguardando_aprovacao→autorizada→sincronizando→sincronizada. Falha/resultado_incerto pertence à transação ERP. Antes de evento, PCP cancela/substitui com motivo; depois, preservar OP/versão e abrir reprogramação explícita apenas do saldo não executado. Não editar OP sincronizada.

Registrar valores e aprovação CL-006/CL-PEND-001 em 07-sistemas/pcp/parametros-planejamento.md, incluindo capacidade por produto/recurso/dia, lotes e dias exclusivos. Fixtures não são parâmetros reais. Sem valor, rascunho incompleto é permitido; publicação real bloqueada.

### Contrato transversal

Reusar código/provider/guards atuais do projeto Skip. O submódulo local foi encontrado em versão de template e não prova produção: ler código, migrations, coleções e package.json atuais pelo projeto conectado antes de alterar; não substituir frontend pelo clone antigo. src/lib/pcp e tests/pcp são destinos previstos se ausentes, não arquivos já implantados.

Novas coleções têm demonstracao e isolamento no servidor; nunca unir fixtures com snapshots reais. Autorização em cada chamada por conta ativa, ação, área e ponto. Servidor fixa autor/aplicativo/hora; negar CRUD direto de coleções operacionais, incluindo perfis administrativos funcionais. Administração de perfis/configuração não concede edição ou exclusão de eventos, conferências, aprovações ou tentativas. Contas privilegiadas da plataforma que tecnicamente contornem regras ficam fora do fluxo operacional: manutenção excepcional exige autorização, backup e registro de auditoria separado; não usar credencial privilegiada na UI nem para corrigir apontamento. Secrets só backend; logs de correlação sanitizados, sem payload/credenciais.

Quantidades preservam decimais; rejeitar não finito e quantidade inválida. IDs em texto; conversão numérica na borda somente se inteiro seguro/exato, caso contrário bloquear. Unidade/local desconhecidos não viram default; não somar unidades incompatíveis. Negócio America/Sao_Paulo, auditoriaUTC.

### Comandos e transições da OP

| Comando/ator | Origem e guarda | Destino/efeito |
|---|---|---|
| Publicar / PCP com publicar_programacao | Rascunho válido, versão esperada e autorização | OP programada da versão publicada |
| Primeiro apontamento / ponto de produção autorizado | programada; dados válidos | em_execucao; evento e transição atômicos |
| Encerrar cozinha ou encaixotamento / responsável do ponto com apontar_producao | em_execucao; etapa possui realizado explícito, inclusive zero justificado conforme SPEC-2-003; registrar hash dos eventos da etapa | Encerramento local com autor/hora/hash; quando ambas encerradas, aguardando_conferencia |
| Conferir expedição/câmara / ação específica de cada ponto | aguardando_conferencia e encerramentos eficazes; ordem das etapas | Divergência conserva bloqueio; duas conferências coerentes deixam conferida e fila aguardando_aprovacao |
| Revisar exceção / PCP com aprovar_consolidacao | Divergência identificada, ambas etapas e motivo/final | Quantidade final revisada; aguardando_aprovacao, sem apagar registros |
| Aprovar payload / PCP | aguardando_aprovacao, hashes atuais, efeito mostrado | autorizada com hash aprovado; ainda sem POST |
| Adquirir envio / executor autorizado | autorizada, hashes atuais, tentativa exclusiva | sincronizando e revisão congelada atomicamente |
| Reconciliar resultado / executor autorizado | sincronizando ou tentativa incerta | sincronizada após prova; falha sem efeito volta à revisão; incerto continua congelado |
| Retificar antes da aquisição / ponto autorizado | OP ainda não congelada/sincronizada | Invalida encerramentos/conferências/autorizações dependentes; volta em_execucao para reconferir |

Encerramento por ponto é comando idempotente e guarda hash; não se encerra uma etapa só por quantidade planejada alcançada. A pessoa só encerra o próprio ponto aprovado. Não há anulação/reprogramação durante sincronizando ou resultado_incerto. Após sincronizada, correção vira ocorrência/decisão separada, sem alterar registros já enviados. Caso uma etapa legítima não exista no processo piloto, cliente precisa aprovar fluxo antes de uso; o executor não dispensa etapa silenciosamente.

### Reprogramação parcial sem duplicar execução ou reserva

Criar/editar rascunho e reprogramar/cancelar exigem editar_programacao; publicar a nova versão exige também publicar_programacao. Reprogramar transfere somente o saldo ainda não iniciado, usando as quantidades eficazes e a versão esperada; nenhuma quantidade/evento já iniciado migra de OP ou perde a referência original. Na mesma transação, guardar vínculo origem→destino e quantidade transferida, retirar essa quantidade do saldo executável e da demanda pendente da OP antiga e reservar apenas o saldo no destino. Manter a quantidade planejada original e os eventos para auditoria, mas não somar essa referência histórica como demanda executável.

Conservar a ocupação já consumida e liberar somente a reserva do saldo transferido; validar capacidade/calendário do destino antes do commit. Se faltar capacidade ou surgir conflito, nenhuma transferência ou reserva parcial é efetivada. Replay do mesmo comando retorna a transferência existente; revisão/payload divergente retorna409. Exemplo OP100 com cozinha40 e saldo não iniciado60: após transferir todo o saldo, origem conserva realizado40, saldo executável0 e referência histórica100; destino tem quantidade60, com vínculo e nova data. As projeções de demanda e de capacidade contam os60 somente no destino; a origem segue suas etapas/conferência dos40 efetivamente realizados. Tentativa de executar novamente os60 na origem é negada.

## Fluxo e regras

| Regra | Condição | Resultado | Exceção/ponto de parada |
|---|---|---|---|
| P1 | Quantidade por produto/dia | q>0 e lote/múltiplo aprovados; soma de frações q_i/capacidade_dia_i ≤ capacidade_fracao do recurso | Sem soma UN+KG |
| P2 | Data indisponível ou família incompatível | Recusar linha e explicar calendário | Não mover para outra data automaticamente |
| P3 | PCP publica | Revalidar dados, ação/área e versão esperada em transação | Concorrência: um sucesso e um conflito |
| P4 | Reprogramação com apontamento | Nova versão, motivo, autor e restante; eventos preservados | Sem apagar realizado |

1. Construir calendário/telas com semana sintética:3 dias cookies e2 exclusivos; banner permanente.
2. PCP entrega/aprova parâmetros; guardar versão e dados necessários.
3. Montar rascunho por produto/data/recurso, mostrando capacidade/faltantes por linha.
4. Publicar atomically na área autorizada; OP local não chama ERP.
5. Reprogramar restante com motivo e preservar passado.

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
6. Ao terminar uma task com a prova automática, seguir para a próxima elegível sem pedir teste. Teste humano só onde a task indicar (P5 do índice); as demais fecham pela prova automática. Publicar este pacote não executou nenhuma task da F2.

## Checklist de execução

- [ ] Task/pré-condições verificadas no estado real.
- [ ] Fundamento demonstrável antes da conexão.
- [ ] Regras/autorizações/contratos implementados no recorte.
- [ ] RED/GREEN/bordas/concorrência e regressão com prova.
- [ ] Evidência registrada; teste humano só quando a task indicar (P5).

## Critérios de aceite

- [ ] **CA-P1:** Semana5 dias com 2 exclusivos oferece só 3 para cookies; recurso compartilhado respeita frações.
- [ ] **CA-P2:** Dado/parâmetro/unidade faltante bloqueia publicação real; demonstração isolada continua.
- [ ] **CA-P3:** Publicação atômica gera OPs vinculadas à mesma versão/contexto; acesso sem ação nega.
- [ ] **CA-P4:** Reprogramação preserva evento/histórico; concorrência não publica duas versões nem excede recurso.

## TDD da SPEC

Fixtures e scripts serão criados pelo executor junto ao teste; esta geração não implantou produto nem testes.

| Teste | Critério | Condição/ação | Oráculo |
|---|---|---|---|
| T1 | CA-P1 | COOKIE-1 capacidade100 UN/dia;3 datas disponíveis; pedir300 e400 | 300 em 3×100;400 excede; nada nos dias exclusivos |
| T2 | CA-P1 | Mesmo recurso: A50/100 e B25/50; depois B26 | Fração1 aceita;1,02 recusada |
| T3 | CA-P2/P3 | Capacidade null; conta sem publicar; dois comandos versão1 | Campo bloqueante;403; uma versão2 |
| T4 | CA-P4 | OP100, realizado40, transferir restante60 com motivo; repetir comando; dois comandos concorrentes | Origem: realizado40/saldo executável0; destino60 uma vez; reservas pendentes transferidas sem duplicar capacidade/demanda; passado preservado; replay idempotente; conflito sem transferência parcial |

| Etapa | Ação concreta | Resultado/evidência |
|---|---|---|
| RED | Criar asserções T1–T4 antes do comportamento; registrar falha de aceite, não erro de setup | red.md com critério/comando/versão/falha |
| GREEN | Menor implementação e as mesmas entradas/oráculos | Asserções/capturas/recibos; contagem de efeitos correta |
| REFACTOR/REGRESSÃO | Repetir cenários, conta sem ação, replay e concorrência; login/logout/painel/filtro/catálogo/canais F1 | Sem ampliar acesso/duplicar/perder fonte; M043055 compara com lote atual, não fixar53 eternamente |

**Comandos:** ler package.json/runner atuais no Skip e registrar comando/versão exatos. Sem runner confiável, criar testes Node nativos assert/strict em tests/pcp/spec-2-002.test.mjs e fixtures em tests/pcp/fixtures/fase-2/; rodar node --test tests/pcp/spec-2-002.test.mjs. Função pura usa mesmo módulo da aplicação ou bundle pelo Vite existente, nunca fórmula reimplementada no teste. Provas servidor usam HTTP/script contra demonstração isolada; token via ambiente seguro, jamais impresso. Rodar os scripts de build/lint existentes e o QA nativo, registrando os comandos equivalentes inspecionados em package.json; build/lint não substituem provas de aceite.

**Não técnico:** documento/card: registrar condição anterior, item exibido, ação do responsável, estado posterior e referência verificável. RED=ausência/contradição; GREEN=aprovação/vínculo comprovado; regressão preservaIDs/evidências. Para software, exigir RED/GREEN das asserções.

**Massa:** entradas e resultados da tabela; nunca promovê-los a dados/metas reais. **Erros:** sem perfil, dado/unidade ausente, replay divergente, revisão concorrente, fonte indisponível e casos específicos acima. Teste mutante real exige autorização específica de OP/quantidade/efeito.

**Prova adicional CA-P3/P4:** conta com consulta e sem editar_programacao tenta criar/editar/reprogramar →403 e zero mutação. Após concessões nominais aprovadas, repetir OP100/realizado40/transferência60 e conferir origem/destino/reservas na tela.

## Teste humano do cliente

PCP aprova CL-006 como entrada; depois testa 3 dias de cookies, excesso, publicação/reprogramação. Produção abre somente a própria OP; aceite por task.

Guardar referência funcional do tester, data, caso/versão, resultado e mensagem explícita. CL de envio/acesso é pré-condição, não aceite. Separar demonstração sintética e homologação real.

## Handoff e operação

Demonstrar resultado ao dono funcional. Operar por ações autorizadas, acompanhar faltantes/fontes. Pendência conserva task aberta; documento não concede permissão nem substitui backend.

## Tasks vinculadas

| ID | Task | Critério/recorte | Pré-condições | Prova/evidência |
|---|---|---|---|---|
| 3cd404e5-81b8-4ca4-96b5-b4dc73f4a805 | Construir o calendário e a OP digital | CA-P1/P2/P3, recorte sintético | projeto Skip atual e contratos internos lidos; fonte real não é pré-condição do fundamento | 05_entregas/fase-2/spec-2-002/; UUID acima |
| d2a44349-f52e-4517-9ef8-7e004103b536 | Confirmar parâmetros e dias de produção | CA-P1/P2 | tela/contrato de parâmetros demonstrados; validação do dono funcional | 05_entregas/fase-2/spec-2-002/; UUID acima |
| 16b8a592-6038-440d-ba2a-1a668449739c | Publicar a programação por área | CA-P3 | parâmetros/matriz/dados reais aceitos para uso real; fundamento sintético pode ser verificado isoladamente | 05_entregas/fase-2/spec-2-002/; UUID acima |
| 87e4af63-740a-4fcf-8e00-ee8a7607cf09 | Reprogramar sem perder os apontamentos | CA-P4 | publicação aceita e contrato de eventos da SPEC-2-003; prova de conservação com fixture | 05_entregas/fase-2/spec-2-002/; UUID acima |

Status/metadados editáveis pertencem somente ao arquivo canônico.

## Emendas

09/10/2026: geração F2 com pendências herdadas autorizadas pelo consultor. Regra/contrato diferente durante execução exige emenda rastreada.

13/10/2026: revisão documental do pacote; explicitados contratos/guardas e cenários de erro aplicáveis, com TDD acoplado. IDs e critérios existentes preservados; nenhuma task ou transação executada.
