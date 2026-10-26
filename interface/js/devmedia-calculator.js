/**
 * ============================================================================
 * K-MEANS SEM MEDO - CALCULADORA DIDÁTICA DEVMEDIA (EXEMPLO NUMÉRICO COMPLETO)
 * ============================================================================
 * Reprodução interativa, passo a passo, do clássico artigo da DevMedia:
 * "Data Mining na Prática: Algoritmo K-Means" (devmedia.com.br/4584)
 * Mostra matriz de distâncias com fórmulas abertas, atribuição e recálculo
 * das médias aritméticas vetorizadas.
 * ============================================================================
 */

import { squaredEuclidean, euclidean } from './kmeans-engine.js';

export class DevMediaCalculator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Dados Didáticos Originais da DevMedia
    this.dataset = [
      { id: 'A', x: 1.0, y: 1.0 },
      { id: 'B', x: 2.0, y: 1.0 },
      { id: 'C', x: 4.0, y: 3.0 },
      { id: 'D', x: 5.0, y: 4.0 },
      { id: 'E', x: 1.0, y: 2.0 },
      { id: 'F', x: 4.0, y: 4.0 }
    ];

    this.k = 2;
    // Centróides iniciais escolhidos como as primeiras instâncias A e B
    this.initialCentroidIndices = [0, 1]; // A e B
    this.centroids = [
      { ...this.dataset[0] },
      { ...this.dataset[1] }
    ];

    this.iteration = 1;
    this.converged = false;
    this.history = [];
    this.useSquaredDistance = true; // PIBIC usa quadrática!

    this.render();
  }

  reset() {
    this.iteration = 1;
    this.converged = false;
    this.history = [];
    this.centroids = [
      { ...this.dataset[this.initialCentroidIndices[0]] },
      { ...this.dataset[this.initialCentroidIndices[1]] }
    ];
    this.render();
  }

  computeStep() {
    if (this.converged) return;

    const c1 = this.centroids[0];
    const c2 = this.centroids[1];

    // 1. Calcula distâncias para cada ponto
    const calculations = [];
    const g1 = [];
    const g2 = [];

    for (const point of this.dataset) {
      let d1, d2;
      let d1Formula, d2Formula;

      if (this.useSquaredDistance) {
        // Distância Euclidiana Quadrática (PIBIC)
        const diffX1 = point.x - c1.x;
        const diffY1 = point.y - c1.y;
        d1 = diffX1 * diffX1 + diffY1 * diffY1;
        d1Formula = `(${point.x} - ${c1.x.toFixed(1)})² + (${point.y} - ${c1.y.toFixed(1)})² = ${d1.toFixed(2)}`;

        const diffX2 = point.x - c2.x;
        const diffY2 = point.y - c2.y;
        d2 = diffX2 * diffX2 + diffY2 * diffY2;
        d2Formula = `(${point.x} - ${c2.x.toFixed(1)})² + (${point.y} - ${c2.y.toFixed(1)})² = ${d2.toFixed(2)}`;
      } else {
        // Distância Euclidiana com Raiz
        const d1Sq = (point.x - c1.x) ** 2 + (point.y - c1.y) ** 2;
        d1 = Math.sqrt(d1Sq);
        d1Formula = `√[(${point.x} - ${c1.x.toFixed(1)})² + (${point.y} - ${c1.y.toFixed(1)})²] = ${d1.toFixed(2)}`;

        const d2Sq = (point.x - c2.x) ** 2 + (point.y - c2.y) ** 2;
        d2 = Math.sqrt(d2Sq);
        d2Formula = `√[(${point.x} - ${c2.x.toFixed(1)})² + (${point.y} - ${c2.y.toFixed(1)})²] = ${d2.toFixed(2)}`;
      }

      const assignedGroup = (d1 <= d2) ? 'Cluster 1 (C₁)' : 'Cluster 2 (C₂)';
      if (d1 <= d2) g1.push(point);
      else g2.push(point);

      calculations.push({
        id: point.id,
        point,
        d1,
        d2,
        d1Formula,
        d2Formula,
        assigned: assignedGroup
      });
    }

    // 2. Recalcula os novos centróides (médias)
    let newC1 = { ...c1 };
    let c1Shift = 0;
    let c1Formula = "";
    if (g1.length > 0) {
      const sumX = g1.reduce((acc, p) => acc + p.x, 0);
      const sumY = g1.reduce((acc, p) => acc + p.y, 0);
      newC1 = { x: sumX / g1.length, y: sumY / g1.length };
      c1Shift = (newC1.x - c1.x) ** 2 + (newC1.y - c1.y) ** 2;
      const xList = g1.map(p => p.x).join('+');
      const yList = g1.map(p => p.y).join('+');
      c1Formula = `C₁ = ((${xList})/${g1.length}, (${yList})/${g1.length}) = (${newC1.x.toFixed(2)}, ${newC1.y.toFixed(2)})`;
    }

    let newC2 = { ...c2 };
    let c2Shift = 0;
    let c2Formula = "";
    if (g2.length > 0) {
      const sumX = g2.reduce((acc, p) => acc + p.x, 0);
      const sumY = g2.reduce((acc, p) => acc + p.y, 0);
      newC2 = { x: sumX / g2.length, y: sumY / g2.length };
      c2Shift = (newC2.x - c2.x) ** 2 + (newC2.y - c2.y) ** 2;
      const xList = g2.map(p => p.x).join('+');
      const yList = g2.map(p => p.y).join('+');
      c2Formula = `C₂ = ((${xList})/${g2.length}, (${yList})/${g2.length}) = (${newC2.x.toFixed(2)}, ${newC2.y.toFixed(2)})`;
    }

    // Verifica convergência (se deslocamento foi nulo ou desprezível)
    const isConverged = (c1Shift < 1e-6 && c2Shift < 1e-6);

    const stepResult = {
      iteration: this.iteration,
      oldCentroids: [{ ...c1 }, { ...c2 }],
      calculations,
      g1,
      g2,
      newCentroids: [{ ...newC1 }, { ...newC2 }],
      c1Formula,
      c2Formula,
      c1Shift,
      c2Shift,
      isConverged
    };

    this.history.push(stepResult);
    this.centroids = [{ ...newC1 }, { ...newC2 }];

    if (isConverged) {
      this.converged = true;
    } else {
      this.iteration++;
    }

    this.render();
  }

  render() {
    if (!this.container) return;

    let html = `
      <div class="card card-highlight">
        <div class="card-header">
          <div>
            <h3 class="card-title">
              <span class="icon">📖</span> Exemplo Didático DevMedia: Passo a Passo Numérico
            </h3>
            <p class="card-subtitle">
              Baseado no artigo "Data Mining na Prática: Algoritmo K-Means" (DevMedia #4584), demonstrando o cálculo manual exato de cada distância e nova média.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button id="btnDevMediaReset" class="btn btn-secondary btn-sm">↺ Reiniciar Exemplo</button>
            <button id="btnDevMediaNext" class="btn btn-primary btn-sm" ${this.converged ? 'disabled' : ''}>
              ${this.converged ? '✓ Convergido!' : `Próximo Passo (Iteração ${this.iteration}) ➔`}
            </button>
          </div>
        </div>

        <!-- Tabela dos Dados de Amostra -->
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--pink-bright); margin-bottom: 0.5rem;">
            1. Amostras de Entrada (Objetos Bidimensionais)
          </h4>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Objeto</th>
                  <th>Atributo X₁</th>
                  <th>Atributo X₂</th>
                  <th>Papel Inicial</th>
                </tr>
              </thead>
              <tbody>
                ${this.dataset.map((p, idx) => `
                  <tr>
                    <td><strong>Objeto ${p.id}</strong></td>
                    <td><code>${p.x.toFixed(1)}</code></td>
                    <td><code>${p.y.toFixed(1)}</code></td>
                    <td>
                      ${idx === 0 ? '<span class="badge-pibic" style="background: rgba(255,42,133,0.2);">Semente C₁ (Inicial)</span>' : ''}
                      ${idx === 1 ? '<span class="badge-pibic" style="background: rgba(6,182,212,0.2); color: #06b6d4; border-color: #06b6d4;">Semente C₂ (Inicial)</span>' : ''}
                      ${idx > 1 ? '<span style="color: var(--text-muted); font-size: 0.78rem;">Ponto a classificar</span>' : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seletor de Métrica: Euclidiana Padrão vs Euclidiana Quadrática -->
        <div class="callout callout-pibic" style="margin: 1rem 0;">
          <div class="callout-icon">💡</div>
          <div class="callout-content">
            <h4>Observação Crucial do PIBIC (Distância Euclidiana Quadrática):</h4>
            <p>
              O artigo DevMedia ensina com a raiz quadrada tradicional $\\sqrt{(x_1 - c_1)^2 + (x_2 - c_2)^2}$. No entanto, no nosso plano de trabalho PIBIC usamos a <strong>Distância Euclidiana Quadrática</strong> $(x_1 - c_1)^2 + (x_2 - c_2)^2$. Como a função $f(z) = \\sqrt{z}$ é estritamente crescente para $z \\ge 0$, a ordem das distâncias não se altera ($a < b \\iff a^2 < b^2$), mas <strong>economizamos milhões de ciclos de processador de raiz quadrada</strong>!
            </p>
          </div>
        </div>
    `;

    // Renderiza o Histórico de Iterações Calculadas
    if (this.history.length === 0) {
      html += `
        <div style="background: #090912; border: 1px dashed rgba(255, 42, 133, 0.3); border-radius: var(--radius-md); padding: 1.75rem; text-align: center; margin-top: 1rem;">
          <p style="color: var(--text-secondary); margin-bottom: 0.75rem;">
            Os centróides iniciais foram definidos como <strong>C₁ = A (1.0, 1.0)</strong> e <strong>C₂ = B (2.0, 1.0)</strong>.
          </p>
          <button id="btnDevMediaStart" class="btn btn-primary">
            🚀 Iniciar Cálculo da Iteração 1
          </button>
        </div>
      `;
    } else {
      this.history.forEach((step, idx) => {
        html += `
          <div style="background: #0a0a14; border: 1px solid rgba(255, 42, 133, 0.25); border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="color: var(--pink-bright); font-size: 1rem;">
                🔄 Iteração ${step.iteration}
              </h4>
              <span class="badge-pibic">
                Centróides Atuais: C₁(${step.oldCentroids[0].x.toFixed(2)}, ${step.oldCentroids[0].y.toFixed(2)}) | C₂(${step.oldCentroids[1].x.toFixed(2)}, ${step.oldCentroids[1].y.toFixed(2)})
              </span>
            </div>

            <!-- Matriz de Distâncias Passo a Passo -->
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
              Passo A: Cálculo de Distância Ponto a Centróide e Atribuição ao Menor Valor
            </p>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Ponto</th>
                    <th>Cálculo d²(P, C₁)</th>
                    <th>Cálculo d²(P, C₂)</th>
                    <th>Cluster Atribuído</th>
                  </tr>
                </thead>
                <tbody>
                  ${step.calculations.map(calc => `
                    <tr>
                      <td><strong>Objeto ${calc.id}</strong> (${calc.point.x}, ${calc.point.y})</td>
                      <td class="${calc.d1 <= calc.d2 ? 'highlight-min' : ''}">
                        <code style="font-size: 0.8rem;">${calc.d1Formula}</code>
                      </td>
                      <td class="${calc.d2 < calc.d1 ? 'highlight-min' : ''}">
                        <code style="font-size: 0.8rem;">${calc.d2Formula}</code>
                      </td>
                      <td>
                        <span class="badge-pibic" style="background: ${calc.d1 <= calc.d2 ? 'rgba(255,42,133,0.15)' : 'rgba(6,182,212,0.15)'}; color: ${calc.d1 <= calc.d2 ? '#ff2a85' : '#06b6d4'}; border-color: ${calc.d1 <= calc.d2 ? '#ff2a85' : '#06b6d4'};">
                          ${calc.assigned}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Recálculo das Médias -->
            <div style="margin-top: 1rem; background: #0e0e1a; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
                Passo B: Recálculo dos Centróides (Média Aritmética dos Membros do Cluster)
              </p>
              <div style="font-family: var(--font-mono); font-size: 0.88rem; color: #ffffff; display: flex; flex-direction: column; gap: 0.35rem;">
                <div><span style="color: var(--pink-bright);">●</span> ${step.c1Formula} (Deslocamento Δ₁ = ${step.c1Shift.toFixed(4)})</div>
                <div><span style="color: var(--cyan-neon);">●</span> ${step.c2Formula} (Deslocamento Δ₂ = ${step.c2Shift.toFixed(4)})</div>
              </div>
            </div>

            ${step.isConverged ? `
              <div style="margin-top: 1rem; background: rgba(16, 185, 129, 0.15); border: 1px solid var(--emerald-neon); padding: 0.85rem; border-radius: var(--radius-sm); color: #a7f3d0; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                <span>🎉</span> <strong>Critério de Parada Atingido!</strong> Os centróides não mudaram de posição (Δ = 0.0) e as associações se mantiveram idênticas. O K-Means convergiu com sucesso!
              </div>
            ` : `
              <div style="margin-top: 0.75rem; color: var(--amber-neon); font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>⏳</span> Os centróides se moveram. É necessária uma nova iteração para testar a estabilidade.
              </div>
            `}
          </div>
        `;
      });
    }

    html += `</div>`;
    this.container.innerHTML = html;

    // Conecta botões
    const btnNext = document.getElementById('btnDevMediaNext');
    if (btnNext) btnNext.onclick = () => this.computeStep();

    const btnReset = document.getElementById('btnDevMediaReset');
    if (btnReset) btnReset.onclick = () => this.reset();

    const btnStart = document.getElementById('btnDevMediaStart');
    if (btnStart) btnStart.onclick = () => this.computeStep();
  }
}

