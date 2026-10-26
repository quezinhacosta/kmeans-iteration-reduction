/**
 * ============================================================================
 * K-MEANS SEM MEDO - QUANTIZAÇÃO VETORIAL DE IMAGENS (IMAGE VQ SIMULATOR)
 * ============================================================================
 * Aplicação real e central do plano de trabalho PIBIC:
 * O K-Means atuando como gerador de Codebook (dicionário de cores) para
 * compressão e particionamento de sinais visuais.
 * Referências: Bilal et al. (2021), Calazans et al. (2019), Madeiro et al.
 * ============================================================================
 */

import { squaredEuclidean, initKMeansPlusPlus, assignPoints, updateCentroids } from './kmeans-engine.js';

export class ImageVQSimulator {
  constructor(originalCanvasId, quantizedCanvasId, paletteId) {
    this.origCanvas = document.getElementById(originalCanvasId);
    this.quantCanvas = document.getElementById(quantizedCanvasId);
    this.paletteContainer = document.getElementById(paletteId);

    this.codebookSize = 8; // K = 8 cores
    this.maxIter = 15;

    this.btnRun = document.getElementById('btnRunImageVQ');
    this.selectK = document.getElementById('selectVQK');
    this.selectPreset = document.getElementById('selectVQImagePreset');
    this.fileInput = document.getElementById('inputVQUpload');

    // Métricas HUD
    this.statPSNR = document.getElementById('vqPSNR');
    this.statMSE = document.getElementById('vqMSE');
    this.statBits = document.getElementById('vqBits');
    this.statIter = document.getElementById('vqIter');

    this.bindEvents();
    this.drawPresetImage('gradient');
  }

