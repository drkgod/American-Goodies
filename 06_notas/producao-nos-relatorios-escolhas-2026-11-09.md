# Produção do servidor nos relatórios e nos alertas — escolhas a confirmar (09/11/2026)

SPEC-4-001, CA-4-33. A SPEC pede que o bloco de produção do relatório e a regra de produção atrasada usem as programações e os apontamentos do servidor, sem mudar a fórmula. Para montar a entrada das fórmulas existentes foi preciso escolher o seguinte; nada disso muda `relatorioProducao` nem `regraProducao`.

- **Produzido** = soma do realizado da cozinha (retificação substitui o original). Sem nenhum evento: "sem dado", nunca zero. Realizado 0 declarado é um dado.
- **Conferido** = quantidade da última conferência de entrada em câmara da ordem; sem conferência: "sem dado".
- **Unidade:** a programação não traz unidade. Vale a unidade dos apontamentos e conferências da ordem e, sem nenhum, UN (a unidade das conferências). A lacuna aparece no rodapé do bloco.
- **Programação que vale:** a última versão que não é de demonstração.
- **Ordem iniciada** (produção atrasada) = tem pelo menos um apontamento que não é de demonstração.
- **Consumo** continua "sem dados": falta a ficha técnica real (catálogo real, CL-PEND-006). A taxa de perda depende dele.

Para o consultor: confirmar se "produzido" deve ser o realizado da cozinha ou do encaixotamento, e se "conferido" deve ser a câmara ou a expedição. Enquanto não houver resposta, vale o que está acima.
