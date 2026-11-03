# SPEC-4-003 — Menu por área e tela inicial de cada pessoa

**Fase:** 4  
**Status:** planejada  
**Dono:** American Goodies (todas as áreas) com o Maestro; conferência na sessão final  
**Origem no escopo:** P6 (acabamento do sistema, 03/11/2026)  
**Degrau da solução:** nativo da plataforma — componentes `sidebar` e `sheet` do kit e ícones `lucide-react`.

## Contexto e decisões fechadas

- **Estado atual:**
  - O menu tem 24 itens numa linha só, sem grupos e sem ícones.
  - No computador, quem tem todas as áreas perde 10 itens para fora da tela, de "Exportação" em diante.
  - No celular, a página fica mais larga que a tela.
  - A tela inicial diz "Painel operacional da Fase 1" e tem 2 atalhos.
  - Cada item do menu já tem a área que o mostra (lista de itens do layout).
- **Estado desejado:**
  - Menu lateral agrupado, com ícones, que recolhe para só os ícones no computador e abre por um botão no celular.
  - Cabeçalho com o nome da tela, o sino de alertas com contador e o menu da pessoa.
  - Tela inicial com saudação, data, os atalhos da pessoa e os alertas abertos dela.
- **Decisões já fechadas:**
  - **Grupos, itens e ícones.** As rotas e as áreas de cada item não mudam:

    | Grupo | Item (rótulo) | Rota | Ícone `lucide-react` |
    |---|---|---|---|
    | — | Início | `/` | `House` |
    | Visão geral | Painel | `/painel` | `LayoutDashboard` |
    | Visão geral | Catálogo | `/catalogo` | `Package` |
    | Visão geral | Sugestões | `/sugestoes` | `Lightbulb` |
    | Visão geral | Sazonalidade | `/historico-vendas` | `CalendarRange` |
    | Produção | Planejamento | `/planejamento` | `CalendarClock` |
    | Produção | Parâmetros | `/parametros` | `SlidersHorizontal` |
    | Produção | Apontamentos | `/apontamentos` | `ClipboardPen` |
    | Produção | Conferências | `/conferencias` | `ClipboardCheck` |
    | Produção | Consolidações | `/consolidacoes` | `Layers` |
    | Produção | Qualidade | `/qualidade` | `BadgeCheck` |
    | Produção | Envio ao Omie | `/envio-omie` | `Send` |
    | Compras | Fornecedores | `/fornecedores` | `Building2` |
    | Compras | Conversões | `/conversoes` | `ArrowLeftRight` |
    | Compras | Histórico de preços | `/compras/historico` | `ChartLine` |
    | Compras | Requisições | `/compras/requisicoes` | `FileText` |
    | Compras | Entregas | `/compras/entregas` | `Truck` |
    | Recebimento | Recebimentos | `/recebimentos` | `PackageCheck` |
    | Pedidos e faturamento | Unidades | `/unidades` | `Store` |
    | Pedidos e faturamento | Preparação de pedidos | `/pedidos/preparacao` | `PackageOpen` |
    | Pedidos e faturamento | Pedidos manuais | `/pedidos/manuais` | `FilePlus` |
    | Gestão | Alertas | `/alertas` | `Bell` |
    | Gestão | Relatórios | `/relatorios` | `ChartColumn` |
    | Gestão | Assistente | `/assistente` | `MessageSquare` |
    | Gestão | Exportação | `/exportacao` | `Download` |

    Se um ícone não existir na versão instalada do `lucide-react`, use o equivalente mais próximo da mesma família e registre a troca.
  - **Visibilidade:** a regra de hoje continua. Item só aparece para quem tem a área dele, e grupo sem item visível não aparece. A área de cada item é a de hoje, com uma diferença: Conferências aparece para quem tem `conferir_expedicao` ou `painel`, como a SPEC-4-001 define.
  - **Rotas fora do menu:**
    - `/alertas/loop` e `/parametros/alertas` continuam abrindo pelos links da tela Alertas;
    - `/assistente/loop` continua abrindo pelo link da tela Assistente;
    - `/trocar-senha` fica no menu da pessoa;
    - `/login` e a página de erro (`*`) ficam fora do menu.
  - **Acesso à tela inicial (exceção à regra comum 3, decidida pelo consultor em P6):**
    - a rota `/` deixa de exigir a área `painel` e passa a exigir só sessão e perfil ativos;
    - ela mostra só os atalhos das áreas da pessoa;
    - o sino e o cartão de alertas aparecem só para quem tem `painel`, porque `/alertas` exige essa área;
    - o primeiro nome vem de `user.name`; se estiver vazio, a saudação sai sem nome.
  - **Abertura dos grupos:** o grupo da tela aberta fica aberto e os outros começam fechados. A escolha da pessoa fica guardada no navegador. Isso é só preferência de tela, não dado.
  - **Computador (768 px ou mais):** menu lateral fixo, que recolhe para só os ícones, com dica do nome ao passar o mouse.
  - **Celular (menos de 768 px):** o menu abre num painel lateral (`sheet`) pelo botão no cabeçalho e fecha ao escolher a tela.
  - **Cabeçalho:**
    - nome da tela;
    - para quem tem `painel`, sino com o número de alertas abertos, a mesma contagem de hoje, que leva a `/alertas`;
    - menu da pessoa, com nome, "Trocar senha" e "Sair".
  - **Tela inicial:**
    - "Bom dia", "Boa tarde" ou "Boa noite" (pelo horário de São Paulo), com o primeiro nome e a data;
    - para quem tem `painel`, um cartão com os alertas abertos, que leva a `/alertas`;
    - os atalhos da pessoa, em cartões agrupados como no menu.

    Nenhum número novo é calculado.
