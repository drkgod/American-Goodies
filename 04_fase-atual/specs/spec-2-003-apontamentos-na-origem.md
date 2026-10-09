# SPEC-2-003 — Apontamentos de insumos e produção na origem

**Fase:** 2 · **Revisão:** 09/10/2026 · **Origem:** RQ-002/009; CL-PEND-002.
**Tipo:** sistema · **Dono funcional:** produção/encaixotamento aponta; PCP revisa.
**Degrau da solução:** reuso do projeto Skip 62774, autenticação/backend/banco nativos; construção mínima do recorte, sem outro provider.

## Contexto e decisões fechadas

Eventos de fábrica não existem no incremento homologado; OP vem da SPEC-2-002.

Transição autorizada em 09/10: pendências entram nesta fase ainda abertas. Omie é fonte oficial. Construir primeiro fundamento/contratos/telas com demonstração identificada, depois conexões reais. Uma task por sessão; teste humano explícito antes da seguinte.

## Resultado observável

Equipe registra retirada/adicional/devolução/perda declarada/realizado com autor, OP, unidade e ponto.

## Limites e dependências

- **Inclui:** Eventos imutáveis por OP/ponto, retificação, idempotência e consumo versus ficha.
- **Fora desta fase/recorte:** Mover estoque Omie, inferir perda/fraude, mudar receita ou prometer modo offline.
- **Entradas/pré-condições:** OP publicada, unidades/ficha para cálculo real, escopo nominal por ponto. Sem ficha, apontamento compatível pode ser registrado, mas cálculo dependente bloqueia.
- **Saídas:** resultado observável e evidência sanitizada em 05_entregas/fase-2/spec-2-003/, com aceite por task.
- **Superfícies afetadas:** /ops/:id/apontamentos, pcp_eventos, projeções src/lib/pcp; snapshots oficiais intocados.
- **Dependências humanas:** cliente fornece cadastro/matriz/parâmetros e decisões; executor implementa/verifica. Não inventar nomes/alçadas/prazos.

## Dados e integrações

pcp_eventos append-only: idUUID,op_id,op_versão,tipo (retirada_inicial|retirada_adicional|devolucao|perda_declarada|realizado_cozinha|realizado_encaixotamento|retificacao),item,quantidade decimal (positiva para lançamento; >=0 exclusivamente na retificação),unidade,local,ponto,timestamp_servidor,data_operacional,autor servidor,motivo,evento_alvo,payload_hash,demonstracao. Único(op_id,id): mesmo hash retorna registro; diferente 409. Retificação substitui quantidade eficaz da projeção, com motivo/referência, mantendo original; cadeia linear sem ciclos e apenas uma sucessora eficaz por alvo. CRUD direto negado; ficha publicada fica congelada na OP.

Pontos: cozinha, encaixotamento, expedição e câmara; localização/configuração e concessões são fornecidas pelo cliente. Falha de rede conserva formulário sem declarar gravação; consulta pela chave antes de retry. Não guardar tokens em fila offline.

### Contrato transversal

Reusar código/provider/guards atuais do projeto Skip. O submódulo local foi encontrado em versão de template e não prova produção: ler código, migrations, coleções e package.json atuais pelo projeto conectado antes de alterar; não substituir frontend pelo clone antigo. src/lib/pcp e tests/pcp são destinos previstos se ausentes, não arquivos já implantados.

Novas coleções têm demonstracao e isolamento no servidor; nunca unir fixtures com snapshots reais. Autorização em cada chamada por conta ativa, ação, área e ponto. Servidor fixa autor/aplicativo/hora; negar CRUD direto de coleções operacionais, incluindo perfis administrativos funcionais. Administração de perfis/configuração não concede edição ou exclusão de eventos, conferências, aprovações ou tentativas. Contas privilegiadas da plataforma que tecnicamente contornem regras ficam fora do fluxo operacional: manutenção excepcional exige autorização, backup e registro de auditoria separado; não usar credencial privilegiada na UI nem para corrigir apontamento. Secrets só backend; logs de correlação sanitizados, sem payload/credenciais.

Quantidades preservam decimais; rejeitar não finito e quantidade inválida. IDs em texto; conversão numérica na borda somente se inteiro seguro/exato, caso contrário bloquear. Unidade/local desconhecidos não viram default; não somar unidades incompatíveis. Negócio America/Sao_Paulo, auditoriaUTC.

### Semântica de quantidade e encerramento

