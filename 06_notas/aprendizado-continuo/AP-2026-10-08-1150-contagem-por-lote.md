# AP-2026-10-08-1150 — contagem de lote deve ser por lote, nunca global

- Status: candidato
- Escopo: projeto do cliente (Skip Cloud)
- Task/SPEC: SPEC-1-002 CA-O1/O2 (task f39ced9b)
- Sinal: o contador de itens do lote foi calculado com countRecords global da coleção pcp_dados;
  no replay de uma segunda execução o total dobrou (8 em vez de 4) porque a coleção acumula
  lotes antigos. A ativação atômica passou a contar apenas registros do lote
  (findRecordsByFilter com filtro lote = {:l}).
- Evidência: estado /backend/v1/pcp/sync/estado com total_itens=8 antes da correção e 4 depois
  (v0.0.19 → v0.0.20); replay provado sem duplicação após a correção.
- Regra reutilizável: qualquer agregado de "conjunto do lote" deve ser filtrado pela identidade
  do lote/geração — agregados globais em coleções acumulativas mentem no segundo ciclo.
- Quando aplicar: toda contagem/soma sobre coleções de staging/snapshots com histórico.
- Quando não aplicar: coleções de registro único por entidade (ex.: pcp_perfis por usuário).
- Confiança: alta — erro reproduzido em prova e corrigido com bateria verde.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
