/**
 * ============================================================================
 * K-MEANS SEM MEDO - MOTOR MATEMÁTICO & ALGORITMOS (KMEANS ENGINE)
 * ============================================================================
 * Implementação pura em JavaScript de alto rigor acadêmico para o PIBIC:
 * - Algoritmo K-Means Tradicional (Lloyd)
 * - Distância Euclidiana e Euclidiana Quadrática
 * - Inicializações: Aleatória, K-Means++ e Fast Codebook (Bilal et al., 2021)
 * - Técnica de Redução: Modified K-Means (Lee et al., 1997; Paliwal, 2000)
 * - Métricas: SSE (Inércia), Coeficiente de Silhueta, Deslocamento dos Centróides
 * ============================================================================
 */

export const PALETTE = [
  '#ff2a85', // 0: Rosa Neon Principal
  '#06b6d4', // 1: Ciano Elétrico
  '#a855f7', // 2: Roxo Cibernético
  '#f59e0b', // 3: Âmbar Vibrante
  '#10b981', // 4: Esmeralda
  '#38bdf8', // 5: Azul Claro
  '#ec4899', // 6: Rosa Magenta
  '#fbbf24', // 7: Dourado Neon
];

/**
 * Distância Euclidiana Quadrática: d^2(p, q) = sum((p_i - q_i)^2)
 * Métrica obrigatória do plano de trabalho PIBIC: elimina raiz quadrada!
 */
export function squaredEuclidean(p1, p2) {
  let sum = 0;
  for (let i = 0; i < p1.length; i++) {
    const diff = p1[i] - p2[i];
    sum += diff * diff;
  }
  return sum;
}

/**
 * Distância Euclidiana Padrão: sqrt(sum((p_i - q_i)^2))
 */
export function euclidean(p1, p2) {
  return Math.sqrt(squaredEuclidean(p1, p2));
}

/**
 * Gerador de números pseudo-aleatórios com semente (LCG simples para reprodutibilidade)
 */
export class SeededRandom {
  constructor(seed = 42) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

/**
 * Inicialização 1: Aleatória Clássica (amostragem uniforme do conjunto de dados)
 */
export function initRandomCentroids(X, k, rng = null) {
  const randomFunc = rng ? () => rng.next() : Math.random;
  const n = X.length;
  if (n < k) throw new Error(`Número de amostras (${n}) menor que K (${k})`);

  const indices = new Set();
  while (indices.size < k) {
    const idx = Math.floor(randomFunc() * n);
    indices.add(idx);
  }

  return Array.from(indices).map(idx => [...X[idx]]);
}

/**
 * Inicialização 2: K-Means++ (Arthur & Vassilvitskii, 2007)
 * Seleciona o 1º centróide aleatoriamente e os subsequentes com probabilidade
 * proporcional ao quadrado da distância D(x)^2 ao centróide mais próximo já escolhido.
 */
export function initKMeansPlusPlus(X, k, rng = null) {
  const randomFunc = rng ? () => rng.next() : Math.random;
  const n = X.length;
  if (n < k) throw new Error(`Número de amostras (${n}) menor que K (${k})`);

  // 1. Escolhe o primeiro centro uniformemente ao acaso
  const centroids = [];
  const firstIdx = Math.floor(randomFunc() * n);
  centroids.push([...X[firstIdx]]);

  // 2. Escolhe os k-1 centros restantes
  while (centroids.length < k) {
    const distSq = new Float64Array(n);
    let sumDistSq = 0;

    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = squaredEuclidean(X[i], centroids[c]);
        if (d < minDist) minDist = d;
      }
      distSq[i] = minDist;
      sumDistSq += minDist;
    }

    if (sumDistSq === 0) {
      // Se todos os pontos restantes coincidem com os centróides já escolhidos
      const fallbackIdx = Math.floor(randomFunc() * n);
      centroids.push([...X[fallbackIdx]]);
      continue;
    }