realizado_cozinha e realizado_encaixotamento são INCREMENTOS por execução do ponto: dois registros40 e60 somam100, não substituem total. Retificação substitui o valor eficaz de exatamente um evento; repetir mesmo UUID não duplica. Quantidade 0 é permitida somente na retificação com motivo obrigatório, para anular lançamento sem excluir original. Novo lançamento0 é inválido. Retificação exige ação/ponto da etapa e vínculo à própria OP; lançamento em OP errada é anulado por0 na origem e registrado corretamente como outro comando, conservando as duas trilhas. Cadeia linear e compare-and-swap impedem duas retificações eficazes concorrentes.

Consumo previsto usa soma eficaz do realizado_cozinha na unidade-base da ficha congelada, nunca encaixotamento (que é registro independente de resultado). Consumo líquido por insumo = soma eficaz retiradas/adicionais - devoluções. Devolução que exceda retiradas provoca inconsistência bloqueante, sem produzir consumo negativo usado em cálculo; retificação mantém trilha e exige revisão antes de fechar etapa. Perda declarada categoriza parte do consumo, não gera retirada extra nem é inferida pela diferença.

Encerrar cada ponto segue comandos da SPEC-2-002, com hash de sua projeção. Evento/retificação depois de encerrado e antes de adquirir envio invalida encerramento/conferência/aprovação e exige nova conferência. Depois da aquisição atômica do envio ou durante resultado_incerto, evento/retificação recebe409 estado_congelado; não mutar dados usados no POST.

Provas complementares E3/E4: cozinha40+60=100; encaixotamento98 permanece98; ficha100 UN→5 KG dá previsto5 KG. Anular um lançamento errôneo6 KG com retificação0 preserva original e remove seu efeito; lançamento novo0 é rejeitado. Perfil administrativo funcional tentando PATCH/DELETE direto do evento recebe403; retificação autorizada por endpoint continua auditável.

## Fluxo e regras

| Regra | Condição | Resultado | Exceção/ponto de parada |
|---|---|---|---|
| E1 | Evento na OP da área/ponto | Validar estado, item/unidade/local; lançamento q>0, retificação q>=0 com motivo; servidor fixa autor/hora | Cancelada, sincronizando, incerta ou sincronizada não recebe evento/retificação operacional |
| E2 | Repetir comando | Mesmo UUID/hash retorna registro; outro hash 409 | Uma retirada/realizado eficaz |
| E3 | Consumo e ficha compatíveis | Previsto=realizado_cozinha_eficaz×componente/base_ficha; líquido=retiradas+adicionais-devoluções | Perda declarada categoriza consumo e não se soma duas vezes |
| E4 | Diferença/erro | Diferença líquido-previsto separada de perda; retificar com motivo | Sem unidade/base compatível, cálculo indisponível |

1. Construir tela/eventos com fixtures isoladas; cliente confirma pontos CL-PEND-002.
2. Registrar tipos e recibo UUID após confirmação do servidor.
3. Projetar consumo por item/unidade e diferença, sem inferência de perda.
4. Retificar preservando original; provar repetição/rede e acesso por ponto.

## Erros, concorrência e recuperação

- 401/403 nega sem pistas de registros/contagens; revogação limpa sessão.409 conserva estado, exige recarga, não sobrescreve revisão.
- Dado faltante mantém rascunho e motivo; falha de leitura mantém último lote com origem/hora/aviso, bloqueando somente operação dependente.
- Comando local persistido com UUID/hash: replay igual não duplica; mudança de payload conflita. Mutação dependente usa versão esperada/transação e prova concorrente.
- **Rollback:** desativar somente rotas/flags novas, preservando painel/acesso F1 e histórico. Migrations aditivas compatíveis; não apagar coleção/evento para reverter. Efeito confirmado no ERP exige decisão e reconciliação separadas; rollback do frontend não o desfaz.

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

- [ ] **CA-E1:** Evento conserva todos os campos de rastreio; escopo/quantidade inválidos negados.
- [ ] **CA-E2:** Replay não duplica; hash alterado409; timeout consultado antes de retry.
- [ ] **CA-E3:** Consumo líquido e diferença corretos por unidade; perda declarada separada, não inferida.
- [ ] **CA-E4:** Retificação auditável conserva original; versão/OP incompatível impede evento.

## TDD da SPEC

Fixtures e scripts serão criados pelo executor junto ao teste; esta geração não implantou produto nem testes.

