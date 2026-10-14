# Notebooks Exploratórios

Este diretório contém Jupyter Notebooks destinados à experimentação interativa, análise exploratória de dados e visualização de agrupamentos.

## Convenções de Nomenclatura

- `01_baseline_exploracao.ipynb`: Exploração do algoritmo K-Means padrão e convergência das iterações.
- `02_tecnica_modified_kmeans.ipynb`: Estudo da Técnica 1 (Lee et al. / Paliwal & Ramasubramanian).
- `03_tecnica_fast_codebook.ipynb`: Estudo da Técnica 2 (Bilal et al. / inicialização por padrões).
- `04_aplicacao_quantizacao_imagem.ipynb`: Avaliação na aplicação de quantização vetorial de imagens.

## Dica de Execução
Certifique-se de que o pacote `kmeans_reduction` esteja instalado em modo editável no seu ambiente virtual:
```bash
pip install -e .
```

