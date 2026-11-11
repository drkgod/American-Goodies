# Evidência — SPEC-4-002 (identidade visual)

11/11/2026 · Skip v0.0.218 (ref 5518a65).

- Propostas A, B e C montadas e enviadas ao dono (`propostas/propostas.html`); escolha: A (`escolha-do-dono.md`).
- Tema A aplicado em `src/main.css` (espelho dos tokens em `07-sistemas/pcp/codigo/tema-a.css`): fundo creme, menu lateral marrom, botão em laranja escuro, laranja da marca em `--brand`; `destructive` escurecido para cumprir 4,5:1. Tokens antigos: padrão cinza do kit (voltar a versão do Skip desfaz).
- Marca provisória (`Marca.tsx`, SVG nas cores do logo) no login e no menu; ícone da aba `favicon.svg`; título "PCP American Goodies"; `lang="pt-BR"`; login centralizado; página de erro em português; fonte Inter; algarismos de largura fixa nas tabelas.
- Provas: CA-4-07 (13 pares com 4,5:1 ou mais), CA-4-08, CA-4-09 e CA-4-10 em `green-*.txt`; regressão em `regressao.txt`.
- Pendente: capturas das telas reais e medição do login em 360 px (usuário de teste, CL-PEND-016); logo em SVG ou PNG de 512 px ou mais para trocar a marca provisória; o selo "Criado com o Skip" do login não foi verificado em tela aberta.
