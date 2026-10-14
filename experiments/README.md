# Experimentos e Protocolo de Avaliação

Este diretório gerencia os scripts executáveis de experimentação e comparação quantitativa de desempenho entre o algoritmo K-Means padrão e as técnicas de redução de iterações.

## Execução Rápida do Comparativo

Para rodar a comparação entre o baseline e as técnicas implementadas:

```bash
# A partir da raiz do repositório:
PYTHONPATH=src python3 experiments/run_comparison.py
```

## Métricas Avaliadas

1. **Número de Iterações ($N_{\text{iter}}$)**: Iterações até a convergência dos centróides ou tolerância $\epsilon$.
2. **Redução Percentual de Iterações**:
   $$\text{Redução (\%)} = \frac{N_{\text{iter}}^{\text{baseline}} - N_{\text{iter}}^{\text{técnica}}}{N_{\text{iter}}^{\text{baseline}}} \times 100$$
3. **Tempo Computacional ($T_{\text{sec}}$)**: Tempo total despendido no processo de ajuste dos agrupamentos.
4. **Inércia / Distorção Final (SSE)**: Soma dos Erros Quadráticos baseada na distância euclidiana quadrática.

