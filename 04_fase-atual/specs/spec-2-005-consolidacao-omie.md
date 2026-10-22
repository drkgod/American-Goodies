# SPEC-2-005 — Envio autorizado ao Omie e recuperação

**Fase:** 2 · **Revisão:** 13/10/2026 (pacote liberado em09/10) · **Origem:** RQ-002/012; CL-001.
**Tipo:** sistema · **Dono funcional:** PCP autoriza por OP; conta com executar_sync_omie envia.
**Degrau da solução:** reuso do projeto Skip 62774, autenticação/backend/banco nativos; construção mínima do recorte, sem outro provider.

## Contexto e decisões fechadas

F1 allowlist somente consulta. Publicação do pacote não concede autorização transacional.

Transição autorizada em 09/10: pendências entram nesta fase ainda abertas. Omie é fonte oficial. Construir primeiro fundamento/contratos/telas com demonstração identificada, depois conexões reais. Construir em sequência, sem pedir autorização nem teste entre tasks; teste humano só onde a task indicar (P5 do índice).

## Resultado observável

Produção conferida tem uma conclusão autorizada no Omie; falha/resposta ambígua conserva rastreio e recuperação.

## Limites e dependências

- **Inclui:** Contrato/adapter OP, fila com autorização por payload, consulta após timeout e reconciliação.
- **Fora desta fase/recorte:** Baixa adicional de eventos, ajuste estoque separado, upsert/exclusão/reversão automática, escrita fiscal/financeira ou transação por IA.
- **Entradas/pré-condições:** SPEC-2-000/001/004 reais aceitas; ações nominais, concessão técnica de API e autorização específica do caso.
- **Saídas:** resultado observável e evidência sanitizada em 05_entregas/fase-2/spec-2-005/, com aceite por task.
- **Superfícies afetadas:** /consolidacoes/:id, endpoints servidor Skip Cloud e pcp_transacoes_omie; secrets existentes.
- **Dependências humanas:** cliente fornece cadastro/matriz/parâmetros e decisões; executor implementa/verifica. Não inventar nomes/alçadas/prazos.

## Dados e integrações

pcp_transacoes_omie: UUID,op,revisao_consolidacao,operacao incluir_op|concluir_op,codigo_integracao,codigo_omie,payload_hash,estado preparada|autorizada|enviando|resultado_incerto|confirmada|falhou_sem_efeito|bloqueada,attempt_id,lease_ate,aprovador/tempo,resposta_sanitizada,consultado_em. Unicidade(op,revisão,operação), unicidade(app,codigo_integracao) para inclusão; trabalhador único com aquisição atômica e fencing token. Lease vencido após possível envio NÃO libera POST novo: reconciliar tentativa e comprovar término do trabalhador anterior.

