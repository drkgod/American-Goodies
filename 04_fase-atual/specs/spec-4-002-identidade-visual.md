# SPEC-4-002 — Identidade visual da American Goodies

**Fase:** 4  
**Status:** planejada  
**Dono:** American Goodies (o dono escolhe a proposta) com o Maestro  
**Origem no escopo:** P6 (acabamento do sistema, 03/11/2026); CL-008 (escolha da proposta); CL-PEND-015 (logo e cores)  
**Degrau da solução:** nativo da plataforma — tema do kit shadcn/ui por variáveis CSS, sem biblioteca nova.

## Contexto e decisões fechadas

- **Estado atual:**
  - O título da aba é "Um incrível projeto do Skip" e a página declara inglês (`lang="en"`).
  - Não há logo nem cor da marca: o tema é o padrão do kit, em cinza e preto.
  - O login fica colado no topo, sem o nome da empresa.
  - A página de erro diz "Oops! Page not found".
- **Estado desejado:**
  - O sistema tem o logo, as cores e a fonte da American Goodies, aplicados por tokens do tema no arquivo de estilos global importado por `src/main.tsx` (hoje `src/main.css`).
  - O título da aba é "PCP American Goodies" e o ícone da aba é o símbolo da marca.
  - O idioma declarado é `pt-BR`.
  - O login é centralizado e tem a marca.
  - A página de erro é em português.
- **Decisões já fechadas:**
  - **Propostas:** o Maestro monta 3 propostas a partir do logo e das cores recebidos e o dono escolhe uma. Esse é o único ponto de aprovação antes da sessão final.
  - **Cada proposta** é um conjunto de tokens. Mostra a mesma tela de login, a tela inicial e uma tela com tabela (Requisições), em capturas de computador e de celular. As três propostas variam assim:
    - **A:** cor da marca no menu lateral e nos botões principais, fundo claro;
    - **B:** menu lateral claro e cor da marca só nos botões e destaques;
    - **C:** cor da marca no cabeçalho e menu lateral claro.
  - **Fonte:** se a marca tiver fonte própria disponível para web, ela é usada. Senão, usa-se `Inter` para tudo. Os números das tabelas usam algarismos de largura fixa (`font-variant-numeric: tabular-nums`).
  - **Contraste:** texto e botões cumprem 4,5:1. Se a cor da marca não cumprir como fundo de botão, usa-se um tom mais escuro dela no botão, e a cor original fica nos destaques.
  - **Selo "Criado com o Skip":** sai do login se o plano do Skip permitir. Se não permitir, fica e registra-se o motivo.
- **Bloqueios:** as capturas de telas com sessão aberta usam o usuário de teste (CL-PEND-016). As propostas esperam o logo e as cores (CL-PEND-015) e as SPECs 4-003 a 4-006 no ar, porque mostram o menu novo e os componentes do kit. Por isso esta SPEC vem depois da 4-006 no `fase.md`. Se o logo chegar antes, guarde os arquivos e siga a ordem.

## Resultado observável

O dono recebe 3 propostas lado a lado e escolhe uma. Depois disso, o login, o menu, os botões, a aba do navegador e a página de erro mostram a American Goodies, com as cores e o logo dela, em português.

## Limites e dependências

- **Inclui:**
  - tokens de cor, fonte e raio no `:root` do arquivo de estilos global (`src/main.css`);
  - logo no login e no menu;
  - ícone da aba;
  - título e idioma em `index.html`;
  - login centralizado com logo e nome;
  - página de erro em português, com o botão "Voltar ao início".
- **Fora de escopo:** modo escuro; manual de marca; mudança de rota, regra ou permissão.
- **Entradas e pré-condições:** logo (SVG, ou PNG com fundo transparente de pelo menos 512 px) e cores da marca (CL-PEND-015).
- **Saídas/artefatos:**
  - 3 propostas em `05_entregas/fase-4/spec-4-002/propostas/`;
  - registro da escolha do dono;
  - tema aplicado.
