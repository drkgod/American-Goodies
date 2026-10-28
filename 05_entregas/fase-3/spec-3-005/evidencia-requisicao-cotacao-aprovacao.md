# Evidência — Requisição por fornecedor, cotação e aprovação da compra (SPEC-3-005)

Data: 28/10/2026 · Skip v0.0.179 (ref 9f76820), publicada e provada (referência publicada = versão atual).

## Construído (no Skip)
- **CA-3-14 requisição:** `requisicao.ts` (uma requisição por fornecedor e data/emergência; "a definir" sem fornecedor; quantidade nas duas unidades pelo fator confirmado; emergencial exige motivo;
  item fora do catálogo barrado com "cadastrar no Omie antes de comprar"; mesma origem não duplica), migration `0033_pcp_requisicoes` (5 coleções, regras null; índice único por origem),
  rota `POST /backend/v1/pcp/compras/requisicoes` (a unidade de estoque vem do catálogo, nunca do navegador).
- **CA-3-15 cotação:** rotas `POST .../compras/cotacao` e `.../cotacao/escolher`; preço convertido pelo fator; diferença para o último preço do histórico (SPEC-3-004); destaque só com tolerância cadastrada.
- **CA-3-16 aprovação:** rotas `.../requisicao/enviar`, `.../requisicao/alterar` e `.../compras/aprovacao` (exige `aprovar_compra`; alçada do aprovador cobrindo o valor; sem nenhuma alçada, 423 "alçada não cadastrada";
  acima do limite, 403 com a alçada maior; recusa exige motivo; guarda autor, hora, valor, alçada e hash do conteúdo; alterar quantidade ou trocar cotação depois de aprovar invalida a aprovação).
- Tela `/compras/requisicoes` (agrupada por fornecedor, cotações, aprovação) e rota de leitura `GET .../compras/requisicoes`.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-005, **72 de 72 passaram** (8 novos).
  P3.05-01 (dois fornecedores → duas requisições), P3.05-02 (acima da alçada: negada, aponta a maior), P3.05-03 (alteração depois da aprovação invalida e impede o pedido),
  P3.05-04 (100 KG até a aprovação: valor R$ 1.000,00, alçada, hash), P3.05-05 (cotação 15% acima com tolerância 10% destacada; sem tolerância só mostra a diferença).
- QA do Skip verde na v0.0.179; migrations 0032 e 0033 aplicadas (`skip_cloud_list_migrations`); sem avisos nos logs.

## Limites e pendências
- **Alçadas e tolerância:** nenhuma alçada nem tolerância foram cadastradas (CL-PEND-008 e CL-PEND-001, dados do dono); `pcp_alcadas` está vazia, então a aprovação real fica parada com o motivo. Alçadas de demonstração existem só nos testes.
- **Botão no cartão da sugestão:** não foi ligado. A tela de Sugestões é uma demonstração com casos fixos, e criar requisição real a partir dela seria falso. A rota já aceita a origem da sugestão (`sugestao|id|versão`); a ligação vem com as sugestões reais (SPEC-3-001, aguarda a chave do Omie).
- **Último preço:** vem de `pcp_precos_compra`, ainda vazia até a carga real da SPEC-3-004; enquanto isso a tela mostra "sem histórico".
- **P3.05-06 (regressão da fase 2):** os testes `spec-2-*` não foram copiados; sugestões e rascunhos da fase 2 não foram alterados.
- Rotas e tela não exercitadas contra o servidor (sem conta de teste neste ambiente); nenhuma conta real recebeu ação nova (matriz CL-003). Nada grava no Omie.
