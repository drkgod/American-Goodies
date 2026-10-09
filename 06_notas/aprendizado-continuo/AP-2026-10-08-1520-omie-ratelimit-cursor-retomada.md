# AP-2026-10-08-1520 — Omie: rate-limit, transporte intermitente e retomada por cursor

- **Contexto**: leitura do lote oficial de pedidos (ListarPedidos, 5393 registros/54 páginas) numa conta de produção; execuções parciais em vários ciclos.
- **Sinais observados na conta real**:
  1. Rate-limit Omie chega como HTTP 500/429 com corpo `Aguarde N segundos` — a janela informada varia (vistos N=1..30+). Respeitar `proxima_em_ms = (N+5)s` funciona; chamar antes queima as 3 tentativas da etapa (falha final com lote intacto).
  2. `falha_transporte` (timeout/socket) é intermitente e independente da janela — aconteceu em páginas variadas (10, 12, 29) e em horas diferentes; não é determinístico da carga.
  3. Contas grandes NÃO cabem num único ciclo de executor: lote parcial é estado legítimo, não erro — o cursor do servidor (`sync/iniciar` devolve a execução vigente) retoma de onde parou, e o lote anterior permanece ativo até a ativação atômica.
- **Orientação reutilizável**: para recursos paginados de contas grandes, planejar a leitura como tarefa de vários ciclos com retomada por cursor; nunca reiniciar a execução do zero após falha parcial; tratar falha parcial como "em progresso" na comunicação ao cliente.
- **Evidência**: artifacts dos ciclos 2026-10-08 (omie-pedidos gen5 28 págs, gen6 10 págs, gen7 em andamento); evidência CA-N1–N4 em 05_entregas/fase-1/spec-1-003/.