- **Dependências e responsáveis:** o cliente manda o logo e as cores; o dono escolhe; o Maestro aplica.
- **Atores e permissões mínimas:** nenhum perfil novo.
- **Superfícies/arquivos/configurações afetadas:**
  - `index.html`, `src/main.css`, `public/` (ícone e logo);
  - componente de layout;
  - telas de login e de erro.
- **Risco e plano B:** se o dono não escolher em até 5 dias úteis depois de receber, aplica-se a proposta B, a mais neutra, e registra-se. O dono pode trocar na sessão final.
- **Rollback ou reversão:** voltar a versão do Skip; os tokens antigos ficam registrados na evidência.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Logo e cores → tema | Arquivos enviados pelo cliente (CL-PEND-015) | Arquivo do logo; códigos de cor; nome da fonte, se houver | — | — | Arquivo ilegível ou de baixa resolução: pedir de novo ao dono, dizendo o formato |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Par de texto e fundo abaixo de 4,5:1 | Escurecer o tom até cumprir | Texto grande (24 px ou mais): 3:1 | Regra comum 5 |
| RN-02 | Proposta escolhida | Vira o tema do sistema | — | CL-008 |

## Fluxo e regras

1. Conferir os arquivos recebidos e extrair as cores do logo se o cliente mandar só o logo. Nesse caso, registre os códigos extraídos e confirme com o dono junto com as propostas.
2. Montar as 3 propostas (decisão fechada) como conjuntos de tokens e gerar as capturas.
3. Mandar ao dono, numa mensagem só, as 3 propostas com a pergunta "Qual das três vai para o sistema?".
4. Com a resposta, aplicar a proposta escolhida, o logo, o ícone, o título, o idioma, o login e a página de erro.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Logo e cores recebidos; dono escolhe a B | Sistema com a proposta B | — |
| Limite | Só o logo chegou | Cores extraídas do logo e confirmadas na escolha | — |
| Falha | Cor da marca sem contraste no botão | Tom mais escuro no botão (RN-01) | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC, `index.html`, `src/main.tsx` e o arquivo de estilos que ele importa, o layout e as telas de login e de erro.
2. **Alterar somente:** tokens do tema, `index.html`, os arquivos de logo e ícone, o layout (só o logo), o login e a página de erro.
3. **Não alterar:** regras, rotas, permissões, os textos das outras telas (SPEC-4-004) e, no `index.html`, as linhas marcadas `@skip-protected` e o script `skip.js`.
4. **Executar nesta ordem:** propostas → escolha do dono → aplicação.
5. **Parar e pedir validação quando:** as propostas estiverem prontas. Esse é o ponto de aprovação desta SPEC (CL-008). Enquanto o dono não responde, siga com as tarefas da SPEC-4-007 que não dependem do visual (leituras reais e rotas no servidor).
6. **Estado válido ao parar:** o tema atual continua no ar até a escolha.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Ponto de aprovação antes da sessão final: a task "Montar 3 propostas de visual com o logo e as cores da American Goodies", porque a escolha é do dono.

## Checklist de execução

- [ ] Logo e cores recebidos e conferidos
- [ ] 3 propostas com capturas de computador e celular
- [ ] Escolha do dono registrada (quem, quando, qual)
- [ ] Tema aplicado; contraste conferido por teste
- [ ] Título, ícone, `lang="pt-BR"`, login e página de erro prontos
- [ ] Regressão de `tests/pcp/` passando; arquivos espelhados

## Critérios de aceite

- [ ] **CA-4-06:** as 3 propostas, com capturas de login, início e Requisições no computador e no celular, estão em `propostas/`, e a mensagem com a pergunta foi enviada ao dono.
- [ ] **CA-4-07:** está registrada a escolha do dono (quem, quando e onde), ou a aplicação da proposta B depois de 5 dias úteis sem resposta, com a data do envio. Os pares do tema aplicado cumprem 4,5:1 (3:1 para texto de 24 px ou mais):
  - `foreground` sobre `background`;
  - `primary-foreground` sobre `primary`;
  - `secondary-foreground` sobre `secondary`;
  - `muted-foreground` sobre `background` e sobre `muted`;
  - `accent-foreground` sobre `accent`;
  - `destructive-foreground` sobre `destructive`;
  - `card-foreground` sobre `card`;
  - `success-foreground` sobre `success`;
  - `warning-foreground` sobre `warning`;
  - `info-foreground` sobre `info`.
