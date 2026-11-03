# SPEC-4-006 — Telas do chão de fábrica no celular e no tablet

**Fase:** 4  
**Status:** planejada  
**Dono:** American Goodies (cozinha e encaixotamento, expedição e câmara fria, almoxarifado e faturamento) com o Maestro; conferência na sessão final  
**Origem no escopo:** P6 (acabamento do sistema, 03/11/2026). O escopo deixou de fora a compra de tablets, não o uso deles: apontamentos, conferências e recebimentos acontecem na cozinha, na expedição e no almoxarifado.  
**Degrau da solução:** nativo da plataforma — classes responsivas do Tailwind e componentes do kit, sem aplicativo instalado.

## Contexto e decisões fechadas

- **Estado atual:**
  - O sistema inteiro tem só 28 regras de adaptação de tela.
  - No celular, a página fica mais larga que a tela e corta o conteúdo à direita, por exemplo em Início e Apontamentos.
- **Estado desejado:**
  - As quatro telas do chão de fábrica são confortáveis com uma mão, no celular e no tablet:
    - Apontamentos;
    - Conferências;
    - Recebimentos;
    - Preparação de pedidos.
  - Nenhuma tela do sistema tem rolagem para o lado na página.
- **Decisões já fechadas:**
  - **Larguras de referência:** celular 360 × 740, tablet 768 × 1024, computador 1280 × 800.
  - **Nas quatro telas do chão de fábrica, abaixo de 768 px:**
    - cada linha da tabela vira um cartão, com o produto e a quantidade em destaque e o selo de estado;
    - a ação principal fica fixa no rodapé, na largura toda, e age sobre o cartão aberto:
      - Apontamentos: "Registrar";
      - Conferências: "Conferir expedição" ou "Conferir câmara", conforme o ponto da pessoa;
      - Recebimentos: o botão de registrar o recebimento, com o rótulo de hoje;
      - Preparação de pedidos: "Liberar para faturar".

      As outras ações (por exemplo, "Salvar frete", "Registrar volumes" e a decisão de duplicata) ficam dentro do cartão;
    - áreas de toque com pelo menos 44 × 44 px;
    - campos de quantidade com `inputmode="decimal"` e fonte de pelo menos 16 px, para o celular não dar zoom;
    - filtros num painel que abre por um botão "Filtros".
  - **Nas outras telas:** sem rolagem lateral na página. Tabela larga rola dentro do próprio quadro.
  - **Tablet (768 px):** as quatro telas usam a tabela do kit com colunas essenciais. Colunas secundárias vão para o detalhe da linha.
  - **Nada de regra muda:** os mesmos campos, botões e conferências. Só a disposição.
- **Bloqueios:** a medição e as capturas com sessão aberta usam os usuários de teste (CL-PEND-016). Até eles existirem, as tarefas ficam em `[/]`.

## Resultado observável

Na cozinha, a pessoa abre Apontamentos no celular, vê um cartão por item e aponta com o polegar, com o botão "Apontar" sempre à vista. Na expedição e no almoxarifado, o mesmo vale para Conferências e Recebimentos, e no faturamento para Preparação de pedidos. Nenhuma tela corta conteúdo à direita.

## Limites e dependências

- **Inclui:**
  - cartões, botão fixo, toque, teclado numérico e filtros nas quatro telas;
  - fim da rolagem lateral em todas as telas;
  - capturas nas três larguras.
- **Fora de escopo:** aplicativo instalado, funcionamento sem internet, leitor de código de barras, compra de aparelho.
- **Entradas e pré-condições:** SPECs 4-003 (menu no celular) e 4-005 (componentes) no ar.
- **Saídas/artefatos:**
  - telas adaptadas;
  - script de medição de largura;
  - capturas em `05_entregas/fase-4/spec-4-006/capturas/`;
  - arquivos espelhados.
- **Dependências e responsáveis:** Maestro constrói.
- **Atores e permissões mínimas:** perfis de teste da cozinha, expedição, almoxarifado e faturamento.
- **Superfícies/arquivos/configurações afetadas:** as quatro telas e qualquer tela com rolagem lateral.
- **Risco e plano B:** se não houver navegador automatizado no ambiente, a medição é feita no console do navegador, em cada largura, e registrada com captura.
- **Rollback ou reversão:** voltar a versão do Skip.

## Dados e integrações

Nenhuma integração nova. As telas usam as mesmas rotas.

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Largura menor que 768 px nas quatro telas | Cartões e botão fixo | — | P6 |
| RN-02 | Qualquer tela em qualquer largura de referência | `document.documentElement.scrollWidth <= window.innerWidth` | Tabela rola dentro do quadro | P6 |

## Fluxo e regras

