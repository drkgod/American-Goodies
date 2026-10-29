# Restauração da cópia num ambiente separado — pendente (SPEC-3-016, P3.16-04)

Data: 29/10/2026 · Registrado pelo executor.

**O que falta:** provar que a cópia dos dados complementares restaurada num ambiente separado tem as mesmas contagens por coleção do pacote exportado.

**Por que ficou pendente:**
- O Skip Cloud não oferece, nas ferramentas disponíveis a este executor, backup nem restauração nativos (só migrations, logs, segredos e coleções); portanto a restauração é "a partir do pacote exportado, num projeto de teste" — plano B da SPEC.
- Isso exige **criar um projeto novo no Skip** (ambiente vazio) e **um importador de CSV** que carregue as coleções nele. Criar projeto na plataforma é uma ação com custo e fora do que o dono autorizou até aqui, e o importador seria código de escrita em massa que não deve entrar na produção. Não criei nenhum dos dois.
- A lógica de conferência (contagens do resumo × contagens do ambiente separado, apontando a coleção que faltar, e recusa de restaurar por cima da produção) está pronta e provada em `exportacao.ts` (`conferirRestauracao`, `destinoPermitido`).

**Entrada necessária:** autorização do dono (ou do consultor) para criar um projeto de teste descartável no Skip, ou indicação de um ambiente separado já existente. Com ele: criar o ambiente vazio, aplicar as migrations, carregar os CSVs do pacote, rodar a contagem por coleção e registrar o resultado (só contagens) em `05_entregas/fase-3/spec-3-016/recuperacao.md`. Descartar o ambiente depois.


## Atualização (29/10/2026)
O dono autorizou a criação do projeto de teste. Feito: projeto nº 70908, restauração de um pacote de demonstração, contagens iguais; relatório em `05_entregas/fase-3/spec-3-016/recuperacao.md`. Resta a conferência com a exportação dos dados reais (precisa de conta com `exportar_dados`) e o descarte do projeto de teste pelo dono.
