# Fase 1 — Tarefas

<!-- fase-format:2 -->

Cada linha é uma tarefa da Jornada de Execução. **Tudo que cabe num card cabe nesta linha** — se um
campo não estiver aqui, ele não tem como ser preenchido, porque é este arquivo que cria a tarefa.

```
- [ ] Título da tarefa @responsável !30/09/2026 #projeto [interno]   <!-- id:… -->
      > descrição da tarefa, uma ou mais linhas
  - [ ] subtarefa (basta indentar 2 espaços)                         <!-- id:… -->
    - [ ] sub-subtarefa (indente mais 2)                             <!-- id:… -->
```

| marcador | o que define | se você não escrever |
|---|---|---|
| `- [ ]` / `- [/]` / `- [x]` | a fazer / em andamento / concluída | a fazer |
| `@nome` | responsável (`@"Nome Composto"` com aspas) | fica **sem responsável** |
| `!dd/mm/aaaa` | prazo | fica **sem prazo** |
| `#projeto` / `#aculturamento` | tipo | Projeto de IA |
| `[interno]` | o cliente **não** vê esta tarefa | o cliente vê |
| `> texto` na linha de baixo | descrição (aparece ao abrir o card) | sem descrição |
| indentar 2 espaços | vira subtarefa da tarefa acima (vale em qualquer profundidade) | tarefa de topo |

Os marcadores só valem **no fim da linha** — `Revisar #3 do contrato` continua sendo um título.
Um título que TERMINA na forma de um marcador sai escapado com `\\` (`Ligar para \\@joao`); a barra é
só para o parser e nunca aparece no card. Você não precisa escrever isso à mão.
Marque `[x]` para concluir e adicione linhas novas à vontade: elas entram no quadro na próxima
sincronização e voltam aqui com o `<!-- id:… -->` preenchido. **Não apague o marcador de id** das
tarefas que já têm um.

## Primeiro: fundamento no Skip; depois: conexões

- [x] Criar a base do sistema no Skip
  > SPEC-1-000 (spec-1-000-fundamento-skip.md), CA-F1. Reutilizar o projeto Skip conectado, criar as coleções nativas e o contrato interno da aplicação, sem chamada a ERP ou canal externo. Antes de acesso e conectores; CL-001/002 não bloqueiam o fundamento. Evidência: 05_entregas/fase-1/spec-1-000/. Teste humano antes de avançar.

- [ ] Montar as telas com dados de demonstração
  > SPEC-1-000 (spec-1-000-fundamento-skip.md), CA-F2, CA-F3. Construir navegação, catálogo e os quatro blocos do painel com fixtures sintéticas e aviso permanente de demonstração. Antes de acesso e conectores; CL-001/002 não bloqueiam o fundamento. Evidência: 05_entregas/fase-1/spec-1-000/. Teste humano antes de avançar.

- [ ] Conferir o fundamento antes das conexões
  > SPEC-1-000 (spec-1-000-fundamento-skip.md), CA-F1–F4. Provar navegação, contratos internos, estados vazio/erro e isolamento das fixtures; liberar as próximas levas somente após teste humano explícito. Antes de acesso e conectores; CL-001/002 não bloqueiam o fundamento. Evidência: 05_entregas/fase-1/spec-1-000/. Teste humano antes de avançar.


- [ ] Confirmar acessos e papéis [interno]  <!-- id:029ec0f7-b419-432d-b5de-5896097ea6a3 -->
  > SPEC-1-001 (spec-1-001-acesso-por-area.md), CA-A1. Registrar projeto Skip e matriz nominal de acesso aprovada, sem credenciais no arquivo; usar CL-003 e CL-004 como pré-condições. Pré-condições e ordem constam na SPEC. Evidência em 05_entregas/fase-1/spec-1-001/; confirmar teste humano antes de avançar.
- [ ] Proteger as telas e os dados por área [interno]  <!-- id:f79b943e-452f-4950-a694-891779eacc66 -->
  > SPEC-1-001 (spec-1-001-acesso-por-area.md), CA-A2, CA-A3. Implementar autenticação nativa e proteção de rotas, coleções e consultas por área, respeitando a matriz aprovada. Pré-condições e ordem constam na SPEC. Evidência em 05_entregas/fase-1/spec-1-001/; confirmar teste humano antes de avançar.
- [ ] Testar login e restrições de acesso [interno]  <!-- id:db079721-3633-4a14-8143-2be82cedd333 -->
  > SPEC-1-001 (spec-1-001-acesso-por-area.md), CA-A2–A4. Testar acesso permitido, usuário sem papel, sessão expirada e tentativa de alteração do próprio perfil; registrar prova e obter teste humano. Pré-condições e ordem constam na SPEC. Evidência em 05_entregas/fase-1/spec-1-001/; confirmar teste humano antes de avançar.
- [ ] Conectar a leitura dos dados do Omie [interno]  <!-- id:f39ced9b-dbae-4966-bbb5-f93da1a4573c -->
  > SPEC-1-002 (spec-1-002-leitura-omie.md), CA-O1, CA-O2. Usar o backend Skip Cloud e os acessos autorizados para ler recursos Omie; registrar contratos/mapeamentos e uma atualização completa de teste. Pré-condição: acesso aceito e CL-001; respeitar lease/geração, chaves e autorização no servidor. Evidência em 05_entregas/fase-1/spec-1-002/.
- [ ] Recuperar atualizações interrompidas do Omie [interno]  <!-- id:ce435e2a-d6ae-4124-9e1e-4e67528dd1e8 -->
  > SPEC-1-002 (spec-1-002-leitura-omie.md), CA-O3, CA-O4. Preservar último lote válido, tratar falha/paginação/repetição e retomar sem duplicar registros ou chamar operações transacionais. Pré-condição: acesso aceito e CL-001; respeitar lease/geração, chaves e autorização no servidor. Evidência em 05_entregas/fase-1/spec-1-002/.