- **Bloqueios:** a medição e as capturas com sessão aberta usam os usuários de teste (CL-PEND-016). Até eles existirem, a tarefa fica em `[/]` com os testes puros verdes.

## Resultado observável

Quem entra vê o próprio nome, os alertas abertos e só os atalhos das suas áreas. No computador, todos os itens cabem no menu. No celular, o menu abre pelo botão e a página não passa da largura da tela.

## Limites e dependências

- **Inclui:** layout com menu lateral, cabeçalho, versão celular do menu e tela inicial nova.
- **Fora de escopo:** mudar rota, área, permissão ou a contagem de alertas; criar indicador novo na tela inicial.
- **Entradas e pré-condições:** lista de itens do layout atual, com a área de cada um.
- **Saídas/artefatos:**
  - layout e tela inicial novos;
  - `05_entregas/fase-4/spec-4-003/` com a evidência;
  - arquivos espelhados.
- **Dependências e responsáveis:** Maestro constrói.
- **Atores e permissões mínimas:** os perfis de teste das áreas (PCP, compras, faturamento, um com todas e um com uma só).
- **Superfícies/arquivos/configurações afetadas:** componente de layout, tela `/` e lista de itens do menu.
- **Risco e plano B:** se o componente `sidebar` do kit não couber no projeto, use `sheet` também no computador e registre.
- **Rollback ou reversão:** voltar a versão do Skip.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Perfil da pessoa → menu | Áreas do perfil (já lidas pelo layout) | Lista de áreas | Sessão ativa | — | Sem áreas: só "Início" e a mensagem "Seu acesso ainda não foi liberado. Fale com o gestor." |
| Alertas abertos → sino e tela inicial | Contagem já usada pelo layout | Número | Sessão ativa | — | Falha: o sino fica sem número; a tela inicial mostra "não foi possível carregar" |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Item cuja área a pessoa não tem | Não aparece | — | Regra de hoje |
| RN-02 | Grupo sem item visível | Não aparece | — | P6 |

## Fluxo e regras

1. Ler o layout atual, a lista de itens e a tela `/`.
2. Montar o menu agrupado pela tabela da decisão fechada, aplicando a visibilidade por área.
3. Montar o cabeçalho e a versão celular.
4. Trocar a tela inicial.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Perfil com todas as áreas, 1280 px | 6 grupos, 25 itens, todos acessíveis sem rolagem lateral | — |
| Limite | Perfil só com `apontar_producao`, 360 px | Só "Início" e "Apontamentos"; menu pelo botão | — |
| Falha | Perfil sem área | Só "Início" e a mensagem de acesso não liberado | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC, o layout, a lista de itens do menu, `src/App.tsx` e a tela `/`.
2. **Alterar somente:** layout, cabeçalho, lista de itens (grupo e ícone), tela `/` e a guarda da rota `/` em `src/App.tsx`.
3. **Não alterar:** as outras rotas e guardas, as áreas dos itens (fora o que a SPEC-4-001 define para Conferências) e a contagem de alertas.
4. **Executar nesta ordem:** menu no computador → celular → cabeçalho → tela inicial.
5. **Parar e pedir validação quando:** não há parada; o que esta SPEC não decide segue a tabela da decisão fechada.
6. **Estado válido ao parar:** todas as rotas continuam acessíveis pelo menu.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. A conferência do cliente é na sessão final (SPEC-4-007). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Menu agrupado com os 25 itens e ícones
- [ ] Visibilidade por área provada por teste
- [ ] Celular: menu no painel lateral, sem rolagem lateral
- [ ] Cabeçalho com sino e menu da pessoa
- [ ] Tela inicial nova, sem "Fase 1"
- [ ] Regressão de `tests/pcp/` passando; arquivos espelhados

