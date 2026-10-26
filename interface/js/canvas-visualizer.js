/**
 * ============================================================================
 * K-MEANS SEM MEDO - VISUALIZADOR INTERATIVO 2D (CANVAS VISUALIZER)
 * ============================================================================
 * Renderizador de alto desempenho e interatividade gráfica:
 * - Renderização de pontos e centróides com brilho neon
 * - Diagrama de Voronoi (fronteiras de decisão em tempo real)
 * - Trajetória dos centróides (rastros de iterações passadas com setas)
 * - Linhas de associação (vetores ponto -> centróide)
 * - Adição manual de pontos com clique do mouse
 * ============================================================================
 */

import {
  PALETTE,
  squaredEuclidean,
  euclidean,
  KMeansSession,
  generateBlobs,
  generateMoons,
  generateCircles,
  generateDevMediaDataset,
  generateUniformNoise
} from './kmeans-engine.js';
import { ChartEngine } from './chart-engine.js';

export class CanvasVisualizer {
  constructor(canvasId, miniChartId = 'sseChartCanvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.miniChartCanvas = document.getElementById(miniChartId);

    // Configurações do Visualizador
    this.points = generateBlobs(240, 3, 0.08);
    this.k = 3;
    this.initMethod = 'kmeans++';
    this.algorithm = 'standard'; // 'standard', 'modified'
    this.activityThreshold = 1e-3;

    // Camadas Visuais
    this.showVoronoi = true;
    this.showTrajectories = true;
    this.showLines = false;
    this.showRadii = true;

    // Estado da Animação
    this.isPlaying = false;
    this.playInterval = null;
    this.speed = 1.0; // 0.2x a 3.0x

    // Mouse / Interação
    this.isManualCentroidMode = false;
    this.manualCentroids = [];
    this.isDragging = false;
    this.draggedCentroidIdx = -1;

    // HUD Elements
    this.hudIteration = document.getElementById('hudIteration');
    this.hudSSE = document.getElementById('hudSSE');
    this.hudShift = document.getElementById('hudShift');
    this.hudCalcs = document.getElementById('hudCalcs');
    this.hudStatus = document.getElementById('hudStatus');

    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.render();
    });

    this.initSession();
    this.bindEvents();
    this.render();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = this.canvas.width = rect.width;
    this.height = this.canvas.height = rect.height || 480;
  }

  initSession() {
    this.session = new KMeansSession(this.points, {
      k: this.k,
      initMethod: this.isManualCentroidMode ? 'manual' : this.initMethod,
      manualCentroids: this.manualCentroids,
      algorithm: this.algorithm,
      activityThreshold: this.activityThreshold,
      metric: squaredEuclidean
    });

    this.updateHUD();
    this.updateMiniChart();
  }

  bindEvents() {
    // Clique no canvas para adicionar pontos ou centróides manuais
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / this.width;
      const normY = (e.clientY - rect.top) / this.height;

      if (this.isManualCentroidMode) {
        if (this.manualCentroids.length < this.k) {
          this.manualCentroids.push([normX, normY]);
          if (this.manualCentroids.length === this.k) {
            this.isManualCentroidMode = false;
            this.initSession();
          }
          this.render();
        }
      } else {
        // Adiciona um ponto novo
        this.points.push([normX, normY]);
        this.initSession();
        this.render();
      }
    });

    // Clique com botão direito remove pontos próximos
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / this.width;
      const normY = (e.clientY - rect.top) / this.height;

      // Encontra ponto mais próximo em um raio pequeno
      let closestIdx = -1;
      let minD = 0.05 * 0.05;

      for (let i = 0; i < this.points.length; i++) {
        const d = squaredEuclidean([normX, normY], this.points[i]);
        if (d < minD) {
          minD = d;
          closestIdx = i;
        }
      }

      if (closestIdx !== -1) {
        this.points.splice(closestIdx, 1);
        if (this.points.length >= this.k) {
          this.initSession();
          this.render();
        }
      }
    });
  }

  step() {
    if (!this.session) return;
    const moved = this.session.step();
    this.updateHUD();
    this.updateMiniChart();
    this.render();
    if (!moved && this.isPlaying) {
      this.pause();
    }
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const baseDelay = 600;
    const intervalTime = Math.max(100, Math.floor(baseDelay / this.speed));

    this.playInterval = setInterval(() => {
      if (!this.session.converged) {
        this.step();
      } else {
        this.pause();
      }
    }, intervalTime);

    this.updateHUD();
  }

  pause() {
    this.isPlaying = false;
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    this.updateHUD();
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  reset() {
    this.pause();
    this.manualCentroids = [];
    this.initSession();
    this.render();
  }

  setK(newK) {
    this.pause();
    this.k = Math.max(1, Math.min(8, newK));
    this.manualCentroids = [];
    this.initSession();
    this.render();
  }

  setDataset(presetName) {
    this.pause();
    switch (presetName) {
      case 'blobs':
        this.points = generateBlobs(260, this.k, 0.08);
        break;
      case 'moons':
        this.points = generateMoons(240, 0.04);
        break;
      case 'circles':
        this.points = generateCircles(260, 0.03);
        break;
      case 'devmedia':
        this.points = generateDevMediaDataset();
        this.k = 2;
        break;
      case 'uniform':
        this.points = generateUniformNoise(200);
        break;
      default:
        this.points = generateBlobs(240, this.k, 0.08);
    }
    this.manualCentroids = [];
    this.initSession();
    this.render();
  }

  setInitMethod(method) {
    this.pause();
    this.initMethod = method;
    if (method === 'manual') {
      this.isManualCentroidMode = true;
      this.manualCentroids = [];
    } else {
      this.isManualCentroidMode = false;
      this.manualCentroids = [];
    }
    this.initSession();
    this.render();
  }

  setAlgorithm(algo) {
    this.algorithm = algo;
    this.initSession();
    this.render();
  }

  setSpeed(s) {
    this.speed = parseFloat(s);
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  updateHUD() {
    if (!this.session) return;
    if (this.hudIteration) this.hudIteration.innerText = this.session.iteration;
    if (this.hudSSE) {
      const lastSSE = this.session.sseHistory[this.session.sseHistory.length - 1];
      this.hudSSE.innerText = (lastSSE !== undefined) ? lastSSE.toFixed(3) : '-';
    }
    if (this.hudShift) {
      this.hudShift.innerText = isFinite(this.session.lastMaxShift) ? this.session.lastMaxShift.toFixed(5) : '-';
    }
    if (this.hudCalcs) {
      this.hudCalcs.innerText = this.session.totalDistanceCalculations;
    }
    if (this.hudStatus) {
      if (this.session.converged) {
        this.hudStatus.innerHTML = '<span style="color: var(--emerald-neon);">● Convergido</span>';
      } else if (this.isPlaying) {
        this.hudStatus.innerHTML = '<span style="color: var(--pink-neon);">● Executando</span>';
      } else {
        this.hudStatus.innerHTML = '<span style="color: var(--text-muted);">● Parado</span>';
      }
    }
  }

  updateMiniChart() {
    if (this.miniChartCanvas && this.session) {
      ChartEngine.renderSSECurve(this.miniChartCanvas, this.session.sseHistory);
    }
  }

  /**
   * Renderização Principal no Canvas
   */
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Limpa fundo com tom preto absoluto
    ctx.fillStyle = '#060609';
    ctx.fillRect(0, 0, w, h);

    // 2. Grade Cibernética Sutil
    this.drawGrid();

    // 3. Camada de Voronoi (Células de Decisão Translúcidas)
    if (this.showVoronoi && this.session && this.session.centroids.length > 0) {
      this.drawVoronoiGrid();
    }

    // 4. Linhas de Associação Ponto -> Centróide
    if (this.showLines && this.session) {
      this.drawAssignmentLines();
    }

    // 5. Trajetória dos Centróides (Histórico de Movimento)
    if (this.showTrajectories && this.session && this.session.trajectory.length > 1) {
      this.drawTrajectories();
    }

    // 6. Círculos de Dispersão / Raio dos Clusters
    if (this.showRadii && this.session) {
      this.drawClusterRadii();
    }

    // 7. Desenha Pontos de Dados
    this.drawPoints();

    // 8. Desenha Centróides com Efeito Neon Pulsante
    this.drawCentroids();

    // 9. Instrução caso esteja em modo de centróides manuais
    if (this.isManualCentroidMode) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, w, 40);
      ctx.fillStyle = '#ff2a85';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      const remaining = this.k - this.manualCentroids.length;
      ctx.fillText(`Modo Manual: Clique no Canvas para posicionar ${remaining} centróide(s) inicial(is)`, w / 2, 25);
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    const step = 40;

    ctx.strokeStyle = 'rgba(255, 42, 133, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < this.width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();
  }

  /**
   * Renderiza as regiões de Voronoi através de uma grade de amostragem em blocos
   */
  drawVoronoiGrid() {
    const ctx = this.ctx;
    const centroids = this.session.centroids;
    const k = centroids.length;
    const sampleStep = 10; // Tamanho do pixel de amostragem para alto desempenho

    const cols = Math.ceil(this.width / sampleStep);
    const rows = Math.ceil(this.height / sampleStep);

    for (let r = 0; r < rows; r++) {
      const py = (r * sampleStep + sampleStep / 2) / this.height;
      for (let c = 0; c < cols; c++) {
        const px = (c * sampleStep + sampleStep / 2) / this.width;

        let minDist = Infinity;
        let closest = 0;

        for (let i = 0; i < k; i++) {
          const d = squaredEuclidean([px, py], centroids[i]);
          if (d < minDist) {
            minDist = d;
            closest = i;
          }
        }

        const colorHex = PALETTE[closest % PALETTE.length];
        // Converte hex para rgba translúcido sutil
        ctx.fillStyle = this.hexToRgba(colorHex, 0.07);
        ctx.fillRect(c * sampleStep, r * sampleStep, sampleStep, sampleStep);
      }
    }
  }

  drawAssignmentLines() {
    const ctx = this.ctx;
    const centroids = this.session.centroids;

    ctx.lineWidth = 0.5;
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const c = this.session.assignments[i];
      const center = centroids[c];

      const px = p[0] * this.width;
      const py = p[1] * this.height;
      const cx = center[0] * this.width;
      const cy = center[1] * this.height;

      ctx.strokeStyle = this.hexToRgba(PALETTE[c % PALETTE.length], 0.18);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(cx, cy);
      ctx.stroke();
    }
  }

  drawTrajectories() {
    const ctx = this.ctx;
    const traj = this.session.trajectory;
    const numSteps = traj.length;

    for (let c = 0; c < this.k; c++) {
      const color = PALETTE[c % PALETTE.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      for (let s = 0; s < numSteps; s++) {
        const pos = traj[s][c];
        const x = pos[0] * this.width;
        const y = pos[1] * this.height;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Desenha marcadores intermediários com seta de deslocamento
      for (let s = 0; s < numSteps - 1; s++) {
        const p1 = traj[s][c];
        const p2 = traj[s + 1][c];
        const x1 = p1[0] * this.width;
        const y1 = p1[1] * this.height;
        const x2 = p2[0] * this.width;
        const y2 = p2[1] * this.height;

        // Ponto intermediário
        ctx.beginPath();
        ctx.arc(x1, y1, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }

  drawClusterRadii() {
    const ctx = this.ctx;
    const centroids = this.session.centroids;
    const counts = new Int32Array(this.k);
    const sumDist = new Float64Array(this.k);

    for (let i = 0; i < this.points.length; i++) {
      const c = this.session.assignments[i];
      counts[c]++;
      sumDist[c] += euclidean(this.points[i], centroids[c]);
    }

    for (let c = 0; c < this.k; c++) {
      if (counts[c] === 0) continue;
      const meanDist = (sumDist[c] / counts[c]);
      const pixelRadius = meanDist * Math.min(this.width, this.height);

      const cx = centroids[c][0] * this.width;
      const cy = centroids[c][1] * this.height;

      ctx.beginPath();
      ctx.arc(cx, cy, pixelRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.hexToRgba(PALETTE[c % PALETTE.length], 0.25);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  drawPoints() {
    const ctx = this.ctx;

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const x = p[0] * this.width;
      const y = p[1] * this.height;

      const cluster = this.session ? this.session.assignments[i] : 0;
      const color = PALETTE[cluster % PALETTE.length];

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fill();

      // Borda sutil nos pontos
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  drawCentroids() {
    const ctx = this.ctx;
    const centroids = this.isManualCentroidMode ? this.manualCentroids : (this.session ? this.session.centroids : []);

    for (let c = 0; c < centroids.length; c++) {
      const center = centroids[c];
      const cx = center[0] * this.width;
      const cy = center[1] * this.height;
      const color = PALETTE[c % PALETTE.length];

      // 1. Halo externo pulsante
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fillStyle = this.hexToRgba(color, 0.18);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Mira cibernética / Cruz central
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 3. Ponto central brilhante
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Etiqueta C_k
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`μ${c + 1}`, cx + 14, cy - 6);
    }
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