- [ ] Conferir a integração Omie com dados autorizados [interno]  <!-- id:a5b75aca-a22e-43bd-805b-e38ffc91f304 -->
  > SPEC-1-002 (spec-1-002-leitura-omie.md), CA-O1–O4. Reconciliar amostra e contagens com o Omie, validar timeout/credencial inválida e conferir ausência de segredos e escrita no ERP. Pré-condição: acesso aceito e CL-001; respeitar lease/geração, chaves e autorização no servidor. Evidência em 05_entregas/fase-1/spec-1-002/.
- [ ] Exibir pedidos pendentes da Nuvemshop [interno]  <!-- id:0641975b-95f9-4c91-8a2d-c607f1a25c31 -->
  > SPEC-1-003 (spec-1-003-pedidos-nuvemshop.md), CA-N1, CA-N2. Ler pedidos/status no servidor Skip Cloud e separar intenção de compra de registros oficiais do Omie; não alterar pedidos nos canais. Pré-condições: acesso e pedidos Omie aceitos, CL-002; respeitar precedência de status e referência comprovada. Evidência em 05_entregas/fase-1/spec-1-003/.
- [ ] Relacionar pedidos de canais sem duplicação [interno]  <!-- id:b0502049-e8d5-480b-b3c0-01b69a05c7a4 -->
  > SPEC-1-003 (spec-1-003-pedidos-nuvemshop.md), CA-N3. Vincular somente por referência de integração comprovada; preservar conflito e pedidos manuais sem tentar combinar apenas por cliente/valor. Pré-condições: acesso e pedidos Omie aceitos, CL-002; respeitar precedência de status e referência comprovada. Evidência em 05_entregas/fase-1/spec-1-003/.
- [ ] Testar pagamento pendente e falha do canal [interno]  <!-- id:f2bda37f-9ce6-4014-a8d7-152e7e313fba -->
  > SPEC-1-003 (spec-1-003-pedidos-nuvemshop.md), CA-N1–N4. Provar transições pago/não pago/cancelado, loja própria via Omie, referência ausente e indisponibilidade sem ocultar pedidos oficiais. Pré-condições: acesso e pedidos Omie aceitos, CL-002; respeitar precedência de status e referência comprovada. Evidência em 05_entregas/fase-1/spec-1-003/.
- [ ] Exibir catálogo e fichas técnicas do Omie [interno]  <!-- id:8352cecc-0dee-41d0-a445-5751127dbe55 -->
  > SPEC-1-004 (spec-1-004-catalogo-operacional.md), CA-C1, CA-C2. Exibir produtos, unidade oficial, local e ficha técnica importados, com origem/horário e sem editar o mestre. Pré-condições: acesso e recursos de catálogo Omie aceitos; não criar receita, unidade ou conversão. Evidência em 05_entregas/fase-1/spec-1-004/.
- [ ] Sinalizar cadastros e unidades incompletos [interno]  <!-- id:ece1553b-6cd1-4cb6-8030-840353c172a5 -->
  > SPEC-1-004 (spec-1-004-catalogo-operacional.md), CA-C3. Diferenciar produto inativo, ficha ausente e unidade incompatível; preservar dados e impedir conversão/cálculo inventados. Pré-condições: acesso e recursos de catálogo Omie aceitos; não criar receita, unidade ou conversão. Evidência em 05_entregas/fase-1/spec-1-004/.
- [ ] Conferir a atualização do catálogo [interno]  <!-- id:0113090a-8cf4-419e-bcc7-1b7b2986d1ce -->
  > SPEC-1-004 (spec-1-004-catalogo-operacional.md), CA-C1–C4. Comparar amostra com Omie, repetir lote e testar desativação/ficha ausente/ID longo; registrar prova e obter validação humana. Pré-condições: acesso e recursos de catálogo Omie aceitos; não criar receita, unidade ou conversão. Evidência em 05_entregas/fase-1/spec-1-004/.
- [ ] Publicar o painel diário por área [interno]  <!-- id:ee794334-224f-4066-9d75-8c42e7fc2306 -->
  > SPEC-1-005 (spec-1-005-painel-diario.md), CA-P1, CA-P2. Montar a visão diária no Skip com estoque, produção, compras e pedidos; aplicar filtros e permissões às linhas e totais. Pré-condições: SPECs anteriores com prova/aceite; não desenvolver capacidade de outra fase. Evidência em 05_entregas/fase-1/spec-1-005/.
- [ ] Mostrar atualização e falhas em cada bloco [interno]  <!-- id:ca5ece04-40ed-4c93-8fa4-1e0875505fbe -->
  > SPEC-1-005 (spec-1-005-painel-diario.md), CA-P3, CA-P4. Exibir fonte, último sucesso, falha e ausência de dado; preservar snapshots e distinguir zero válido, indisponível e lote antigo. Pré-condições: SPECs anteriores com prova/aceite; não desenvolver capacidade de outra fase. Evidência em 05_entregas/fase-1/spec-1-005/.
- [ ] Validar o painel com a equipe [interno]  <!-- id:0b045738-b6a1-4188-8f22-9bc230fa2cd3 -->
  > SPEC-1-005 (spec-1-005-painel-diario.md), CA-P1–P5. Executar a demonstração integrada e regressão da Fase 1, comparar amostras autorizadas e registrar aceite humano sem marcar tasks por silêncio. Pré-condições: SPECs anteriores com prova/aceite; não desenvolver capacidade de outra fase. Evidência em 05_entregas/fase-1/spec-1-005/.