## Critérios de aceite

- [ ] **CA-4-11:**
  - a lista de itens do menu tem exatamente as 25 entradas da tabela (os 24 itens de hoje mais Início), cada uma com grupo, rótulo, rota, área e ícone;
  - a área de cada item é igual à de hoje;
  - as rotas fora do menu continuam acessíveis pelos links listados na decisão fechada.
- [ ] **CA-4-12:** para cada perfil de teste, o menu mostra só os itens das suas áreas e esconde os grupos vazios.
- [ ] **CA-4-13:**
  - com o perfil de todas as áreas, em 1280 px, todos os itens ficam acessíveis no menu sem sair da tela;
  - em 360 px, o menu abre pelo botão e a página não tem rolagem lateral;
  - o cabeçalho mostra o nome da tela, o sino com a contagem de alertas abertos (para quem tem `painel`) e o menu da pessoa com "Trocar senha" e "Sair".
- [ ] **CA-4-14:** a tela inicial abre para qualquer perfil ativo, inclusive sem `painel`; mostra saudação, primeiro nome (ou sem nome), data e só os atalhos da pessoa, sem o texto "Fase"; o cartão de alertas e o sino aparecem só para quem tem `painel`.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | Teste da lista de itens (os 24 itens de hoje mais Início, com grupo, ícone e a mesma área de hoje; rotas fora do menu com o link de origem) e da função que filtra itens e grupos por área | `node --test tests/pcp/spec-4-003.test.mjs` antes da mudança | Falha: itens sem grupo e sem ícone | `05_entregas/fase-4/spec-4-003/red.txt` |
| GREEN | Mesmos testes, mais o da saudação por horário de São Paulo | `node --test --test-name-pattern "<critérios da tarefa>" tests/pcp/spec-4-003.test.mjs` | Passam (CA-4-11, 12 e 14) | `05_entregas/fase-4/spec-4-003/green-CA-4-NN.txt` |
| REFACTOR/REGRESSÃO | Medição no navegador, em 360 e 1280 px, com os perfis de todas as áreas e de uma área (`document.documentElement.scrollWidth <= window.innerWidth`), e capturas do cabeçalho; testes de `tests/pcp/` | Navegador automatizado, se houver; senão, capturas com a medição no console | CA-4-13; nenhuma regressão | `05_entregas/fase-4/spec-4-003/capturas/` e `regressao.txt` |

**Dados/fixtures:** perfis de teste com todas as áreas, com uma área e sem área.  
**Caminhos de erro obrigatórios:** perfil sem área; falha na contagem de alertas.  
**Evidência exigida:** saídas dos testes e capturas do menu aberto e recolhido, no computador e no celular.

## Teste humano do cliente

- **Origem:** CL-007 (sessão de validação final)
- **Quando:** na sessão final (SPEC-4-007)
- **Quem testa:** o dono e uma pessoa de cada área
- **Passos:**
  1. Cada pessoa entra com a própria conta.
  2. Acha as suas telas pelo menu.
  3. Abre o menu no celular.
  4. Volta à tela inicial.
- **Resultado esperado:** cada pessoa acha o que usa em até dois cliques e não vê telas que não são dela.
- **Evidência do aceite:** registro em `05_entregas/fase-4/validacao-final.md`.

## Handoff e operação

- **Como demonstrar:** entrar com os perfis de todas as áreas e de uma área, no computador e no celular.
- **Como operar depois:** item novo de menu entra na lista com grupo, área e ícone.
- **Como monitorar:** o teste da lista roda a cada versão.
- **Pendência conhecida:** nenhuma.

## Tasks vinculadas

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| id pendente | Organizar o menu lateral por área, com ícones e versão para celular | American Goodies | SPEC-4-003 | CA-4-11 a CA-4-13 | Lista, filtro por área, cabeçalho e medição de largura | green-CA-4-11.txt, green-CA-4-12.txt e capturas | — | ☐ |
| id pendente | Montar a tela inicial com os atalhos e os alertas de cada pessoa | American Goodies | SPEC-4-003 | CA-4-14 | Saudação, atalhos e alertas | green-CA-4-14.txt | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
