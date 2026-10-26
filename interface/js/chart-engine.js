/**
 * ============================================================================
 * K-MEANS SEM MEDO - MOTOR DE GRÁFICOS EM CANVAS (CHART ENGINE)
 * ============================================================================
 * Gráficos de alta fidelidade desenhados diretamente em Canvas 2D,
 * 100% autônomos (sem dependências externas de CDN), estilizados
 * rigorosamente na paleta Preto & Rosa Neon.
 * ============================================================================
 */

export class ChartEngine {
  /**
   * Renderiza a curva de convergência de SSE (Inércia ao longo das iterações)
   */
  static renderSSECurve(canvas, sseHistory) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight || 160;

    ctx.clearRect(0, 0, width, height);

    if (!sseHistory || sseHistory.length === 0) {
      ctx.fillStyle = '#8e7384';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Execute o algoritmo para visualizar a curva de inércia SSE', width / 2, height / 2);
      return;
    }

    const padding = { top: 25, right: 30, bottom: 30, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxSSE = Math.max(...sseHistory, 1e-5);
    const minSSE = Math.min(...sseHistory);
    const range = (maxSSE - minSSE) || maxSSE;

    // Linhas de Grade e Eixos
    ctx.strokeStyle = 'rgba(255, 42, 133, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);

      // Label do eixo Y
      const val = maxSSE - (range / 4) * i;
      ctx.fillStyle = '#8e7384';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(2), padding.left - 8, y + 3);
    }
    ctx.stroke();

    // Eixo X Labels
    ctx.textAlign = 'center';
    const numPoints = sseHistory.length;
    for (let i = 0; i < numPoints; i++) {
      if (numPoints > 15 && i % Math.ceil(numPoints / 10) !== 0 && i !== numPoints - 1) continue;
      const x = padding.left + (numPoints === 1 ? chartW / 2 : (chartW / (numPoints - 1)) * i);
      ctx.fillText(`i=${i}`, x, height - padding.bottom + 18);
    }

    // Desenha Área de Preenchimento Translúcida Rosa
    if (numPoints > 1) {
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const x = padding.left + (chartW / (numPoints - 1)) * i;
        const normalized = (sseHistory[i] - minSSE) / (range || 1);
        const y = padding.top + chartH - normalized * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(padding.left + chartW, padding.top + chartH);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, 'rgba(255, 42, 133, 0.35)');
      gradient.addColorStop(1, 'rgba(255, 42, 133, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Desenha a Linha Neon Rosa
    ctx.beginPath();
    ctx.strokeStyle = '#ff2a85';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255, 42, 133, 0.7)';
    ctx.shadowBlur = 8;

    for (let i = 0; i < numPoints; i++) {
      const x = numPoints === 1 ? padding.left + chartW / 2 : padding.left + (chartW / (numPoints - 1)) * i;
      const normalized = (sseHistory[i] - minSSE) / (range || 1);
      const y = padding.top + chartH - normalized * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Reset de Sombra
    ctx.shadowBlur = 0;

    // Desenha os Marcadores dos Pontos
    for (let i = 0; i < numPoints; i++) {
      const x = numPoints === 1 ? padding.left + chartW / 2 : padding.left + (chartW / (numPoints - 1)) * i;
      const normalized = (sseHistory[i] - minSSE) / (range || 1);
      const y = padding.top + chartH - normalized * chartH;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#ff2a85';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Título do Eixo
    ctx.fillStyle = '#ff66aa';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SSE / Inércia (Descida Monótona)', padding.left, padding.top - 10);
  }

  /**
   * Renderiza o Gráfico do Método do Cotovelo (Elbow Method)
   */
  static renderElbowChart(canvas, kValues, sseValues, elbowK = null) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight || 260;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 35, right: 35, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxSSE = Math.max(...sseValues);
    const minSSE = Math.min(...sseValues);
    const range = (maxSSE - minSSE) || maxSSE;

    // Grade de fundo
    ctx.strokeStyle = 'rgba(255, 42, 133, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);

      const val = maxSSE - (range / 4) * i;
      ctx.fillStyle = '#8e7384';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(2), padding.left - 10, y + 4);
    }
    ctx.stroke();

    // Traça Linha do Cotovelo
    ctx.beginPath();
    ctx.strokeStyle = '#ff2a85';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 42, 133, 0.6)';
    ctx.shadowBlur = 10;

    const n = kValues.length;
    for (let i = 0; i < n; i++) {
      const x = padding.left + (chartW / (n - 1)) * i;
      const normalized = (sseValues[i] - minSSE) / (range || 1);
      const y = padding.top + chartH - normalized * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Marcadores e Anotação do Cotovelo
    for (let i = 0; i < n; i++) {
      const k = kValues[i];
      const x = padding.left + (chartW / (n - 1)) * i;
      const normalized = (sseValues[i] - minSSE) / (range || 1);
      const y = padding.top + chartH - normalized * chartH;

      // Label do Eixo X
      ctx.fillStyle = '#d6b5c9';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`K=${k}`, x, height - padding.bottom + 20);

      // Ponto
      const isElbow = (k === elbowK);
      ctx.beginPath();
      ctx.arc(x, y, isElbow ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isElbow ? '#06b6d4' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = isElbow ? '#ffffff' : '#ff2a85';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isElbow) {
        // Halo de destaque
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Balão informativo "Cotovelo Ótimo"
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Cotovelo Ótimo (K=${k})`, x, y - 18);
      }
    }

    // Título
    ctx.fillStyle = '#ff66aa';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Curva do Cotovelo: Inércia SSE vs Número de Clusters K', padding.left, padding.top - 12);
  }

  /**
   * Renderiza Gráfico de Barras do Coeficiente de Silhueta
   */
  static renderSilhouetteBars(canvas, kValues, scores) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight || 200;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 25, bottom: 35, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Eixo zero horizontal
    const zeroY = padding.top + chartH;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(width - padding.right, zeroY);
    ctx.stroke();

    const n = kValues.length;
    const barWidth = Math.min(36, (chartW / n) * 0.6);
    const spacing = chartW / n;

    let bestIdx = 0;
    let bestScore = -1;
    for (let i = 0; i < n; i++) {
      if (scores[i] > bestScore) {
        bestScore = scores[i];
        bestIdx = i;
      }
    }

    for (let i = 0; i < n; i++) {
      const k = kValues[i];
      const score = Math.max(0, scores[i]);
      const x = padding.left + spacing * i + (spacing - barWidth) / 2;
      const barH = score * chartH;
      const y = zeroY - barH;

      const isBest = (i === bestIdx);

      // Preenchimento da Barra
      ctx.fillStyle = isBest ? '#ff2a85' : 'rgba(255, 42, 133, 0.35)';
      ctx.fillRect(x, y, barWidth, barH);

      // Borda
      ctx.strokeStyle = isBest ? '#ffffff' : '#ff479c';
      ctx.lineWidth = isBest ? 2 : 1;
      ctx.strokeRect(x, y, barWidth, barH);

      // Valor no topo
      ctx.fillStyle = isBest ? '#ffffff' : '#d6b5c9';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(score.toFixed(2), x + barWidth / 2, y - 6);

      // Label do Eixo
      ctx.fillText(`K=${k}`, x + barWidth / 2, zeroY + 16);
    }

    // Título
    ctx.fillStyle = '#ff66aa';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Silhouette Score (Maior = Mais Bem Separado)', padding.left, padding.top - 10);
  }
}

