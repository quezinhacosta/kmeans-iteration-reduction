# Estudo e Avaliação de Técnicas de Redução do Número de Iterações do Algoritmo K-Means

[![CI - Applications & Experiments](https://github.com/quezinhacosta/kmeans-iteration-reduction/actions/workflows/ci-aplications.yml/badge.svg)](https://github.com/quezinhacosta/kmeans-iteration-reduction/actions/workflows/ci-aplications.yml)
[![CI - Test Suite](https://github.com/quezinhacosta/kmeans-iteration-reduction/actions/workflows/ci.yml/badge.svg)](https://github.com/quezinhacosta/kmeans-iteration-reduction/actions/workflows/ci.yml)
[![Python Version](https://img.shields.io/badge/python-3.9%20%7C%203.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Estrutura%20Inicial%20%2F%20PIBIC-brightgreen.svg)](#)

Repositório acadêmico do plano de trabalho de Iniciação Científica (PIBIC), voltado ao estudo, implementação e avaliação comparativa de técnicas de redução de iterações do algoritmo de agrupamento **K-Means**, com ênfase na métrica de **distância euclidiana quadrática** e aplicações em particionamento de dados e quantização vetorial de imagens.

---

## Sumário

- [1. Visão Geral e Contexto](#1-visão-geral-e-contexto)
- [2. Objetivos](#2-objetivos)
  - [2.1 Objetivo Geral](#21-objetivo-geral)
  - [2.2 Objetivos Específicos](#22-objetivos-específicos)
- [3. Palavras-Chave](#3-palavras-chave)
- [4. Justificativa Teórica](#4-justificativa-teórica)
- [5. Metodologia de Pesquisa](#5-metodologia-de-pesquisa)
- [6. Técnicas Abordadas](#6-técnicas-abordadas)
- [7. Aplicações no Projeto](#7-aplicações-no-projeto)
- [8. Estrutura do Repositório](#8-estrutura-do-repositório)
- [9. Instalação e Configuração](#9-instalação-e-configuração)
- [10. Execução dos Testes](#10-execução-dos-testes)
- [11. Execução dos Experimentos](#11-execução-dos-experimentos)
- [12. Cronograma de Atividades](#12-cronograma-de-atividades)
- [13. Referências Bibliográficas](#13-referências-bibliográficas)
- [14. Licença](#14-licença)

---

## 1. Visão Geral e Contexto

O algoritmo K-Means é um dos métodos de aprendizagem de máquina não-supervisionada mais amplamente adotados no mundo para agrupamento de dados (*clustering*). Contudo, quando aplicado a grandes volumes de dados (*big data*), transmissão multimídia ou processamento de imagens de alta resolução, o custo computacional decorrente do elevado número de iterações e do recálculo contínuo de distâncias torna-se um gargalo crítico.

Este projeto investiga estratégias da literatura de processamento de sinais e inteligência computacional para diminuir a quantidade de iterações requeridas até a convergência estrita, preservando a qualidade da partição final.

---

## 2. Objetivos

### 2.1 Objetivo Geral
Estudar, implementar e avaliar o desempenho de técnicas de redução do número de iterações do algoritmo K-Means.

### 2.2 Objetivos Específicos
- Avaliar o desempenho de **ao menos duas técnicas** de redução do número de iterações do algoritmo K-Means, em que a etapa de particionamento é realizada obrigatoriamente com o uso da **distância euclidiana quadrática**.
- Aplicar e avaliar a abordagem supracitada em **ao menos uma aplicação** envolvendo particionamento de dados (*clustering* e/ou quantização vetorial de imagens).

---

## 3. Palavras-Chave

1. **Inteligência artificial**
2. **Aprendizagem não-supervisionada**
3. **Agrupamento de dados (*Clustering*)**

---

## 4. Justificativa Teórica

O particionamento com K-Means é intensamente utilizado em diversas áreas estratégicas:
- **Processamento, Armazenamento e Transmissão da Informação**: Utilizado no projeto de dicionários (*codebooks*) para Quantização Vetorial (LIMA et al., 2024; FONSECA et al., 2018; FERREIRA et al., 2017; LEITÃO et al., 2015; CALAZANS et al., 2019; KAVITHA et al., 2022; BILAL et al., 2021; RAHEBI, 2022).
- **Segmentação de Imagens Digitais**: Diagnóstico em odontologia e análise médica (CALAZANS; ALCOFORADO; MADEIRO, 2023).
- **Mineração de Dados e Otimização**: Algoritmos híbridos e metaheurísticas (PRAMUDYA et al., 2026).
- **Reconhecimento de Padrões**: Identificação vocal (MADEIRO et al., 2007) e classificação clínica de diabetes (JANNOUD et al., 2024).

Como essas aplicações envolvem massas expressivas de dados, o objetivo central deste plano de trabalho é **reduzir o tempo de execução por meio da redução do número de iterações**, fundamentando-se em contribuições clássicas e recentes como Lee, Baek & Sung (1997), Paliwal & Ramasubramanian (2000) e Bilal, Ullah & Islam (2021).

---

## 5. Metodologia de Pesquisa

O plano de trabalho estrutura-se em 5 etapas metódicas:
1. **Pesquisa bibliográfica contínua** em bases indexadas (**ScienceDirect / Elsevier**, **IEEE Xplore**, **Springer**) através do **Portal de Periódicos da CAPES**, empregando operadores booleanos (`AND`, `OR`, `NOT`).
2. **Estudo dos fundamentos teóricos de aprendizagem**, com ênfase detalhada na convergência do K-Means de Lloyd.
3. **Estudo aprofundado de agrupamento de dados (*clustering*)**.
4. **Levantamento e modelagem de técnicas de aceleração e redução de iterações**.
5. **Implementação comparativa, testes automatizados e avaliação experimental** das técnicas em cenários reais de aplicação.

---

## 6. Técnicas Abordadas

Neste repositório, os algoritmos compartilham a mesma interface padrão (`BaseKMeans`), garantindo reprodutibilidade e rigor experimental:

1. **Linha de Base (`StandardKMeans`)**:
   - Algoritmo clássico de Lloyd com convergência por centróides.
   - Particionamento efetuado via **distância euclidiana quadrática** $d^2(\mathbf{x}, \mathbf{c}) = \sum (x_j - c_j)^2$, eliminando raízes quadradas redundantes.
2. **Técnica 1 (`ModifiedKMeans`)**:
   - Baseada em Lee, Baek & Sung (1997) e Paliwal & Ramasubramanian (2000).
   - Rastreamento dinâmico de centróides ativos e limiares de deslocamento para economizar cálculos e acelerar a estabilização da partição.
3. **Técnica 2 (`FastCodebookKMeans`)**:
   - Baseada em Bilal, Ullah & Islam (2021), Calazans et al. (2019) e Lima et al. (2024).
   - Inicialização otimizada com espalhamento de padrões (*pattern spread / pattern masking*), reduzindo substancialmente o número de iterações até a convergência global.

---

## 7. Aplicações no Projeto

- **Quantização Vetorial de Imagens (`ImageVectorQuantizer`)**:
  - Geração de *codebooks* para compressão e representação com cálculo de PSNR (*Peak Signal-to-Noise Ratio*) e MSE (*Mean Squared Error*).
- **Benchmark Multivariado (`BenchmarkRunner`)**:
  - Avaliação sistemática de convergência em bases sintéticas e reais de *clustering*.

---

## 8. Estrutura do Repositório

```text
kmeans-iteration-reduction/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI: Matriz de testes (Python 3.10-3.12), lint e cobertura
│       └── ci-aplications.yml    # CI: Testes de aplicações e execução do benchmark
├── data/                          # Diretórios de dados (brutos, processados e sintéticos)
│   ├── raw/                       # Dados brutos
│   ├── processed/                 # Dados pré-processados
│   └── synthetic/                 # Dados sintéticos gerados
├── docs/                          # Documentação acadêmica detalhada
│   ├── plano_de_trabalho.md       # Transcrição oficial do plano de trabalho PIBIC
│   └── referencias.md             # Fichamento bibliográfico e strings de busca
├── experiments/                   # Scripts de avaliação experimental
│   ├── README.md                  # Protocolo de experimentação
│   └── run_comparison.py          # Script comparativo de iterações e tempo
├── notebooks/                     # Jupyter Notebooks interativos
│   ├── README.md                  # Guia de organização dos notebooks
│   └── 01_baseline_exploracao.ipynb # Notebook com fluxo inicial de exploração
├── periodicos/                    # Acervo de artigos em PDF levantados no projeto
├── src/
│   └── kmeans_reduction/         # Pacote Python principal
│       ├── __init__.py            # Exportações principais do pacote
│       ├── distance.py            # Métrica de Distância Euclidiana Quadrática
│       ├── base.py                # Interface abstrata BaseKMeans e KMeansResult
│       ├── standard_kmeans.py     # Linha de Base (Baseline Lloyd)
│       ├── metrics.py             # Inércia (SSE), MSE, PSNR, redução %
│       ├── techniques/            # Módulos das técnicas de redução de iterações
│       │   ├── __init__.py
│       │   ├── modified_kmeans.py # Técnica 1 (Lee et al. / Paliwal & Ramasubramanian)
│       │   └── fast_codebook.py   # Técnica 2 (Bilal et al. / Calazans et al.)
│       └── applications/          # Aplicações em dados e quantização vetorial
│           ├── __init__.py
│           ├── image_compression.py    # Aplicação: Quantização vetorial de imagens
│           └── benchmark_clustering.py # Aplicação: Clustering em benchmarks
├── tests/                         # Suite de testes automatizados
│   ├── __init__.py
│   ├── test_distance.py           # Testes da distância euclidiana quadrática
│   ├── test_base.py               # Testes da estrutura base e validações
│   ├── test_standard_kmeans.py    # Testes do algoritmo padrão
│   ├── test_reduction_techniques.py # Testes dos contratos das técnicas
│   ├── test_metrics.py            # Testes das métricas de avaliação
│   └── test_applications.py       # Testes de integração das aplicações
├── .gitignore                     # Configuração de arquivos ignorados no Git
├── pyproject.toml                 # Configuração de empacotamento PEP 517/621
├── requirements.txt               # Dependências do projeto
├── requirements-dev.txt           # Dependências de desenvolvimento e testes
└── README.md                      # Documento principal do repositório
```

---

## 9. Instalação e Configuração

### Pré-requisitos
- Python `>= 3.9` (recomendado: 3.10, 3.11 ou 3.12)
- Gerenciador de pacotes `pip`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/quezinhacosta/kmeans-iteration-reduction.git
   cd kmeans-iteration-reduction
   ```

2. **Crie e ative um ambiente virtual:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # Linux/macOS
   # No Windows: .venv\Scripts\activate
   ```

3. **Instale as dependências e o pacote em modo editável:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements-dev.txt
   pip install -e .
   ```

---

## 10. Execução dos Testes

O projeto conta com testes unitários e de integração desenvolvidos para executar sem fricção:

### Execução com `unittest` (sem necessidade de pacotes externos instalados):
```bash
PYTHONPATH=src python3 -m unittest discover tests -v
```

### Execução com `pytest` e relatório de cobertura:
```bash
pytest --cov=kmeans_reduction tests/ -v
```

---

## 11. Execução dos Experimentos

Para rodar o script comparativo que avalia o número de iterações da linha de base contra as técnicas implementadas:

```bash
PYTHONPATH=src python3 experiments/run_comparison.py
```

Exemplo de saída gerada pelo comparativo:
```text
==============================================================================
 EXPERIMENTO COMPARATIVO: TÉCNICAS DE REDUÇÃO DE ITERAÇÕES DO K-MEANS
==============================================================================

[+] Gerando dados sintéticos: 400 amostras, 3 atributos, 4 clusters...
[*] Executando Standard (Lloyd Baseline)...
[*] Executando Modified K-Means (Lee et al.)...
[*] Executando Fast Codebook (Bilal et al.)...

------------------------------------------------------------------------------
Algoritmo                        | Iterações  | Redução (%)  | Tempo (ms) | Inércia   
------------------------------------------------------------------------------
Standard (Lloyd Baseline)        | 4          | Linha de Base | 5.24       | 1710.09   
Modified K-Means (Lee et al.)    | 4          | +0.0%        | 4.48       | 1710.09   
Fast Codebook (Bilal et al.)     | 3          | +25.0%       | 4.15       | 1710.09   
------------------------------------------------------------------------------

[OK] Experimento concluído com sucesso!
```

---

## 12. Cronograma de Atividades

Cronograma oficial do plano de trabalho (Ciclo AGO – JUL):

| Atividade | Descrição | AGO | SET | OUT | NOV | DEZ | JAN | FEV | MAR | ABR | MAI | JUN | JUL |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | Pesquisa bibliográfica | **X** | **X** | **X** | **X** | **X** | **X** | **X** | **X** | **X** | **X** | | |
| **2** | Estudo de fundamentos de aprendizagem, com ênfase no K-Means | **X** | **X** | **X** | **X** | | | | | | | | |
| **3** | Estudo de fundamentos de agrupamento de dados (*clustering*) | | | **X** | **X** | | | | | | | | |
| **4** | Estudo de técnicas de redução do número de iterações do K-Means | | | | **X** | **X** | **X** | | | | | | |
| **5** | Implementação de técnicas de redução e avaliação em aplicação | | | | | | | **X** | **X** | **X** | **X** | **X** | **X** |

---

## 13. Referências Bibliográficas

- BILAL, M.; ULLAH, Z.; ISLAM, I. U. **Fast Codebook Generation Using Pattern Based Masking Algorithm for Image Compression.** *IEEE Access*, v. 9, pp. 98904–98915, 2021.
- [CALAZANS, M. A. A.](http://lattes.cnpq.br/4352906565360215) ; [ALCOFORADO, M. L. M. G.](http://lattes.cnpq.br/0471789576411239) ; MADEIRO, F. **Técnicas de Inteligência Computacional Aplicadas à Segmentação e ao Diagnóstico de Imagens Odontológicas.** *Proceedings of the XVI Brazilian Conference on Computational Intelligence (CBIC)*, Salvador, BA, 2023.
- CALAZANS, R. S. H.; BARROS, N.; MELO, P. A. V.; [LIMA, V. S.](http://lattes.cnpq.br/6653682115715369) ; MADEIRO, F. **Inicialização do Algoritmo do Vagalume Aplicado ao Projeto de Dicionários.** *Anais do Congresso Brasileiro de Inteligência Computacional (CBIC)*, Belém, Pará, 2019.
- FERREIRA, F. A. B. S.; LEITÃO, H. A. S.; LOPES, W. T. A.; MADEIRO, F. **Hybrid firefly-Linde-Buzo-Gray Algorithm for Channel-Optimized Vector Quantization Codebook Design.** *Integrated Computer-Aided Engineering*, v. 24, p. 297-314, 2017.
- FONSECA, C. S.; [FERREIRA, F. A. B. S.](http://lattes.cnpq.br/9939255113143786) ; MADEIRO, F. **Vector Quantization Codebook Design Based on Fish School Search Algorithm.** *Applied Soft Computing*, v. 73, p. 958-968, 2018.
- JANNOUD, I. et al. **A Multi-Layered Hybrid Machine Learning Algorithm (MLHA) for Type II Diabetes Classification.** *Procedia Computer Science*, v. 237, p. 445–452, 2024.
- KAVITHA, V. R.; KANCHANA, M.; GOBINATHAN, B.; SEKAR, K. R.; SIKKANDAR, M. Y. **Optimization Based Vector Quantization for Data Reduction in Multimedia Applications.** *Intelligent Automation & Soft Computing*, v. 31, pp. 853–867, 2022.
- LEE, D.; BAEK, S.; SUNG, K. **Modified K-means Algorithm for Vector Quantizer Design.** *IEEE Signal Processing Letters*, v. 4, n. 1, pp. 2-4, 1997.
- [LEITÃO, H. A. S.](http://lattes.cnpq.br/3459487526437474) ; [LOPES, W. T. A.](http://lattes.cnpq.br/5041048659000127) ; MADEIRO, F. **PSO Algorithm Applied to Codebook Design for Channel-Optimized Vector Quantization.** *IEEE Latin America Transactions*, v. 13, p. 961-967, 2015.
- [LIMA, V. S.](http://lattes.cnpq.br/6653682115715369); [FERREIRA, F. A. B. S.](http://lattes.cnpq.br/9939255113143786); CALAZANS, R. S. H.; NASCIMENTO, A. R. T.; MADEIRO, F. **On the Initialization of Swarm Intelligence Algorithms for Vector Quantization Codebook Design.** *Sensors*, v. 24, p. 2606, 2024.
- MADEIRO, F.; FECHINE, J. M.; LOPES, W. T. A.; AGUIAR NETO, B. G.; ALENCAR, M. S. **Identificação Vocal por Frequência Fundamental, QV e HMMS.** In: *Em-TOM-Ação: A Prosódia em Perspectiva*, Org: M. A. M. Aguiar and F. Madeiro, cap. 4, pp. 91–120. Editora Universitária da UFPE, Recife, PE, 2007.
- PALIWAL, K. K.; RAMASUBRAMANIAN, V. **Comments on “Modified K-means Algorithm for Vector Quantizer Design”.** *IEEE Transactions on Image Processing*, v. 9, n. 11, pp. 1964-1967, 2000.
- PRAMUDYA, R. I. et al. **Advancing Unsupervised Clustering: A Systematic Review of Hybrid K-means and Metaheuristic Optimization Algorithms in Data Mining.** *Computer Science Review*, v. 61, 2026.
- RAHEBI, J. **Vector Quantization Using Whale Optimization Algorithm for Digital Image Compression.** *Multimedia Tools and Applications*, v. 81, pp. 20077–20103, 2022.

---

## 14. Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Consulte o arquivo de licença para mais informações.