- [ ] **CA-4-08:** a aba mostra "PCP American Goodies" e o ícone da marca, e o documento declara `lang="pt-BR"`.
- [ ] **CA-4-09:** o login é centralizado, mostra o logo e o nome, e funciona em 360 px de largura sem rolagem para o lado.
- [ ] **CA-4-10:** a página de erro está em português e tem o botão "Voltar ao início".

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | Teste que lê os tokens do arquivo de estilos global e calcula o contraste de cada par; teste que lê `index.html` (título e `lang`) e procura texto em inglês na página de erro | `node --test tests/pcp/spec-4-002.test.mjs` antes da mudança | Falha: título do Skip, `lang="en"`, "Oops! Page not found" | `05_entregas/fase-4/spec-4-002/red.txt` |
| GREEN | Mesmos testes depois da aplicação | `node --test --test-name-pattern "CA-4-07\|CA-4-08\|CA-4-10" tests/pcp/spec-4-002.test.mjs` | Passam (CA-4-07, 08 e 10) | `05_entregas/fase-4/spec-4-002/green-aplicacao.txt` |
| REFACTOR/REGRESSÃO | Capturas do login em 360, 768 e 1280 px, com a medição de largura da SPEC-4-006; testes de `tests/pcp/` | Capturas pelo navegador; `node --test tests/pcp/` | Login sem rolagem lateral (CA-4-09); nenhuma regressão | `05_entregas/fase-4/spec-4-002/capturas/` e `regressao.txt` |

**Dados/fixtures:** os arquivos do logo e as cores; uma tela de Requisições com dado de demonstração.  
**Caminhos de erro obrigatórios:** cor sem contraste; logo só em JPG com fundo; ausência de fonte própria.  
**Evidência exigida:** as 3 propostas, a mensagem com a escolha do dono (data e canal) e as saídas dos testes.

## Teste humano do cliente

- **Origem:** CL-008 (escolha da proposta) e CL-007 (sessão final)
- **Quando:** a escolha quando as propostas ficarem prontas; a conferência na sessão final (SPEC-4-007)
- **Quem testa:** o dono escolhe; na sessão, cada área confere no aparelho que usa
- **Passos:**
  1. O dono olha as 3 propostas e responde qual vai para o sistema.
  2. Na sessão final, cada pessoa entra pelo login e navega nas próprias telas.
- **Resultado esperado:** o sistema tem a cara da American Goodies e se lê bem no computador e no celular.
- **Evidência do aceite:** mensagem do dono com a escolha; registro em `05_entregas/fase-4/validacao-final.md`.

## Handoff e operação

- **Como demonstrar:** as 3 propostas e o sistema com a escolhida.
- **Como operar depois:** trocar a cor ou o logo é trocar os tokens e os arquivos; nenhuma tela muda.
- **Como monitorar:** o teste de contraste roda a cada versão.
- **Pendência conhecida:** depende de CL-PEND-015.

## Tasks vinculadas

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| id pendente | Montar 3 propostas de visual com o logo e as cores da American Goodies | American Goodies | SPEC-4-002 | CA-4-06 | Propostas e mensagem ao dono | propostas/ | CL-PEND-015; SPECs 4-003 a 4-006 no ar | ☐ |
| id pendente | Aplicar o visual escolhido no tema, no login, na aba do navegador e na página de erro | American Goodies | SPEC-4-002 | CA-4-07 a CA-4-10 | Testes de contraste, título, idioma e erro; capturas do login | green-aplicacao.txt e capturas | Escolha do dono registrada (CL-008) | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