| Teste | Critério | Condição/ação | Oráculo |
|---|---|---|---|
| T1 | CA-E1/E3 | Ficha100 UN→5 KG; realizado100; retirada6 KG+adicional1-devolução1; perda0,5 | Líquido6, previsto5, diferença1; perda0,5 separada |
| T2 | CA-E2 | Duas submissões iguais, terceira quantidade alterada com mesmaUUID | Um evento; replay igual;409 |
| T3 | CA-E1/E4 | Cozinha tenta câmara; OP cancelada; unidade null; retificar6→5,8 | 403/bloqueios; original preservado; líquido5,8 |
| T4 | CA-E2 | Timeout após persistência; consultar UUID | Registro encontrado; nenhum novo evento |

| Etapa | Ação concreta | Resultado/evidência |
|---|---|---|
| RED | Criar asserções T1–T4 antes do comportamento; registrar falha de aceite, não erro de setup | red.md com critério/comando/versão/falha |
| GREEN | Menor implementação e as mesmas entradas/oráculos | Asserções/capturas/recibos; contagem de efeitos correta |
| REFACTOR/REGRESSÃO | Repetir cenários, conta sem ação, replay e concorrência; login/logout/painel/filtro/catálogo/canais F1 | Sem ampliar acesso/duplicar/perder fonte; M043055 compara com lote atual, não fixar53 eternamente |

**Comandos:** ler package.json/runner atuais no Skip e registrar comando/versão exatos. Sem runner confiável, criar testes Node nativos assert/strict em tests/pcp/spec-2-003.test.mjs e fixtures em tests/pcp/fixtures/fase-2/; rodar node --test tests/pcp/spec-2-003.test.mjs. Função pura usa mesmo módulo da aplicação ou bundle pelo Vite existente, nunca fórmula reimplementada no teste. Provas servidor usam HTTP/script contra demonstração isolada; token via ambiente seguro, jamais impresso. Rodar também npm run build, npm run lint e QA nativo; build/lint não substituem provas de aceite.

**Não técnico:** documento/card: registrar condição anterior, item exibido, ação do responsável, estado posterior e referência verificável. RED=ausência/contradição; GREEN=aprovação/vínculo comprovado; regressão preservaIDs/evidências. Para software, exigir RED/GREEN das asserções.

**Massa:** entradas e resultados da tabela; nunca promovê-los a dados/metas reais. **Erros:** sem perfil, dado/unidade ausente, replay divergente, revisão concorrente, fonte indisponível e casos específicos acima. Teste mutante real exige autorização específica de OP/quantidade/efeito.

## Teste humano do cliente

Produção aponta/corrige no ponto; PCP confere diferença e perda separadas. CL-PEND-002 é condição de uso, não compra de equipamento pelo projeto.

Guardar referência funcional do tester, data, caso/versão, resultado e mensagem explícita. CL de envio/acesso é pré-condição, não aceite. Separar demonstração sintética e homologação real.

## Handoff e operação

Demonstrar resultado ao dono funcional. Operar por ações autorizadas, acompanhar faltantes/fontes. Pendência conserva task aberta; documento não concede permissão nem substitui backend.

## Tasks vinculadas

| ID | Task | Critério/recorte | Pré-condições | Prova/evidência |
|---|---|---|---|---|
| be180fc1-4d67-4f2a-a3c5-e15b74e845b8 | Construir a tela de apontamentos | CA-E1/E3, recorte sintético | contratos documentais SPEC-2-002/003 disponíveis; fixture local da OP independente do card de programação; nenhum produto real necessário | 05_entregas/fase-2/spec-2-003/; UUID acima |
| 64ac4f85-84e8-45a9-97a9-df04377c9e47 | Registrar e encerrar a produção por ponto | CA-E1/E3 | tela aceita; OP, conta/ponto e unidade oficiais para teste real | 05_entregas/fase-2/spec-2-003/; UUID acima |
| 0096ab26-6eec-438f-b154-54513188fab5 | Retificar apontamentos sem duplicar eventos | CA-E2/E4 | registro/encerramento aceitos e guards de estados especificados | 05_entregas/fase-2/spec-2-003/; UUID acima |

Status/metadados editáveis pertencem somente ao arquivo canônico.

## Emendas

09/10/2026: geração F2 com pendências herdadas autorizadas pelo consultor. Regra/contrato diferente durante execução exige emenda rastreada.
