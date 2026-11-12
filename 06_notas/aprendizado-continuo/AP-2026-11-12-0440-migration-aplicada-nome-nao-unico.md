# AP-2026-11-12-0440 — nome de migration aplicada não é único na lista

- **Quando:** 12/11/2026, recuperação de 04:28Z (MCP do Skip de volta).
- **Origem:** conferência das migrations da produção para fechar o checkpoint antigo
  (última rodada de 11/11 ficou sem `skip_project_status` e sem `skip_file_list`).

## O que apareceu

`skip_cloud_list_migrations` (produção, projeto 62774) devolveu **três** registros com o
mesmo nome:

| versão | nome | criada |
|---|---|---|
| 1794427191 | 0049_acessos_usuarios | 2026-11-11T19:59:02Z |
| 1794427193 | 0050_acessos_usuarios | 2026-11-11T19:59:03Z |
| 1794427403 | 0051_acessos_usuarios | 2026-11-11T20:02:32Z |

Nenhum traz `file_missing: true` — e o working tree tem **um** arquivo
`pocketbase/migrations/0049_acessos_usuarios.js`. As versões são timestamps com 2 s e 3 min
de diferença: o mesmo arquivo foi aplicado mais de uma vez (reaplicação), e o campo `name`
acompanhou o ordinal renomeado em cada tentativa, não o conteúdo.

## Regra de operação

1. `file_missing: true` é o único sinal confiável de "migration aplicada cujo arquivo sumiu".
2. Repetição de nome **não** é migration faltante, e contar ordinais diferentes na lista de
   aplicadas **inventa** migrations que nunca existiram.
3. Prova de arquivo publicado: os `pocketbase/migrations/` do working tree
   (`skip_file_list`/`skip_file_read`) cruzados com a ausência de `file_missing` na lista.
4. Antes de escrever migration nova, o próximo número livre continua sendo o maior ordinal
   **presente no working tree**, não o maior ordinal visto na lista de aplicadas.

## Limite declarado

Esta rodada não recuperou o texto exato aplicado nas três versões (a listagem não devolve
corpo). O conteúdo do arquivo atual está no working tree e é o que a próxima publicação usa;
as versões antigas são histórico do banco, não fonte de verdade.