1. Medir as larguras de todas as rotas nas três larguras e registrar onde há rolagem lateral.
2. Adaptar as quatro telas do chão de fábrica.
3. Corrigir a rolagem lateral das outras telas.
4. Medir de novo e gerar as capturas.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Apontamentos em 360 px | Cartões, botão "Apontar" fixo, teclado numérico | — |
| Limite | Nome de produto longo | Quebra em duas linhas dentro do cartão | — |
| Falha | Tela com tabela de 12 colunas em 360 px | A tabela rola dentro do quadro; a página não | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC e as quatro telas.
2. **Alterar somente:** disposição e classes de tela; o componente de cartão das quatro telas.
3. **Não alterar:** campos, regras, rotas e permissões.
4. **Executar nesta ordem:** medição inicial → Apontamentos → Conferências → Recebimentos → Preparação de pedidos → demais telas → medição final.
5. **Parar e pedir validação quando:** não há parada.
6. **Estado válido ao parar:** as telas já adaptadas funcionam nas três larguras.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. A conferência do cliente é na sessão final (SPEC-4-007). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Medição inicial registrada (rota × largura)
- [ ] Quatro telas com cartões, botão fixo, toque de 44 px e teclado numérico
- [ ] Nenhuma rota com rolagem lateral nas três larguras
- [ ] Capturas das quatro telas nas três larguras
- [ ] Regressão de `tests/pcp/` passando; arquivos espelhados

## Critérios de aceite

- [ ] **CA-4-24:**
  - em 360 px, Apontamentos, Conferências, Recebimentos e Preparação de pedidos mostram cartões, a ação principal da decisão fechada fixa no rodapé com área de toque de pelo menos 44 × 44 px e os filtros no painel "Filtros";
  - em 768 px, as quatro telas mostram a tabela só com as colunas essenciais, e as outras ficam no detalhe da linha.
- [ ] **CA-4-25:** os campos de quantidade das quatro telas têm `inputmode="decimal"` e fonte de pelo menos 16 px.
- [ ] **CA-4-26:** em 360, 768 e 1280 px, nenhuma rota do sistema tem `scrollWidth` maior que a largura da janela.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | Script de medição que abre cada rota com o perfil de todas as áreas, nas três larguras, e registra `scrollWidth`, tamanho dos botões principais e atributos dos campos de quantidade | Navegador automatizado (`tests/pcp/spec-4-006.medicao.mjs`), se houver; senão, o mesmo código no console de cada rota | Falha: Início e Apontamentos com rolagem lateral; sem `inputmode` | `05_entregas/fase-4/spec-4-006/red.txt` |
| GREEN | Mesma medição | Mesmo comando | CA-4-24 a 26 passam | `05_entregas/fase-4/spec-4-006/green.txt` |
| REFACTOR/REGRESSÃO | Capturas das quatro telas nas três larguras; testes de `tests/pcp/` | Capturas; `node --test tests/pcp/` | Nenhuma regressão | `05_entregas/fase-4/spec-4-006/capturas/` e `regressao.txt` |

**Dados/fixtures:** dado de demonstração com nome de produto longo e 30 linhas por tela.  
**Caminhos de erro obrigatórios:** tabela larga, nome longo, teclado aberto cobrindo o botão.  
**Evidência exigida:** tabela de medição antes e depois, e capturas.

## Teste humano do cliente

- **Origem:** CL-007 (sessão de validação final)
- **Quando:** na sessão final (SPEC-4-007)
- **Quem testa:** cozinha ou encaixotamento, expedição ou câmara fria, almoxarifado e faturamento, cada um no aparelho que usa no trabalho
- **Passos:**
  1. Cada pessoa faz no celular ou no tablet um registro de demonstração na sua tela: apontar, conferir, receber ou liberar.
- **Resultado esperado:** a pessoa registra com uma mão, sem dar zoom e sem rolar para o lado.
- **Evidência do aceite:** registro em `05_entregas/fase-4/validacao-final.md`, com o aparelho usado.

## Handoff e operação

- **Como demonstrar:** as capturas nas três larguras.
- **Como operar depois:** tela nova passa pela medição de largura antes de ir ao ar.
- **Como monitorar:** a medição roda a cada versão, quando houver navegador automatizado.
- **Pendência conhecida:** nenhuma.

## Tasks vinculadas

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| id pendente | Adaptar apontamentos, conferências, recebimentos e preparação de pedidos para o celular | American Goodies | SPEC-4-006 | CA-4-24, CA-4-25 | Medição das quatro telas | green-CA-4-24.txt, green-CA-4-25.txt e capturas | SPECs 4-003 e 4-005 no ar | ☐ |
| id pendente | Tirar a rolagem para o lado de todas as telas no celular e no tablet | American Goodies | SPEC-4-006 | CA-4-26 | Medição de todas as rotas | green-CA-4-26.txt | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
