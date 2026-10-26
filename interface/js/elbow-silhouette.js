/**
 * ============================================================================
 * K-MEANS SEM MEDO - MÉTODO DO COTOVELO & SILHUETA (ELBOW & SILHOUETTE)
 * ============================================================================
 * Ferramenta interativa para responder à pergunta clássica de Ciência de Dados:
 * "Como escolher o melhor valor de K sem medo?"
 * ============================================================================
 */

import {
  KMeansSession,
  generateBlobs,
  calculateSilhouetteScore
} from './kmeans-engine.js';
import { ChartEngine } from './chart-engine.js';

export class ElbowSilhouetteTool {
  constructor(elbowCanvasId, silhouetteCanvasId) {
    this.elbowCanvas = document.getElementById(elbowCanvasId);
    this.silhouetteCanvas = document.getElementById(silhouetteCanvasId);

    this.points = generateBlobs(250, 4, 0.07); // 4 clusters naturais
    this.kRange = [1, 2, 3, 4, 5, 6, 7, 8];
    this.sseResults = [];
    this.silhouetteResults = [];
    this.elbowK = null;
    this.bestSilhouetteK = null;

    this.btnRun = document.getElementById('btnRunElbowAnalysis');
    if (this.btnRun) {
      this.btnRun.addEventListener('click', () => this.runAnalysis());
    }

    // Executa análise inicial automaticamente após carregar a interface
    setTimeout(() => this.runAnalysis(), 300);
  }

  setPoints(newPoints) {
    this.points = newPoints;
    this.runAnalysis();
  }

  runAnalysis() {
    this.sseResults = [];
    this.silhouetteResults = [];

    // Executa K-Means para K = 1 a 8
    for (const k of this.kRange) {
      const session = new KMeansSession(this.points, {
        k,
        initMethod: 'kmeans++',
        maxIter: 100
      });
      const result = session.runToConvergence();
      this.sseResults.push(result.finalSSE);

      if (k >= 2) {
        const score = calculateSilhouetteScore(this.points, session.assignments, k);
        this.silhouetteResults.push(score);
      } else {
        this.silhouetteResults.push(0); // Silhueta indefinida para K=1
      }
    }

    // Detecção Matemática do Ponto do Cotovelo (Máxima Distância à Secante P1 -> Pn)
    this.elbowK = this.findElbowK(this.kRange, this.sseResults);

    // Melhor Silhueta (excluindo K=1)
    let bestScore = -1;
    let bestK = 2;
    for (let i = 1; i < this.kRange.length; i++) {
      if (this.silhouetteResults[i] > bestScore) {
        bestScore = this.silhouetteResults[i];
        bestK = this.kRange[i];
      }
    }
    this.bestSilhouetteK = bestK;

    this.renderCharts();
    this.updateSummaryText();
  }

  findElbowK(kArr, sseArr) {
    if (kArr.length < 3) return kArr[0];

    // Vetor que liga o primeiro ponto (x1, y1) ao último (x2, y2)
    const x1 = kArr[0];
    const y1 = sseArr[0];
    const x2 = kArr[kArr.length - 1];
    const y2 = sseArr[sseArr.length - 1];

    let maxDist = -1;
    let bestK = kArr[1];

    // Distância perpendicular de cada ponto (x0, y0) à reta secante
    // d = |(y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1| / sqrt((y2 - y1)^2 + (x2 - x1)^2)
    const lineLen = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

    for (let i = 1; i < kArr.length - 1; i++) {
      const x0 = kArr[i];
      const y0 = sseArr[i];
      const dist = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / lineLen;

      if (dist > maxDist) {
        maxDist = dist;
        bestK = x0;
      }
    }

    return bestK;
  }

  renderCharts() {
    if (this.elbowCanvas) {
      ChartEngine.renderElbowChart(this.elbowCanvas, this.kRange, this.sseResults, this.elbowK);
    }
    if (this.silhouetteCanvas) {
      ChartEngine.renderSilhouetteBars(
        this.silhouetteCanvas,
        this.kRange.slice(1),
        this.silhouetteResults.slice(1)
      );
    }
  }

  updateSummaryText() {
    const summaryEl = document.getElementById('elbowSummaryText');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
          <div class="stat-card" style="flex: 1; min-width: 200px;">
            <span class="stat-label">Recomendação do Cotovelo</span>
            <span class="stat-value" style="color: #06b6d4;">K = ${this.elbowK}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Ponto de inflexão máxima do SSE</span>
          </div>
          <div class="stat-card" style="flex: 1; min-width: 200px;">
            <span class="stat-label">Recomendação da Silhueta</span>
            <span class="stat-value" style="color: var(--pink-bright);">K = ${this.bestSilhouetteK}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Score: ${(this.silhouetteResults[this.kRange.indexOf(this.bestSilhouetteK)] || 0).toFixed(2)} (Máx Coesão/Separação)</span>
          </div>
        </div>
      `;
    }
  }
}

