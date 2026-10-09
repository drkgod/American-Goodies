# SPEC-2-004 — Conferência da expedição e entrada em câmara fria

**Fase:** 2 · **Revisão:** 09/10/2026 · **Origem:** RQ-002/009; CL-PEND-002.
**Tipo:** sistema · **Dono funcional:** expedição/câmara conferem; PCP decide divergência.
**Degrau da solução:** reuso do projeto Skip 62774, autenticação/backend/banco nativos; construção mínima do recorte, sem outro provider.

## Contexto e decisões fechadas

Realizados locais não equivalem a quantidade recebida nem saldo oficial.

Transição autorizada em 09/10: pendências entram nesta fase ainda abertas. Omie é fonte oficial. Construir primeiro fundamento/contratos/telas com demonstração identificada, depois conexões reais. Uma task por sessão; teste humano explícito antes da seguinte.

## Resultado observável

Produzido, encaixotado, recebido e entrada em câmara são registros distintos; divergência exige revisão.

## Limites e dependências

- **Inclui:** Duas conferências versionadas e fila revisável de consolidação.
- **Fora desta fase/recorte:** Inferir perda, ajustar estoque/fiscal, dispensar etapa ou enviar ao Omie automaticamente.
- **Entradas/pré-condições:** SPEC-2-003 e acesso por ponto; ação aprovar_consolidacao explícita para PCP.
- **Saídas:** resultado observável e evidência sanitizada em 05_entregas/fase-2/spec-2-004/, com aceite por task.
- **Superfícies afetadas:** /conferencias e /consolidacoes, pcp_conferencias/pcp_consolidacoes; painel produção identificado como local.
- **Dependências humanas:** cliente fornece cadastro/matriz/parâmetros e decisões; executor implementa/verifica. Não inventar nomes/alçadas/prazos.

## Dados e integrações

pcp_conferencias append-only: idUUID,op/versão,etapa (recebimento_expedicao|entrada_camara),hash_projecao,quantidade,unidade,local_origem/destino,conferente/hora servidor,resultado coincidente|divergente,motivo,retifica. Replay único; projeção usa última revisão autorizada. pcp_consolidacoes: op,revisão,hash_eventos,hash_conferencias,qtd_realizado/qtd_encaixotado/qtd_expedicao/qtd_camara,unidade,deltas,pendencias[],estado bloqueada|revisavel|autorizada|sincronizando|sincronizada,aprovador/tempo.

Não presumir tolerância. Igualdade decimal na mesma unidade permite fila revisável; diferença exige decisão PCP com motivo, quantidade final e ambas as conferências, sem apagar quantidades originais. Autorizar nesta SPEC prepara revisão; envio real tem gate SPEC-2-005.

### Contrato transversal

Reusar código/provider/guards atuais do projeto Skip. O submódulo local foi encontrado em versão de template e não prova produção: ler código, migrations, coleções e package.json atuais pelo projeto conectado antes de alterar; não substituir frontend pelo clone antigo. src/lib/pcp e tests/pcp são destinos previstos se ausentes, não arquivos já implantados.

Novas coleções têm demonstracao e isolamento no servidor; nunca unir fixtures com snapshots reais. Autorização em cada chamada por conta ativa, ação, área e ponto. Servidor fixa autor/aplicativo/hora; negar CRUD direto de coleções operacionais, incluindo perfis administrativos funcionais. Administração de perfis/configuração não concede edição ou exclusão de eventos, conferências, aprovações ou tentativas. Contas privilegiadas da plataforma que tecnicamente contornem regras ficam fora do fluxo operacional: manutenção excepcional exige autorização, backup e registro de auditoria separado; não usar credencial privilegiada na UI nem para corrigir apontamento. Secrets só backend; logs de correlação sanitizados, sem payload/credenciais.

Quantidades preservam decimais; rejeitar não finito e quantidade inválida. IDs em texto; conversão numérica na borda somente se inteiro seguro/exato, caso contrário bloquear. Unidade/local desconhecidos não viram default; não somar unidades incompatíveis. Negócio America/Sao_Paulo, auditoriaUTC.

### Serialização com o envio e projeções imutáveis

Retificação/conferência e aquisição do envio usam a mesma guarda transacional da OP/revisão. Se mudança chega antes, incrementa revisão e invalida aprovação; trabalhador recarrega e não envia hash antigo. Se aquisição ganha primeiro, OP/consolidação ficam congeladas em sincronizando; evento/conferência/retificação incompatível retorna409 durante envio e resultado_incerto. Somente reconciliação comprovada libera correção local quando não houve efeito; sincronizada conserva histórico e exige ocorrência posterior separada. Não é possível usar transação local como se cobrisse POST remoto.

Prova C4 complementar: inserir barreira entre adquirir envio e POST, tentar retificação100→99; recebe409 e hash100 permanece. Se retificação99 ganha antes da aquisição, esta recebe conflito e zero POST100. Perfil administrativo funcional tentando PATCH/DELETE direto da conferência recebe403.

## Fluxo e regras

| Regra | Condição | Resultado | Exceção/ponto de parada |
|---|---|---|---|
| C1 | Realizado/encaixotado | Expedição registra quantidade própria e compara | Nunca sobrescrever produzido |
| C2 | Primeira conferência eficaz | Câmara registra entrada/local | Sem expedição, segunda bloqueada |
| C3 | Etapas/versões coerentes | Fila revisável, sem envio; diferença/ausência bloqueia | Sem perda inferida |
| C4 | PCP decide ou novo evento ocorre | Motivo, quantidade final e hashes; nova projeção invalida aprovação | Transação impede envio de revisão antiga |

