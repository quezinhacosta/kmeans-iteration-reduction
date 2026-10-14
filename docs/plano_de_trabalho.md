# Plano de Trabalho PIBIC

## 4.1 Título do Plano de Trabalho
**ESTUDO E AVALIAÇÃO DE TÉCNICAS DE REDUÇÃO DO NÚMERO DE ITERAÇÕES DO ALGORITMO K-MEANS**

---

## 4.2 Objetivos

### 4.2.1 Objetivo Geral
Estudar, implementar e avaliar o desempenho de técnicas de redução do número de iterações do algoritmo k-means.

### 4.2.2 Objetivos Específicos
- Avaliar o desempenho de ao menos duas técnicas de redução do número de iterações do algoritmo k-means, em que a etapa de particionamento é realizada com o uso da **distância euclidiana quadrática**.
- Aplicar e avaliar a abordagem supracitada em ao menos uma aplicação envolvendo particionamento de dados (*clustering*).

---

## Palavras-Chave
1. Inteligência artificial
2. Aprendizagem não-supervisionada
3. Agrupamento de dados

---

## 4.3 Justificativa
Uma aplicação típica do algoritmo k-means é o particionamento de dados (*clustering*). Esse é um terreno em que o algoritmo é muito popular e amplamente utilizado, como atestam aplicações em diversas áreas, dentre as quais:
- Processamento, armazenamento e transmissão digital da informação (LIMA et al., 2024; FONSECA; FERREIRA; MADEIRO, 2018; FERREIRA et al., 2017; LEITÃO; LOPES; MADEIRO, 2015; CALAZANS et al., 2019; KAVITHA et al., 2022; BILAL; ULLAH; ISLAM, 2021; RAHEBI, 2022);
- Segmentação de imagens digitais, como por exemplo da área de odontologia (CALAZANS; ALCOFORADO; MADEIRO, 2023);
- Mineração de dados (PRAMUDYA et al., 2026);
- Sistemas de reconhecimento de padrões, tais como identificação vocal (MADEIRO et al., 2007) e classificação de diabetes (JANNOUD et al., 2024).

Diversas aplicações do algoritmo k-means envolvem grandes conjuntos de dados, razão pela qual o alvo deste projeto é **reduzir o tempo de execução do algoritmo k-means, por meio da redução de número de iterações do algoritmo**. Para este propósito, serão utilizadas técnicas da literatura de processamento digital de sinais e imagens, e. g. (LEE; BAEK; SUNG, 1997; PALIWAL; RAMASUBRAMANIAN, 2000).

---

## 4.4 Metodologia
O plano de trabalho será executado nas seguintes etapas:
1. Pesquisa bibliográfica.
2. Estudo de fundamentos de aprendizagem não-supervisionada, com ênfase no algoritmo k-means.
3. Estudo de fundamentos de agrupamento de dados (*clustering*).
4. Estudo de técnicas de redução do número de iterações do algoritmo k-means.
5. Implementação de ao menos duas técnicas de redução do número de iterações do algoritmo k-means, avaliado em ao menos uma aplicação envolvendo *clustering*.

### Fontes de Pesquisa Bibliográfica
- Bases de dados: **ScienceDirect (Elsevier)**, **IEEE Xplore**, **Springer**.
- Portal de Periódicos da **CAPES**.
- Strings de busca com uso de operadores booleanos (`AND`, `OR`, `NOT`).

### Diretrizes de Implementação e Acompanhamento
- A implementação do algoritmo k-means poderá ser feita em qualquer linguagem de programação (adotou-se **Python 3** pela maturidade científica).
- Reuniões periódicas para acompanhamento da execução do plano de trabalho.

---

## Cronograma de Atividades

| Atividade | Descrição | AGO | SET | OUT | NOV | DEZ | JAN | FEV | MAR | ABR | MAI | JUN | JUL |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | Pesquisa bibliográfica | X | X | X | X | X | X | X | X | X | X | | |
| **2** | Estudo de fundamentos de aprendizagem, com ênfase no k-means | X | X | X | X | | | | | | | | |
| **3** | Estudo de fundamentos de agrupamento de dados (*clustering*) | | | X | X | | | | | | | | |
| **4** | Estudo de técnicas de redução do número de iterações do k-means | | | | X | X | X | | | | | | |
| **5** | Implementação de técnicas de redução e avaliação em aplicação | | | | | | | X | X | X | X | X | X |