    // Roleta ponderada por probabilidade D(x)^2
    const target = randomFunc() * sumDistSq;
    let accum = 0;
    let chosenIdx = n - 1;

    for (let i = 0; i < n; i++) {
      accum += distSq[i];
      if (accum >= target) {
        chosenIdx = i;
        break;
      }
    }

    centroids.push([...X[chosenIdx]]);
  }

  return centroids;
}

/**
 * Inicialização 3: Fast Codebook / Pattern Spread (Bilal et al., 2021; Lima et al., 2024)
 * Técnica central do PIBIC: espalhamento max-min determinístico que maximiza a dispersão
 * inicial no espaço das características, minimizando iterações subsequentes de Lloyd.
 */
export function initFastCodebook(X, k) {
  const n = X.length;
  if (n < k) throw new Error(`Número de amostras (${n}) menor que K (${k})`);

  const d = X[0].length;
  // 1. Calcula o centróide global (média de todo o conjunto de dados)
  const globalMean = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      globalMean[j] += X[i][j];
    }
  }
  for (let j = 0; j < d; j++) {
    globalMean[j] /= n;
  }

  // 2. Primeiro centróide: ponto mais distante da média global (padrão extremo)
  let maxDist = -1;
  let firstIdx = 0;
  for (let i = 0; i < n; i++) {
    const dist = squaredEuclidean(X[i], globalMean);
    if (dist > maxDist) {
      maxDist = dist;
      firstIdx = i;
    }
  }

  const centroids = [[...X[firstIdx]]];

  // 3. Escolhe os k-1 centróides restantes via critério minimax:
  // ponto cuja distância mínima para os centróides já escolhidos é máxima
  while (centroids.length < k) {
    let bestIdx = 0;
    let maxMinDist = -1;

    for (let i = 0; i < n; i++) {
      let minDistToCentroids = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const dist = squaredEuclidean(X[i], centroids[c]);
        if (dist < minDistToCentroids) {
          minDistToCentroids = dist;
        }
      }

      if (minDistToCentroids > maxMinDist) {
        maxMinDist = minDistToCentroids;
        bestIdx = i;
      }
    }

    centroids.push([...X[bestIdx]]);
  }

  return centroids;
}

/**
 * Atribuição de clusters com medição de cálculos de distância
 */
export function assignPoints(X, centroids, metric = squaredEuclidean) {
  const n = X.length;
  const k = centroids.length;
  const assignments = new Int32Array(n);
  const minDists = new Float64Array(n);
  let distCalculations = 0;

  for (let i = 0; i < n; i++) {
    let minDist = Infinity;
    let bestCluster = 0;

    for (let c = 0; c < k; c++) {
      const d = metric(X[i], centroids[c]);
      distCalculations++;
      if (d < minDist) {
        minDist = d;
        bestCluster = c;
      }
    }

    assignments[i] = bestCluster;
    minDists[i] = minDist;
  }

  return { assignments, minDists, distCalculations };
}

/**
 * Atualização dos Centróides (Média aritmética dos membros de cada cluster)
 */
export function updateCentroids(X, assignments, k, oldCentroids) {
  const d = X[0].length;
  const counts = new Int32Array(k);
  const sums = Array.from({ length: k }, () => new Float64Array(d));

  for (let i = 0; i < X.length; i++) {
    const c = assignments[i];
    counts[c]++;
    for (let j = 0; j < d; j++) {
      sums[c][j] += X[i][j];
    }
  }

  const newCentroids = [];
  const shifts = new Float64Array(k);
  let maxShift = 0;

  for (let c = 0; c < k; c++) {
    if (counts[c] > 0) {
      const newPos = [];
      for (let j = 0; j < d; j++) {
        newPos.push(sums[c][j] / counts[c]);
      }
      newCentroids.push(newPos);
    } else {
      // Cluster vazio: preserva a posição anterior
      newCentroids.push([...oldCentroids[c]]);
    }

    const shift = squaredEuclidean(oldCentroids[c], newCentroids[c]);
    shifts[c] = shift;
    if (shift > maxShift) maxShift = shift;
  }

  return { newCentroids, shifts, maxShift, counts };
}

