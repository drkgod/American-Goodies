> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# American Goodies — Fase 1

**Repositório privado:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies).

Pacote operacional para executar o painel integrado no Skip, usando MCP do Skip e banco/backend nativo Skip Cloud. Somente a Fase 1 está liberada neste pacote.

- [Tasks da fase](04_fase-atual/fase.md)
- [SPECs e testes](04_fase-atual/specs/00-INDICE.md)
- 05_entregas/ — evidências de execução e aceite.
- 06_notas/ — dúvidas e decisões operacionais do cliente.
- 07-sistemas/ — vínculos com o projeto Skip, contratos técnicos e documentação do sistema.

## Como executar

Confirmar o projeto Skip conectado e ler a SPEC da primeira task elegível. Implementar uma task por vez pelo agente conectado, rodar suas provas, demonstrar o resultado e aguardar confirmação explícita do teste humano antes de avançar.

Omie é a fonte principal. Esta fase apenas consulta ERP/canais e apresenta dados por área. Credenciais ficam nos secrets do servidor; não colar no pacote. Dados sintéticos só são usados em homologação identificada.

fase.md é a fonte dos campos dos cards; preserve status, descrições e IDs devolvidos pelo portal. Novas tasks aguardam UUID, responsável e prazo informados, sem preenchimento automático.

Os testes RED/GREEN/regressão e as fixtures estão dentro das SPECs. O pacote gera os contratos; ainda não implementa o sistema nem comprova testes/aceite.
