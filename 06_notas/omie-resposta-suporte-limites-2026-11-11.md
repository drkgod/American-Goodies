# Resposta do suporte do Omie sobre o bloqueio (CL-PEND-006) — 11/11/2026

Resposta colada pelo dono na conversa. Ela explica a causa e os limites; **não diz que a chave foi liberada**. Nenhuma chamada ao Omie foi feita; a primeira consulta continua esperando o aviso do dono.

**Causa de MISUSE_API_PROCESS:** consumo indevido, por requisições repetidas ou excessivas ao mesmo método, IP e chave.

**Limites informados**
- 240 requisições por minuto por IP + chave + método.
- 4 requisições simultâneas por IP + chave + método.
- 960 requisições por minuto por IP.
- A mesma requisição (mesmo ID) repetida só é liberada depois de 60 segundos.
- Consulta repetida ao mesmo método sem tratar a resposta: depois de 10 requisições incorretas, bloqueio de 30 minutos (HTTP 425).

**Boas práticas:** evitar consultas simultâneas, pausar entre requisições, guardar em cache para não repetir a mesma consulta.

**Como o sistema já se comporta (regras do projeto):** um sub-lote por vez, pausa entre chamadas, espera de 60 segundos antes de repetir a mesma consulta, HTTP 425 ou "consumo redundante" registram a hora da próxima tentativa e mantêm o último dado válido, sem laço e sem rotina agendada.

**Falta:** aviso do dono de que a chave foi liberada; chave e segredo novos no cofre do Skip (feito pelo dono); resposta se outro sistema usa a mesma chave.
