# Evidência — SPEC-4-004 (telas na língua da operação)

09/11/2026 · Skip v0.0.208 (ref 02ed133) · tarefas em andamento (`[/]`).

## O que mudou
- `src/lib/pcp/textos.ts`: dicionário de estados (`rotuloEstado`, com "outro estado" e aviso no console para o que não tem rótulo), `mensagemDeErro` (tabela da SPEC; 425 com a hora de São Paulo), `textoSeguro` (texto de fora só aparece se não tiver padrão proibido), `semInformacao` e `bloqueadoPor`.
- `src/components/ComoFunciona.tsx`: explicação da regra num `collapsible`, fechado por padrão.
- 31 telas de `src/pages/`: subtítulo curto (`data-subtitulo`, até 140 caracteres), explicação em "Como funciona", mensagens pelo módulo de textos. Os textos de `src/lib/pcp/` e dos hooks não mudaram.
- Nenhuma regra, cálculo, permissão, rota do servidor ou gravação no Omie mudou.

## Provas
- `red.txt`: sem `textos.ts` o teste não carrega (RED).
- `green-CA-4-16.txt`, `green-CA-4-17.txt`, `green-CA-4-18.txt`, `green-CA-4-15.txt`; `regressao.txt` (267 de 267).
- Exceções da varredura: `07-sistemas/pcp/codigo/spec-4-004.excecoes.json` (3, todas o valor de código `replay` comparado no código; a tela mostra "Já registrado" ou "Nada mudou").
- A varredura ignora, como a SPEC manda, `import`, `className`, rotas e `pb.send`; um texto que é só um código em minúsculas com sublinhado (valor usado em comparação, nunca frase) não conta como "nome de ação".

## Escolhas onde a SPEC não fechava (palavra mais simples)
- "loop" nas telas e botões virou "acompanhamento" (só os dois títulos estavam na tabela).
- "Piloto real" virou "Produto de conferência"; "lote ativo" virou "leitura carregada"; "saldo ausente" virou "sem informação".
- Exportação mostra o assunto sem o prefixo do sistema ("pedidos preparacao" em vez do nome da coleção); os arquivos do pacote mantêm o nome técnico.
- Preparação de pedidos: o JSON do que lançar no Omie virou uma lista de "campo: valor".
- Sugestões: o usuário fixo da demonstração passou de um nome de pessoa para "dono".

## Pendente
- Capturas antes e depois (Apontamentos, Alertas e os dois loops): pedem sessão aberta com usuário de teste (CL-PEND-016).
- Teste humano: sessão final (SPEC-4-007), três pessoas lendo as telas em voz alta (CL-007).