/**
 * Cálculo da Inércia / SSE (Sum of Squared Errors)
 */
export function calculateSSE(X, centroids, assignments) {
  let sse = 0;
  for (let i = 0; i < X.length; i++) {
    const c = assignments[i];
    sse += squaredEuclidean(X[i], centroids[c]);
  }
  return sse;
}

/**
 * Cálculo aproximado do Coeficiente de Silhueta médio
 */
export function calculateSilhouetteScore(X, assignments, k) {
  if (k < 2 || k >= X.length) return 0;
  const n = X.length;

  // Se n for muito grande, amostramos até 250 pontos para manter a UI responsiva
  const sampleIndices = [];
  const maxSamples = Math.min(n, 200);
  const step = Math.max(1, Math.floor(n / maxSamples));
  for (let i = 0; i < n; i += step) {
    sampleIndices.push(i);
  }

  let totalScore = 0;
  let validPoints = 0;

  for (const i of sampleIndices) {
    const myCluster = assignments[i];

    // Calcula distância média intra-cluster a(i)
    let aSum = 0;
    let aCount = 0;

    // Distâncias médias para os outros clusters
    const bSums = new Float64Array(k);
    const bCounts = new Int32Array(k);

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = euclidean(X[i], X[j]);
      const otherCluster = assignments[j];

      if (otherCluster === myCluster) {
        aSum += d;
        aCount++;
      } else {
        bSums[otherCluster] += d;
        bCounts[otherCluster]++;
      }
    }

    if (aCount === 0) continue; // cluster com 1 único ponto

    const a_i = aSum / aCount;

    let b_i = Infinity;
    for (let c = 0; c < k; c++) {
      if (c !== myCluster && bCounts[c] > 0) {
        const meanDist = bSums[c] / bCounts[c];
        if (meanDist < b_i) b_i = meanDist;
      }
    }

    if (!isFinite(b_i)) continue;

    const s_i = (b_i - a_i) / Math.max(a_i, b_i);
    totalScore += s_i;
    validPoints++;
  }

  return validPoints > 0 ? (totalScore / validPoints) : 0;
}

/**
 * Classe de Execução Interativa Passo a Passo do K-Means (Visualizer Controller)
 */
export class KMeansSession {
  constructor(X, config = {}) {
    this.X = X;
    this.k = config.k || 3;
    this.maxIter = config.maxIter || 100;
    this.tol = config.tol || 1e-4;
    this.initMethod = config.initMethod || 'kmeans++'; // 'random', 'kmeans++', 'fast_codebook', 'manual'
    this.algorithm = config.algorithm || 'standard'; // 'standard', 'modified'
    this.activityThreshold = config.activityThreshold || 1e-3;
    this.metric = config.metric || squaredEuclidean;
    this.manualCentroids = config.manualCentroids || null;

    this.iteration = 0;
    this.converged = false;
    this.centroids = [];
    this.trajectory = []; // Histórico de posições de cada centróide
    this.assignments = new Int32Array(X.length);
    this.history = []; // Snapshots de cada iteração para voltar atrás
    this.sseHistory = [];
    this.totalDistanceCalculations = 0;
    this.lastMaxShift = Infinity;

    this.init();
  }