1. Construir ambas as telas com fixtures e escopo por ponto.
2. Registrar expedição e depois câmara; comparar independentemente.
3. PCP revisa divergências e aceita quantidade final com motivo, sem alterar originais.
4. Preparar revisão para envio; retificação invalida autorização.

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

- [ ] **CA-C1:** Quatro quantidades rastreadas e exibidas independentemente.
- [ ] **CA-C2:** Câmara sem primeira etapa bloqueada; escopo e replay por etapa corretos.
- [ ] **CA-C3:** Ausência/divergência bloqueia; igualdade libera só revisão local, sem transação/perda inferida.
- [ ] **CA-C4:** Aprovação tem motivo/final/hashes; retificação invalida estado anterior atomicamente.

## TDD da SPEC

Fixtures e scripts serão criados pelo executor junto ao teste; esta geração não implantou produto nem testes.

| Teste | Critério | Condição/ação | Oráculo |
|---|---|---|---|
| T1 | CA-C1/C3 | Cozinha100, encaixotado98, expedição97, câmara96 UN | Deltas-1/-1, diferenças preservadas; fila bloqueada |
| T2 | CA-C2 | Câmara primeiro; cozinha tenta expedição; replayUUID | Bloqueio/403; um registro eficaz |
| T3 | CA-C3/C4 | Tudo100, PCP aprova; retificar realizado99 | Antes revisável; depois autorização inválida/envio bloqueado |
| T4 | CA-C4 | PCP aceita96 com motivo após revisar100/98/97/96 | Originais visíveis; final96 sem ajuste Omie |

| Etapa | Ação concreta | Resultado/evidência |
|---|---|---|
| RED | Criar asserções T1–T4 antes do comportamento; registrar falha de aceite, não erro de setup | red.md com critério/comando/versão/falha |
| GREEN | Menor implementação e as mesmas entradas/oráculos | Asserções/capturas/recibos; contagem de efeitos correta |
| REFACTOR/REGRESSÃO | Repetir cenários, conta sem ação, replay e concorrência; login/logout/painel/filtro/catálogo/canais F1 | Sem ampliar acesso/duplicar/perder fonte; M043055 compara com lote atual, não fixar53 eternamente |

**Comandos:** ler package.json/runner atuais no Skip e registrar comando/versão exatos. Sem runner confiável, criar testes Node nativos assert/strict em tests/pcp/spec-2-004.test.mjs e fixtures em tests/pcp/fixtures/fase-2/; rodar node --test tests/pcp/spec-2-004.test.mjs. Função pura usa mesmo módulo da aplicação ou bundle pelo Vite existente, nunca fórmula reimplementada no teste. Provas servidor usam HTTP/script contra demonstração isolada; token via ambiente seguro, jamais impresso. Rodar também npm run build, npm run lint e QA nativo; build/lint não substituem provas de aceite.

**Não técnico:** documento/card: registrar condição anterior, item exibido, ação do responsável, estado posterior e referência verificável. RED=ausência/contradição; GREEN=aprovação/vínculo comprovado; regressão preservaIDs/evidências. Para software, exigir RED/GREEN das asserções.

**Massa:** entradas e resultados da tabela; nunca promovê-los a dados/metas reais. **Erros:** sem perfil, dado/unidade ausente, replay divergente, revisão concorrente, fonte indisponível e casos específicos acima. Teste mutante real exige autorização específica de OP/quantidade/efeito.

## Teste humano do cliente

Expedição/câmara demonstram registros distintos; PCP decide diferença e observa invalidação após retificação. Mesma pessoa só em ambos os pontos se matriz autorizar; duas etapas permanecem.

Guardar referência funcional do tester, data, caso/versão, resultado e mensagem explícita. CL de envio/acesso é pré-condição, não aceite. Separar demonstração sintética e homologação real.

## Handoff e operação

Demonstrar resultado ao dono funcional. Operar por ações autorizadas, acompanhar faltantes/fontes. Pendência conserva task aberta; documento não concede permissão nem substitui backend.

## Tasks vinculadas

| ID | Task | Critério/recorte | Pré-condições | Prova/evidência |
|---|---|---|---|---|
| 556da315-88ca-41da-bd86-5322d86ede49 | Construir as duas telas de conferência | CA-C1/C2, recorte sintético | contratos documentais OP/eventos disponíveis; fixtures locais independentes da implantação dos cards anteriores | 05_entregas/fase-2/spec-2-004/; UUID acima |
| d77447ab-24eb-4982-984d-08645f11ae28 | Conferir expedição e entrada em câmara | CA-C1/C2/C3 | telas aceitas, etapas de produção encerradas, acesso nominal e pontos definidos para teste real | 05_entregas/fase-2/spec-2-004/; UUID acima |
| 30118f65-3dd5-4679-a1a2-8b301c6a8d46 | Revisar divergências e invalidar aprovações antigas | CA-C3/C4 | conferências aceitas; ação aprovar_consolidacao confirmada | 05_entregas/fase-2/spec-2-004/; UUID acima |

Status/metadados editáveis pertencem somente ao arquivo canônico.

## Emendas

09/10/2026: geração F2 com pendências herdadas autorizadas pelo consultor. Regra/contrato diferente durante execução exige emenda rastreada.
