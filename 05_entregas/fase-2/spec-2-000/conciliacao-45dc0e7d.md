# Conciliação — Task 45dc0e7d: card duplicado das telas (SPEC-2-000, CA-A4)

- Data: 2026-10-14 · Executor: MCC (ETHOS) · Autorização: owner Mr Cheney ("Autorizo implementar a task 45dc0e7d conforme o plano apresentado", 18:19 BRT)
- Recorte: documental — nenhuma implementação, migration, hook, coleção ou dado de produto alterado.

## Par conciliado

| Papel | UUID | Título | Situação |
|---|---|---|---|
| Duplicata | 45dc0e7d-36ef-4c2d-a333-54a667efa8ca | Conciliar o card duplicado das telas | resolvida por este registro (fase.md F2) |
| Original | edb85ce0-4bc8-4222-8279-607f62bfc5d4 | Montar as telas com dados de demonstração | homologada na F1 em 01/10/2026 |

## Provas do original (F1)

- 05_entregas/fase-1/contratos-homologados/fase-original.md (SHA 97c6e3f9): card "Montar as telas com dados de demonstração" [x], SPEC-1-000 CA-F2/F3.
- 05_entregas/fase-1/spec-1-000/evidencia-ca-f2-f3.md (SHA 215e9cd0): testes GREEN com fixtures exatas (P1=10 UN/A; P2=2 KG/B; OP-1; C-1; OM-11/OM-L1 oficiais; NS-10 intenção separada), estados vazio/indisponivel/falha distintos, varredura estática sem rede/ERP, rotas /catalogo e /painel, banner de demonstração; QA nativo ok (v0.0.7, build 7874626c); migration 0002 applied; coleções confirmadas no banco.
- Testes humanos do owner em 01/10 (14:56 e 15:13) e aceite final da F1 (08/10, 18:23).

## Disposição oficial

**Duplicata conciliada** — a entrega original (edb85ce0) foi homologada na Fase 1 com prova e aceite humano; o card duplicado (45dc0e7d) fica resolvido por este registro de conciliação, pelo mecanismo oficial do portal (vínculo card→evidência), sem reimplementar, recriar ou reexecutar a entrega homologada. UUIDs preservados; histórico intacto.

- Condição anterior: card duplicado aberto em fase.md F2 (herdado da transição autorizada em 09/10).
- Ação: registro documental do vínculo duplicata→original + disposição oficial (esta task).
- Estado posterior: duplicata conciliada; zero implantação do fundamento (T4 da SPEC: vínculo e disposição registrados).

## Observação sobre os marcadores de ID

O arquivo arquivado da F1 (fase-original.md) não exibe os marcadores `<!-- id:… -->` dos três cards de fundamento; os UUIDs originais (16a7a99b/edb85ce0/6209142d) têm como fonte canônica a SPEC-2-000 (recebida do portal em 09/10, revisão 13/10), autoridade do vínculo registrado aqui.
