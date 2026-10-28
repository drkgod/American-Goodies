# Evidência — Acessos de compras, fornecedores, item cadastrado antes da compra e conversões (SPEC-3-003)

Data: 28/10/2026 · Skip v0.0.177 (ref 86e3a1c), publicada e provada (referência publicada = versão atual).

## Construído (no Skip)
- **CA-3-08 acessos:** `acoes-compras.ts` (oito ações, área de cada uma, guarda `exigirAcao`: ação E área, uma única recusa 403 sem pistas; matriz vigente para
  conta real = não aprovada, logo nenhuma conta real recebe ação nova), migration `0030_area_recebimento` (acrescenta a área `recebimento`; conferida no banco: 7 áreas,
  nenhum perfil mudou), rota `GET /backend/v1/pcp/compras/acesso`.
- **CA-3-09 fornecedores:** migration `0031_pcp_compras_base` (3 coleções, regras null), `fornecedor-complemento.ts`, rotas `POST .../compras/fornecedor` (versão nova por alteração, autor e hora do
  servidor) e `GET .../compras/fornecedores`, tela `/fornecedores`.
- **CA-3-10 item fora do cadastro:** `bloqueio-item.ts`, rotas `POST .../compras/excecao` (só `autorizar_excecao_compra`, motivo obrigatório, uma por item e documento) e
  `POST .../compras/item/avaliar` ("cadastrar no Omie antes de comprar"; catálogo não lido por inteiro = mensagem própria). As rotas de requisição, cotação e recebimento (SPECs 3-005 a 3-007) vão usar
  esta mesma regra.
- **CA-3-11 conversões:** `conversao.ts`, rotas `POST .../compras/conversao` (unidade de estoque sempre a do catálogo real, nunca do navegador; fator ≤ 0 recusado; versão nova) e
  `GET .../compras/conversoes`, tela `/conversoes`.

## Provas
- `node --test` (Node v24.22.1, baixado de nodejs.org com checksum conferido): suíte inteira das SPECs 3-001 a 3-003, **56 de 56 passaram** (18 novos desta SPEC: 6 de acessos, 12 de bloqueio, conversão e complemento).
  Inclui P3.03-01 (sem `aprovar_compra` → 403), P3.03-02 (item fora do catálogo bloqueado; exceção sem motivo recusada), P3.03-03 (sem fator → pendência e preço sem comparação) e P3.03-04 (4 sacos de 25 kg a R$ 250,00 → 100 KG a R$ 10,00).
- QA do Skip verde nas versões 0.0.176 e 0.0.177; migrations 0030 e 0031 aplicadas (`skip_cloud_list_migrations`) e coleções conferidas.

## Limites e pendências
- **P3.03-05 (fornecedores reais):** a lista do cadastro de fornecedores do Omie não é lida (chave bloqueada, CL-PEND-006; contrato de leitura ainda sem sonda). A tela mostra os complementos e avisa disso.
- **P3.03-06 (regressão de acesso da fase 2):** os testes `spec-2-*` não foram copiados para rodar; nenhum arquivo da fase 2 foi alterado.
- **Rotas e telas não exercitadas contra o servidor** (sem conta de teste neste ambiente): a prova é o módulo testado, o QA e a ausência de erro nos logs. As oito ações não foram dadas a nenhuma conta real: dependem da matriz (CL-003).
- Contatos de fornecedor ficam só no banco do Skip; as fixtures dos testes são fictícias.