  bindEvents() {
    if (this.btnRun) {
      this.btnRun.addEventListener('click', () => this.runQuantization());
    }

    if (this.selectK) {
      this.selectK.addEventListener('change', (e) => {
        this.codebookSize = parseInt(e.target.value, 10);
        this.runQuantization();
      });
    }

    if (this.selectPreset) {
      this.selectPreset.addEventListener('change', (e) => {
        this.drawPresetImage(e.target.value);
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              this.drawImageToCanvas(img);
              this.runQuantization();
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  /**
   * Desenha uma imagem sintética interessante no Canvas original
   */
  drawPresetImage(preset = 'gradient') {
    if (!this.origCanvas) return;
    const ctx = this.origCanvas.getContext('2d');
    const w = this.origCanvas.width = 180;
    const h = this.origCanvas.height = 180;

    if (preset === 'gradient') {
      // Pôr do sol cyberpunk (tons de rosa, roxo e ciano)
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ff2a85');
      grad.addColorStop(0.35, '#8b5cf6');
      grad.addColorStop(0.7, '#06b6d4');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Sol poente rosa
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 10, 45, 0, Math.PI * 2);
      ctx.fillStyle = '#ff66aa';
      ctx.shadowColor = '#ff2a85';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Grade horizontal estilo synthwave
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let y = h / 2 + 30; y < h; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (preset === 'geometric') {
      // Formas geométricas coloridas
      ctx.fillStyle = '#0b0b14';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ff2a85';
      ctx.fillRect(25, 25, 60, 60);

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(125, 60, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(40, 155);
      ctx.lineTo(85, 95);
      ctx.lineTo(130, 155);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.fillRect(115, 115, 45, 45);
    } else {
      // Mandril / Padrão textural
      ctx.fillStyle = '#12121e';
      ctx.fillRect(0, 0, w, h);

      for (let x = 0; x < w; x += 15) {
        for (let y = 0; y < h; y += 15) {
          const r = Math.floor((x / w) * 255);
          const g = Math.floor((y / h) * 255);
          const b = Math.floor(((x + y) / (w + h)) * 255);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(x + 7, y + 7, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    this.runQuantization();
  }

  drawImageToCanvas(img) {
    if (!this.origCanvas) return;
    const ctx = this.origCanvas.getContext('2d');
    const w = this.origCanvas.width = 180;
    const h = this.origCanvas.height = 180;
    ctx.drawImage(img, 0, 0, w, h);
  }

  /**
   * Executa o K-Means no espaço de cores RGB [R, G, B]
   */
  runQuantization() {
    if (!this.origCanvas || !this.quantCanvas) return;
    const origCtx = this.origCanvas.getContext('2d');
    const quantCtx = this.quantCanvas.getContext('2d');
    const w = this.quantCanvas.width = this.origCanvas.width;
    const h = this.quantCanvas.height = this.origCanvas.height;

    const imgData = origCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const numPixels = w * h;

    // Amostra pixels no formato [[R, G, B], ...]
    const points = [];
    // Para manter a UI instantânea, podemos amostrar 1 a cada 2 pixels para treinar o codebook
    for (let i = 0; i < data.length; i += 8) {
      points.push([data[i], data[i + 1], data[i + 2]]);
    }

    const k = this.codebookSize;

    // 1. Inicializa Centróides de Cor (Codebook Inicial) via K-Means++
    let centroids = initKMeansPlusPlus(points, k);

    // 2. Itera K-Means de Lloyd
    let iteration = 0;
    for (iteration = 1; iteration <= this.maxIter; iteration++) {
      const { assignments } = assignPoints(points, centroids, squaredEuclidean);
      const { newCentroids, maxShift } = updateCentroids(points, assignments, k, centroids);
      centroids = newCentroids;
      if (maxShift < 1.0) break; // Convergiu!
    }

    // 3. Reconstrói a imagem quantizada substituindo cada pixel pelo centróide mais próximo
    const quantImgData = quantCtx.createImageData(w, h);
    const quantData = quantImgData.data;

    let totalSquaredError = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Busca centróide mais próximo
      let minDist = Infinity;
      let bestC = 0;

      for (let c = 0; c < k; c++) {
        const dr = r - centroids[c][0];
        const dg = g - centroids[c][1];
        const db = b - centroids[c][2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
          minDist = dist;
          bestC = c;
        }
      }

      const qR = Math.round(centroids[bestC][0]);
      const qG = Math.round(centroids[bestC][1]);
      const qB = Math.round(centroids[bestC][2]);

      quantData[i] = qR;
      quantData[i + 1] = qG;
      quantData[i + 2] = qB;
      quantData[i + 3] = data[i + 3]; // Mantém canal Alpha

      totalSquaredError += (r - qR) ** 2 + (g - qG) ** 2 + (b - qB) ** 2;
    }

    quantCtx.putImageData(quantImgData, 0, 0);

    // 4. Calcula Métricas de Avaliação PIBIC (MSE e PSNR)
    const mse = totalSquaredError / (3 * numPixels);
    const psnr = (mse > 0) ? (10 * Math.log10((255 * 255) / mse)) : 99.9;
    const bitsPerPixel = Math.log2(k);

    if (this.statPSNR) this.statPSNR.innerText = `${psnr.toFixed(2)} dB`;
    if (this.statMSE) this.statMSE.innerText = mse.toFixed(2);
    if (this.statBits) this.statBits.innerText = `${bitsPerPixel.toFixed(1)} bpp`;
    if (this.statIter) this.statIter.innerText = `${iteration} iterações`;

    // 5. Renderiza a Paleta do Codebook
    this.renderPalette(centroids);
  }

  renderPalette(centroids) {
    if (!this.paletteContainer) return;
    this.paletteContainer.innerHTML = '';

    centroids.forEach((c, idx) => {
      const r = Math.round(c[0]);
      const g = Math.round(c[1]);
      const b = Math.round(c[2]);

      const swatch = document.createElement('div');
      swatch.className = 'swatch-color';
      swatch.style.backgroundColor = `rgb(${r},${g},${b})`;
      swatch.title = `Vetor C${idx + 1}: RGB(${r}, ${g}, ${b})`;
      this.paletteContainer.appendChild(swatch);
    });
  }
}

