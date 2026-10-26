# K-Means Sem Medo 🌸

> **Guia Definitivo, Interativo e Visual para o Estudo do Algoritmo K-Means e Técnicas de Redução de Iterações.**  
> Desenvolvido no âmbito do projeto de Iniciação Científica (PIBIC).

---

## 📖 Visão Geral

Inspirado na proposta didática e acessível do repositório [MIPS Sem Medo](https://github.com/Pimenta15/mips-sem-medo), o **K-Means Sem Medo** foi construído para desmistificar o algoritmo de agrupamento (*clustering*) mais popular do aprendizado não-supervisionado.

Com uma identidade visual moderna em **tons de rosa e preto** (*cyber-academic aesthetic*), esta aplicação web interativa reúne:
1. **Intuição Geométrica & Teoria Formal**: Da partição de Voronoi à descida por coordenadas da função objetivo.
2. **Exemplo Numérico Passo a Passo (DevMedia #4584)**: Cálculo manual das distâncias e novas médias, reproduzindo com fidelidade a consagrada referência de Data Mining em língua portuguesa.
3. **Playground 2D com Animação em Tempo Real**: Adicione pontos com o mouse, visualize o rastro dos centróides, células de Voronoi e a curva de convergência de inércia (SSE).
4. **Armadilhas e Limitações (Google Machine Learning)**: Por que o K-Means falha com meias-luas ou anéis concêntricos e como contornar essas falhas.
5. **Critérios de Seleção de K**: Método do Cotovelo (*Elbow Method*) e Coeficiente de Silhueta (*Silhouette Score*).
6. **O Projeto PIBIC em Ação**:
   - Métrica de **Distância Euclidiana Quadrática** ($d^2$), demonstrando a eliminação da raiz quadrada para economia de ciclos de CPU.
   - **Modified K-Means** (Lee et al., 1997; Paliwal & Ramasubramanian, 2000): Rastreamento de centróides ativos.
   - **Fast Codebook Generation** (Bilal et al., 2021; Calazans et al., 2019; Lima et al., 2024): Dispersão estratégica preliminar.
7. **Simulador de Quantização Vetorial de Imagens**: Aplicação direta do PIBIC para compressão de imagens em tempo real no navegador, calculando métricas PSNR e MSE.
8. **Quiz do Pesquisador**: 6 questões interativas de nível acadêmico com explicações imediatas.

---

## 🚀 Como Executar

A interface foi projetada com padrões web modernos (HTML5, CSS3, ES6 Modules e Canvas 2D) de forma **100% autônoma**, sem depender de frameworks pesados ou bibliotecas de CDN que possam quebrar offline.

### Opção 1: Via Servidor Python Integrado (Recomendado)

O repositório já inclui um servidor leve (`interface/server.py`) que disponibiliza a interface e a conecta diretamente aos algoritmos Python de `src/kmeans_reduction`:

```bash
# Na raiz do repositório:
python3 interface/server.py 8000
```

Abra o seu navegador e acesse:
```
http://localhost:8000
```

### Opção 2: Servidor HTTP Simples do Python

```bash
python3 -m http.server 8000 --directory interface
```

### Opção 3: Abrir Diretamente no Navegador

Basta dar um duplo clique ou abrir o arquivo `interface/index.html` em qualquer navegador moderno (Chrome, Firefox, Safari, Edge).

---

## 🎨 Paleta de Cores e Identidade Visual

O design system baseia-se em alto contraste e elegância:
- **Preto e Void Grafite**: `#060609`, `#0b0b12`, `#12121c`
- **Rosa Neon Elétrico**: `#ff2a85`, `#ff479c`, `#ffa3cf`
- **Acentos Funcionais**: Ciano (`#06b6d4`), Roxo (`#a855f7`), Esmeralda (`#10b981`), Âmbar (`#f59e0b`)

---

## 📂 Estrutura de Arquivos

```
interface/
├── index.html                   # Estrutura HTML5 com todas as seções e módulos
├── server.py                    # Servidor web local com integração à API Python
├── README.md                    # Este documento
├── css/
│   ├── theme.css                # Variáveis, paleta rosa/preto e tipografia
│   ├── layout.css               # Header fixo, sidebar responsiva e grids
│   ├── components.css           # Cards, botões neon, tabelas e quiz
│   └── visualizer.css           # Estilos do canvas 2D, controles e HUD
└── js/
    ├── app.js                   # Bootstrap, roteador de abas e atalhos
    ├── kmeans-engine.js         # Motor matemático (Lloyd, K-Means++, Fast Codebook)
    ├── canvas-visualizer.js     # Visualizador interativo 2D com animação
    ├── chart-engine.js          # Motor autônomo de gráficos em Canvas (SSE, Cotovelo)
    ├── devmedia-calculator.js   # Calculadora didática com matriz de distâncias aberta
    ├── elbow-silhouette.js      # Análise do cotovelo e coeficiente de silhueta
    ├── image-vq.js              # Quantização vetorial de imagens (PSNR / MSE)
    ├── pibic-benchmark.js       # Comparativo empírico das técnicas do PIBIC
    ├── formulas.js              # Demonstrações matemáticas e provas formais
    └── quiz-engine.js           # Quiz interativo com feedback pedagógico
```

---

## ⌨️ Atalhos de Teclado no Playground

- <kbd>Espaço</kbd>: Iniciar / Pausar animação do K-Means
- <kbd>S</kbd>: Avançar uma iteração (Passo a Passo)
- <kbd>R</kbd>: Reiniciar o particionamento com os centróides iniciais
- **Clique Esquerdo**: Adiciona uma nova amostra ao plano 2D
- **Clique Direito**: Remove amostras próximas ao cursor

---

## 📚 Referências Principais

1. **DevMedia:** [Data Mining na Prática: Algoritmo K-Means](https://www.devmedia.com.br/data-mining-na-pratica-algoritmo-k-means/4584)
2. **Google Developers:** [Clustering with K-Means Overview](https://developers.google.com/machine-learning/clustering/kmeans/overview?hl=pt-br)
3. **BILAL, M.; ULLAH, Z.; ISLAM, I. U.** Fast Codebook Generation Using Pattern Based Masking Algorithm for Image Compression. *IEEE Access*, 2021.
4. **LEE, D.; BAEK, S.; SUNG, K.** Modified K-means Algorithm for Vector Quantizer Design. *IEEE Signal Processing Letters*, 1997.
5. **PALIWAL, K. K.; RAMASUBRAMANIAN, V.** Comments on "Modified K-means Algorithm for Vector Quantizer Design". *IEEE TIP*, 2000.
6. **CALAZANS, M. A. A.; ALCOFORADO, M. L. M. G.; MADEIRO, F.** Técnicas de Inteligência Computacional Aplicadas à Segmentação e ao Diagnóstico de Imagens Odontológicas. *CBIC*, 2023.