  init() {
    this.iteration = 0;
    this.converged = false;
    this.trajectory = [];
    this.history = [];
    this.sseHistory = [];
    this.totalDistanceCalculations = 0;

    if (this.initMethod === 'manual' && this.manualCentroids && this.manualCentroids.length === this.k) {
      this.centroids = this.manualCentroids.map(c => [...c]);
    } else if (this.initMethod === 'random') {
      this.centroids = initRandomCentroids(this.X, this.k);
    } else if (this.initMethod === 'fast_codebook') {
      this.centroids = initFastCodebook(this.X, this.k);
    } else {
      this.centroids = initKMeansPlusPlus(this.X, this.k);
    }

    // Inicializa a trajetória com os centróides iniciais
    this.trajectory.push(this.centroids.map(c => [...c]));

    // Primeira atribuição
    const { assignments, minDists, distCalculations } = assignPoints(this.X, this.centroids, this.metric);
    this.assignments = assignments;
    this.totalDistanceCalculations += distCalculations;

    const sse = calculateSSE(this.X, this.centroids, this.assignments);
    this.sseHistory.push(sse);

    this.saveSnapshot("Inicialização dos Centróides");
  }

  step() {
    if (this.converged || this.iteration >= this.maxIter) return false;

    this.iteration++;

    // 1. Atualiza Centróides (M-Step)
    const { newCentroids, shifts, maxShift, counts } = updateCentroids(this.X, this.assignments, this.k, this.centroids);
    this.lastMaxShift = maxShift;
    this.centroids = newCentroids;
    this.trajectory.push(this.centroids.map(c => [...c]));

    // 2. Verifica Convergência
    if (maxShift <= this.tol) {
      this.converged = true;
      const finalSSE = calculateSSE(this.X, this.centroids, this.assignments);
      this.sseHistory.push(finalSSE);
      this.saveSnapshot(`Convergência Atingida na Iteração ${this.iteration}`);
      return false;
    }

    // 3. Atribui Pontos (E-Step)
    if (this.algorithm === 'modified') {
      // Técnica 1: Modified K-Means (Lee 1997 / Paliwal 2000)
      // Se centróides ativos se moveram pouco, podemos economizar cálculos
      let distCalcs = 0;
      for (let i = 0; i < this.X.length; i++) {
        const oldCluster = this.assignments[i];
        // Se o cluster antigo se moveu menos que o limiar de atividade, verifica primeiro se permanece
        if (shifts[oldCluster] < this.activityThreshold) {
          const currentDist = this.metric(this.X[i], this.centroids[oldCluster]);
          distCalcs++;
          let bestC = oldCluster;
          let minD = currentDist;

          // Testa apenas outros centróides que se moveram significativamente
          for (let c = 0; c < this.k; c++) {
            if (c !== oldCluster && shifts[c] >= this.activityThreshold) {
              const d = this.metric(this.X[i], this.centroids[c]);
              distCalcs++;
              if (d < minD) {
                minD = d;
                bestC = c;
              }
            }
          }
          this.assignments[i] = bestC;
        } else {
          // Centróide antigo mudou muito: calcula todas as distâncias normalmente
          let minD = Infinity;
          let bestC = 0;
          for (let c = 0; c < this.k; c++) {
            const d = this.metric(this.X[i], this.centroids[c]);
            distCalcs++;
            if (d < minD) {
              minD = d;
              bestC = c;
            }
          }
          this.assignments[i] = bestC;
        }
      }
      this.totalDistanceCalculations += distCalcs;
    } else {
      // Standard Lloyd
      const { assignments, distCalculations } = assignPoints(this.X, this.centroids, this.metric);
      this.assignments = assignments;
      this.totalDistanceCalculations += distCalculations;
    }

    // Calcula novo SSE
    const sse = calculateSSE(this.X, this.centroids, this.assignments);
    this.sseHistory.push(sse);

    this.saveSnapshot(`Iteração ${this.iteration}`);
    return true;
  }

  saveSnapshot(label) {
    this.history.push({
      iteration: this.iteration,
      centroids: this.centroids.map(c => [...c]),
      assignments: new Int32Array(this.assignments),
      sse: this.sseHistory[this.sseHistory.length - 1],
      maxShift: this.lastMaxShift,
      label
    });
  }

