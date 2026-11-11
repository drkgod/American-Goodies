# Fase 4 — Tarefas

<!-- fase-format:2 -->

Cada linha é uma tarefa da Jornada de Execução. **Tudo que cabe num card cabe nesta linha** — se um
campo não estiver aqui, ele não tem como ser preenchido, porque é este arquivo que cria a tarefa.

O quadro completo está no repositório (04_fase-atual/fase.md); esta leitura foi feita em 11/11.

- [x] Separar no servidor os registros de teste e de demonstração dos reais
- [/] Gravar no servidor a programação publicada na tela de Planejamento
- [/] Dar tela de Usuários para cadastrar pessoa, liberar acesso e redefinir senha @"American Goodies"
  > Cadastro de conta + perfil numa tela só, com nome no lugar de id, correção dos perfis com formato quebrado (Keoma, linha com `{}`) e redefinição de senha; fecha a dependência do painel técnico. Descoberta em 11/11.
  > Resultado parcial (11/11/2026): migration 0048, hook `/backend/v1/pcp/usuarios*`, serviço e página escritos e salvos em `05_entregas/fase-4/tela-usuarios/` (sintaxe conferida localmente); MCP do Skip fora do ar desde 15:26, nada aplicado nem publicado — rota nova responde 404. Falta: gravar a página, ligar rota `/usuarios` e item de menu (Gestão), aplicar, publicar.