[OP Omie](https://app.omie.com.br/api/v1/produtos/op/), consultada 09/10: consulta por nCodOP ou cCodIntOP; inclusão recebe identificacao; conclusão identifica OP e informa data/quantidade/observação. Registrar request/campos/resposta reais em contratos-fase-2.md antes do adapter. Código integração persistido, dentro do comprimento documentado e sem colisão; nunca truncar UUID silenciosamente. OP existente só por ID exato e revisão humana. Consulta posterior verifica identidade/status/quantidade; se API não expõe quantidade efetiva, comprovar visualmente no ERP autorizado, sem novo POST.

Conclusão gera movimentos de estoque segundo [operação Omie](https://ajuda.omie.com.br/pt-BR/articles/1432016-cadastrando-uma-ordem-de-producao). Não enviar baixa adicional pelos eventos locais. Divergência entre consumo local e estrutura oficial exige decisão/contrato específico; enquanto faltar, bloquear aquela OP. Nunca alterar receita para reconciliar diferença física.

### Contrato transversal

Reusar código/provider/guards atuais do projeto Skip. O submódulo local foi encontrado em versão de template e não prova produção: ler código, migrations, coleções e package.json atuais pelo projeto conectado antes de alterar; não substituir frontend pelo clone antigo. src/lib/pcp e tests/pcp são destinos previstos se ausentes, não arquivos já implantados.

Novas coleções têm demonstracao e isolamento no servidor; nunca unir fixtures com snapshots reais. Autorização em cada chamada por conta ativa, ação, área e ponto. Servidor fixa autor/aplicativo/hora; negar CRUD direto de coleções operacionais, incluindo perfis administrativos funcionais. Administração de perfis/configuração não concede edição ou exclusão de eventos, conferências, aprovações ou tentativas. Contas privilegiadas da plataforma que tecnicamente contornem regras ficam fora do fluxo operacional: manutenção excepcional exige autorização, backup e registro de auditoria separado; não usar credencial privilegiada na UI nem para corrigir apontamento. Secrets só backend; logs de correlação sanitizados, sem payload/credenciais.

Quantidades preservam decimais; rejeitar não finito e quantidade inválida. IDs em texto; conversão numérica na borda somente se inteiro seguro/exato, caso contrário bloquear. Unidade/local desconhecidos não viram default; não somar unidades incompatíveis. Negócio America/Sao_Paulo, auditoriaUTC.

### Aquisição, congelamento e reinício

Na mesma transação local, revalidar perfil/ação, revisão/hash do payload, eventos, conferências e aprovação; persistir tentativa, fencing token e congelar OP/consolidação em sincronizando ANTES de qualquer chamada mutante. Após commit, mutações incompatíveis ficam negadas durante enviando/resultado_incerto. Revalidar concessão imediatamente antes da chamada; se revogação for observada antes do envio, cancelar tentativa sem POST. Não prometer desfazer chamada já aceita pelo ERP por revogação posterior; reconciliar o resultado e bloquear novas operações.

Após queda/reinício, tentativa enviando sem resposta é tratada como potencialmente enviada: apenas consultar/reconciliar. Ausência em uma consulta não prova que o ERP não processará; não há retry automático. Fencing protege comandos locais, não cancela HTTP antigo: sem comprovar encerramento da tentativa/trabalhador e ausência de efeito, bloquear reenvio. Aprovação renovada só depois de falha_sem_efeito comprovada e payload revisado.

Provas adicionais O2/O3/O4:
- Aprovar100, revogar executar_sync_omie antes da aquisição/envio →403 e zero POST.
- Persistir tentativa, simular efeito no ERP e interromper antes de gravar resposta; reiniciar →consulta, confirmada, POST total1.
- Barreira depois de aquisição e antes de POST; retificar99 concorrente →409; timeout mantém congelamento. Retificação antes da aquisição →hash inválido e zero POST100.
- Perfil administrativo funcional não edita/exclui tentativas/hashes aprovados diretamente; manutenção privilegiada não é mecanismo de reprocessamento operacional.

**Quantidade final zero:** manter ocorrência/pendência para decisão PCP e negar preparação/autorização de inclusão ou conclusão mutante com quantidade<=0. Não fabricar produção positiva nem enviar cancelamento/ajuste automático. Um contrato ERP que exija disposição diferente volta ao consultor antes de qualquer efeito; registro local0 não concede essa autorização.

## Fluxo e regras

| Regra | Condição | Resultado | Exceção/ponto de parada |
|---|---|---|---|
| O1 | Sem contrato/permissão/caso aprovado | Adapter mutante desabilitado | Mock identificado não chama ERP |
| O2 | Autorizar payload | Mostrar OP/produto/qtd/data não futura/local/estrutura/efeito; guardar hash/aprovador | Mudança invalida aprovação |
| O3 | Incluir/concluir | Consultar identidade antes; trabalhador único; operações separadas | Resultado possível marca incerto |
| O4 | Timeout/5xx/lease vencido após POST | Somente consultar; não retry mutante automático | Ausência inconclusiva nunca comprova sem efeito |
| O5 | Confirmar efeito | Comparar identidade/status/quantidade e movimentos; refrescar leitura oficial | Desvio bloqueia; sem reversão automática |

1. Construir fila e adapter mock; provar ausência de mutantes fora do caso aprovado.
2. Confirmar contrato/concessão técnica na conta; PCP revisa cada efeito.
3. Preparar transação da revisão eficaz e persistir identidade antes da inclusão, ou vincular OP existente.
4. PCP autoriza por payload; servidor revalida ação/hashes/lease e consulta antes do POST.
5. Depois consultar; timeout conserva resultado_incerto com consulta/reconciliação, sem novo POST.
6. Confirmar uma conclusão e leitura do saldo; não reverter efeito do ERP por rollback do frontend.

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

- [ ] **CA-O1:** Sem contrato/permissão/aceite específico nenhuma chamada mutante sai.
- [ ] **CA-O2:** Payload e revisão conferida iguais ao hash aprovado; alteração/revogação antes do envio bloqueia.
- [ ] **CA-O3:** Duplo clique/concorrência/reinício preserva um vínculo e no máximo uma tentativa mutante não reconciliada por operação.
- [ ] **CA-O4:** Timeout após efeito: incerto→consulta→confirmada sem novo POST; ausência inconclusiva não habilita retry.
- [ ] **CA-O5:** Caso autorizado reconcilia identidade/qtd/status e um efeito; divergência de consumo não gera baixa adicional.

## TDD da SPEC

Fixtures e scripts serão criados pelo executor junto ao teste; esta geração não implantou produto nem testes.

| Teste | Critério | Condição/ação | Oráculo |
|---|---|---|---|
| T1 | CA-O1/O2 | Mock OP100 sem aprovação; depois hash aprovado e alterar99 | ZeroPOST mutante; bloqueio explícito |
| T2 | CA-O3 | Dois workers/duplo clique mesma revisão | Uma aquisição e uma chamada mutante; restante lê estado |
| T3 | CA-O4 | Mock aplica efeito e corta resposta; consulta encontra concluída100 | Incerto→confirmada; POST por operação1 |
| T4 | CA-O4 | Lease vence; consulta inconclusiva; trabalhador antigo ainda possível | Sem POST novo; somente consultas/reconciliação |
| T5 | CA-O5 | Caso real autorizado, conferir OP e movimentos antes/depois | Uma conclusão; prova sanitizada; sem ajuste adicional |
| T6 | CA-O1/O2 | Revisão conferida final0 com ocorrência local | Mutante desabilitado/pendência explícita, zero POST; histórico local preservado; nenhuma quantidade positiva ou cancelamento inventado |

| Etapa | Ação concreta | Resultado/evidência |
|---|---|---|
| RED | Criar asserções T1–T6 antes do comportamento; registrar falha de aceite, não erro de setup | red.md com critério/comando/versão/falha |
| GREEN | Menor implementação e as mesmas entradas/oráculos | Asserções/capturas/recibos; contagem de efeitos correta |
| REFACTOR/REGRESSÃO | Repetir cenários, conta sem ação, replay e concorrência; login/logout/painel/filtro/catálogo/canais F1 | Sem ampliar acesso/duplicar/perder fonte; M043055 compara com lote atual, não fixar53 eternamente |

**Comandos:** ler package.json/runner atuais no Skip e registrar comando/versão exatos. Sem runner confiável, criar testes Node nativos assert/strict em tests/pcp/spec-2-005.test.mjs e fixtures em tests/pcp/fixtures/fase-2/; rodar node --test tests/pcp/spec-2-005.test.mjs. Função pura usa mesmo módulo da aplicação ou bundle pelo Vite existente, nunca fórmula reimplementada no teste. Provas servidor usam HTTP/script contra demonstração isolada; token via ambiente seguro, jamais impresso. Rodar os scripts de build/lint existentes e o QA nativo, registrando os comandos equivalentes inspecionados em package.json; build/lint não substituem provas de aceite.

**Não técnico:** documento/card: registrar condição anterior, item exibido, ação do responsável, estado posterior e referência verificável. RED=ausência/contradição; GREEN=aprovação/vínculo comprovado; regressão preservaIDs/evidências. Para software, exigir RED/GREEN das asserções.

**Massa:** entradas e resultados da tabela; nunca promovê-los a dados/metas reais. **Erros:** sem perfil, dado/unidade ausente, replay divergente, revisão concorrente, fonte indisponível e casos específicos acima. Teste mutante real exige autorização específica de OP/quantidade/efeito.

## Teste humano do cliente

PCP autoriza OP/quantidade/efeito antes de teste real; depois verifica conclusão única no Omie. Produto/ficha/local reais obrigatórios; jamais fixture em ERP real. Sem autorização, aceite apenas mock, task real aberta.

Guardar referência funcional do tester, data, caso/versão, resultado e mensagem explícita. CL de envio/acesso é pré-condição, não aceite. Separar demonstração sintética e homologação real.

## Handoff e operação

Demonstrar resultado ao dono funcional. Operar por ações autorizadas, acompanhar faltantes/fontes. Pendência conserva task aberta; documento não concede permissão nem substitui backend.

## Tasks vinculadas

| ID | Task | Critério/recorte | Pré-condições | Prova/evidência |
|---|---|---|---|---|
| c44c11da-c7e9-42ee-b54a-fb3fff997f68 | Construir a fila de envio com simulação | CA-O1/O3/O4, recorte mock | contrato documental da consolidação e fixture local independente; mutantes reais desligados | 05_entregas/fase-2/spec-2-005/; UUID acima |
| a2a4ccf1-3244-438c-9e92-39a75f7e2b85 | Comprovar o contrato de produção no Omie | CA-O1 | fila simulada aceita; documentação/acesso autorizados; produto/ficha/local disponíveis | 05_entregas/fase-2/spec-2-005/; UUID acima |
| 4e9a1d0e-fd37-4225-86bd-54d08c1c924d | Provar a recuperação antes do envio real | CA-O2/O3/O4 | fila mock e contrato documental aceitos; todos os casos de revogação/reinício/lease/corrida/timeout devem passar antes do primeiro envio real | 05_entregas/fase-2/spec-2-005/; UUID acima |
| 6e38e5a3-72e4-4be7-ae21-a29b5fb5e7ab | Ligar o envio ao Omie e fazer o primeiro envio real | CA-O2/O5 | provas negativas da recuperação aceitas; contrato/concessão transacional, matriz e dupla conferência reais aceitos; autorização específica do caso e nenhuma divergência de consumo sem tratamento | 05_entregas/fase-2/spec-2-005/; UUID acima |

Status/metadados editáveis pertencem somente ao arquivo canônico.

## Emendas

09/10/2026: geração F2 com pendências herdadas autorizadas pelo consultor. Regra/contrato diferente durante execução exige emenda rastreada.

13/10/2026: revisão documental do pacote; explicitados contratos/guardas e cenários de erro aplicáveis, com TDD acoplado. IDs e critérios existentes preservados; nenhuma task ou transação executada.