  runToConvergence() {
    while (!this.converged && this.iteration < this.maxIter) {
      this.step();
    }
    return {
      iterations: this.iteration,
      converged: this.converged,
      finalSSE: this.sseHistory[this.sseHistory.length - 1],
      distanceCalculations: this.totalDistanceCalculations,
      centroids: this.centroids
    };
  }
}

/**
 * ============================================================================
 * GERADORES DE CONJUNTOS DE DADOS DIDÁTICOS (PRESETS)
 * ============================================================================
 */

export function generateBlobs(n = 300, k = 3, spread = 0.08) {
  const points = [];
  const centers = [
    [0.25, 0.25],
    [0.75, 0.3],
    [0.5, 0.75],
    [0.2, 0.8],
    [0.8, 0.75],
    [0.5, 0.45]
  ];

  const actualCenters = centers.slice(0, k);
  const perCluster = Math.floor(n / k);

  for (let c = 0; c < k; c++) {
    const [cx, cy] = actualCenters[c];
    const count = (c === k - 1) ? (n - points.length) : perCluster;

    for (let i = 0; i < count; i++) {
      // Box-Muller para distribuição normal
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

      const x = Math.min(0.98, Math.max(0.02, cx + z0 * spread));
      const y = Math.min(0.98, Math.max(0.02, cy + z1 * spread));
      points.push([x, y]);
    }
  }

  return points;
}

export function generateMoons(n = 300, noise = 0.04) {
  const points = [];
  const half = Math.floor(n / 2);

  // Lua superior
  for (let i = 0; i < half; i++) {
    const angle = (i / half) * Math.PI;
    const r = 0.3;
    const x = 0.4 + r * Math.cos(angle) + (Math.random() - 0.5) * noise * 2;
    const y = 0.65 - r * Math.sin(angle) + (Math.random() - 0.5) * noise * 2;
    points.push([x, y]);
  }

  // Lua inferior invertida
  for (let i = 0; i < n - half; i++) {
    const angle = (i / (n - half)) * Math.PI;
    const r = 0.3;
    const x = 0.6 - r * Math.cos(angle) + (Math.random() - 0.5) * noise * 2;
    const y = 0.35 + r * Math.sin(angle) + (Math.random() - 0.5) * noise * 2;
    points.push([x, y]);
  }

  return points;
}

export function generateCircles(n = 300, noise = 0.03) {
  const points = [];
  const innerCount = Math.floor(n * 0.4);
  const outerCount = n - innerCount;

  // Círculo interno
  for (let i = 0; i < innerCount; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r = 0.12 + Math.random() * 0.06;
    const x = 0.5 + r * Math.cos(angle) + (Math.random() - 0.5) * noise;
    const y = 0.5 + r * Math.sin(angle) + (Math.random() - 0.5) * noise;
    points.push([x, y]);
  }

  // Anel externo
  for (let i = 0; i < outerCount; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r = 0.35 + (Math.random() - 0.5) * 0.08;
    const x = 0.5 + r * Math.cos(angle) + (Math.random() - 0.5) * noise;
    const y = 0.5 + r * Math.sin(angle) + (Math.random() - 0.5) * noise;
    points.push([x, y]);
  }

  return points;
}

export function generateDevMediaDataset() {
  // Dados normalizados do clássico exemplo numérico DevMedia
  // A=(1,1), B=(2,1), C=(4,3), D=(5,4), E=(1,2), F=(4,4)
  // Mapeados no canvas de [0, 1]
  const raw = [
    { name: "A", x: 1, y: 1 },
    { name: "B", x: 2, y: 1 },
    { name: "C", x: 4, y: 3 },
    { name: "D", x: 5, y: 4 },
    { name: "E", x: 1, y: 2 },
    { name: "F", x: 4, y: 4 },
  ];

  return raw.map(p => [(p.x) / 6.0, (p.y) / 6.0]);
}

export function generateUniformNoise(n = 200) {
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push([Math.random() * 0.9 + 0.05, Math.random() * 0.9 + 0.05]);
  }
  return points;
}

