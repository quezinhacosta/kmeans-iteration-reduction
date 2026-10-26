/**
 * ============================================================================
 * K-MEANS SEM MEDO - BENCHMARK PIBIC DE REDUÇÃO DE ITERAÇÕES
 * ============================================================================
 * Comparação rigorosa entre:
 * 1. Linha de Base (Standard Lloyd K-Means)
 * 2. Técnica 1: Modified K-Means (Lee 1997 / Paliwal 2000)
 * 3. Técnica 2: Fast Codebook Pattern Masking (Bilal 2021 / Lima 2024)
 * ============================================================================
 */

import {
  KMeansSession,
  generateBlobs,
  squaredEuclidean
} from './kmeans-engine.js';

export class PIBICBenchmarkTool {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.points = generateBlobs(350, 4, 0.08);
    this.k = 4;
    this.results = null;

    this.render();
  }

  runBenchmark() {
    const k = this.k;
    const X = this.points;

    // 1. Linha de Base: Standard Lloyd
    const t0 = performance.now();
    const sessionStd = new KMeansSession(X, {
      k,
      initMethod: 'random',
      algorithm: 'standard',
      metric: squaredEuclidean
    });
    const resStd = sessionStd.runToConvergence();
    const timeStd = performance.now() - t0;

    // 2. Técnica 1: Modified K-Means (Lee 1997 / Paliwal 2000)
    const t1 = performance.now();
    const sessionMod = new KMeansSession(X, {
      k,
      initMethod: 'random',
      algorithm: 'modified',
      activityThreshold: 1e-3,
      metric: squaredEuclidean
    });
    const resMod = sessionMod.runToConvergence();
    const timeMod = performance.now() - t1;

    // 3. Técnica 2: Fast Codebook (Bilal 2021 / Lima 2024)
    const t2 = performance.now();
    const sessionFast = new KMeansSession(X, {
      k,
      initMethod: 'fast_codebook',
      algorithm: 'standard',
      metric: squaredEuclidean
    });
    const resFast = sessionFast.runToConvergence();
    const timeFast = performance.now() - t2;

    this.results = {
      standard: {
        name: 'Standard K-Means (Lloyd)',
        iterations: resStd.iterations,
        calcs: resStd.distanceCalculations,
        sse: resStd.finalSSE,
        time: Math.max(0.2, timeStd)
      },
      modified: {
        name: 'Modified K-Means (Lee / Paliwal)',
        iterations: resMod.iterations,
        calcs: resMod.distanceCalculations,
        sse: resMod.finalSSE,
        time: Math.max(0.2, timeMod)
      },
      fast: {
        name: 'Fast Codebook (Bilal / Lima)',
        iterations: resFast.iterations,
        calcs: resFast.distanceCalculations,
        sse: resFast.finalSSE,
        time: Math.max(0.2, timeFast)
      }
    };

    this.render();
  }

  render() {
    if (!this.container) return;

    if (!this.results) {
      this.container.innerHTML = `
        <div class="card card-highlight">
          <div class="card-header">
            <div>
              <h3 class="card-title"><span class="icon">⚡</span> Laboratório Comparativo PIBIC</h3>
              <p class="card-subtitle">Avaliação das técnicas de redução de iterações em tempo real no navegador</p>
            </div>
            <button id="btnRunPIBICBenchmark" class="btn btn-primary">
              🚀 Executar Benchmark Comparativo
            </button>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Clique no botão acima para submeter o mesmo conjunto de 350 amostras às 3 técnicas do plano de trabalho PIBIC e comparar número de iterações, cálculos de distância e qualidade final do particionamento.
          </p>
        </div>
      `;
      const btn = document.getElementById('btnRunPIBICBenchmark');
      if (btn) btn.onclick = () => this.runBenchmark();
      return;
    }

    const { standard, modified, fast } = this.results;

    // Cálculos de Redução Percentual
    const iterReductionMod = Math.round(((standard.iterations - modified.iterations) / standard.iterations) * 100);
    const iterReductionFast = Math.round(((standard.iterations - fast.iterations) / standard.iterations) * 100);
    const calcsReductionMod = Math.round(((standard.calcs - modified.calcs) / standard.calcs) * 100);

    this.container.innerHTML = `
      <div class="card card-highlight">
        <div class="card-header">
          <div>
            <h3 class="card-title"><span class="icon">⚡</span> Resultados do Benchmark PIBIC</h3>
            <p class="card-subtitle">Comparativo direto com distância euclidiana quadrática (N = ${this.points.length}, K = ${this.k})</p>
          </div>
          <button id="btnReRunPIBICBenchmark" class="btn btn-secondary btn-sm">
            ↺ Rodar Novamente
          </button>
        </div>

        <!-- Grid de Métricas Principais -->
        <div class="grid-3" style="margin-bottom: 1.5rem;">
          <!-- Linha de Base -->
          <div class="stat-card">
            <span class="stat-label">1. Linha de Base (Lloyd)</span>
            <div style="font-size: 1.35rem; font-weight: 800; color: #ffffff; margin: 0.3rem 0;">
              ${standard.iterations} iterações
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              Cálculos d²: <strong>${standard.calcs}</strong><br>
              Inércia SSE: <strong>${standard.sse.toFixed(2)}</strong>
            </span>
          </div>

          <!-- Técnica 1: Modified K-Means -->
          <div class="stat-card" style="border-color: rgba(6, 182, 212, 0.4);">
            <span class="stat-label" style="color: #06b6d4;">2. Modified K-Means (Técnica 1)</span>
            <div style="font-size: 1.35rem; font-weight: 800; color: #06b6d4; margin: 0.3rem 0;">
              ${modified.iterations} iterações
            </div>
            <span style="font-size: 0.78rem; color: #a5f3fc;">
              Economia de cálculos: <strong>${calcsReductionMod > 0 ? `-${calcsReductionMod}%` : '0%'}</strong><br>
              Inércia SSE: <strong>${modified.sse.toFixed(2)}</strong>
            </span>
          </div>

          <!-- Técnica 2: Fast Codebook -->
          <div class="stat-card" style="border-color: var(--pink-border-active); box-shadow: 0 0 15px rgba(255,42,133,0.2);">
            <span class="stat-label" style="color: var(--pink-bright);">3. Fast Codebook (Técnica 2)</span>
            <div style="font-size: 1.35rem; font-weight: 800; color: var(--pink-bright); margin: 0.3rem 0;">
              ${fast.iterations} iterações
            </div>
            <span style="font-size: 0.78rem; color: var(--pink-soft);">
              Redução de iterações: <strong>${iterReductionFast > 0 ? `-${iterReductionFast}%` : '0%'}</strong><br>
              Inércia SSE: <strong>${fast.sse.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        <!-- Tabela Comparativa Detalhada -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Algoritmo / Abordagem</th>
                <th>Estratégia Central</th>
                <th>Iterações</th>
                <th>Cálculos de Distância</th>
                <th>Inércia SSE</th>
                <th>Impacto no PIBIC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Standard K-Means</strong></td>
                <td>Lloyd tradicional com sementes aleatórias</td>
                <td><code>${standard.iterations}</code></td>
                <td><code>${standard.calcs}</code></td>
                <td><code>${standard.sse.toFixed(2)}</code></td>
                <td><span style="color: var(--text-muted);">Linha de base de comparação</span></td>
              </tr>
              <tr>
                <td style="color: #06b6d4;"><strong>Modified K-Means</strong></td>
                <td>Rastreamento de centróides ativos (Lee & Paliwal)</td>
                <td><code>${modified.iterations}</code></td>
                <td><strong style="color: #06b6d4;">${modified.calcs}</strong></td>
                <td><code>${modified.sse.toFixed(2)}</code></td>
                <td><span class="badge-pibic" style="color: #06b6d4; border-color: #06b6d4; background: rgba(6,182,212,0.15);">Poupe cálculos em clusters estáveis</span></td>
              </tr>
              <tr>
                <td style="color: var(--pink-bright);"><strong>Fast Codebook (Pattern Spread)</strong></td>
                <td>Dispersão preliminar de padrões (Bilal / Lima)</td>
                <td><strong style="color: var(--pink-bright);">${fast.iterations}</strong></td>
                <td><code>${fast.calcs}</code></td>
                <td><code>${fast.sse.toFixed(2)}</code></td>
                <td><span class="badge-pibic">Convergência ultra-rápida</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip" style="margin-top: 1rem;">
          <div class="callout-icon">🎯</div>
          <div class="callout-content">
            <h4>Conclusão Acadêmica:</h4>
            <p>
              Ao empregar o <strong>Fast Codebook (Pattern Spread)</strong>, o número de iterações necessárias para convergir é reduzido drasticamente porque os centróides já nascem distribuídos no manifold dos dados, evitando o "efeito rebanho" da inicialização aleatória. Já o <strong>Modified K-Means</strong> atua na eficiência intra-iteração, poupando centenas de operações aritméticas.
            </p>
          </div>
        </div>
      </div>
    `;

    const btnRe = document.getElementById('btnReRunPIBICBenchmark');
    if (btnRe) btnRe.onclick = () => this.runBenchmark();
  }
}

