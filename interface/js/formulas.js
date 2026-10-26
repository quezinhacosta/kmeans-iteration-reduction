/**
 * ============================================================================
 * K-MEANS SEM MEDO - DERIVAÇÕES MATEMÁTICAS & RIGOR ACADÊMICO (FORMULAS)
 * ============================================================================
 * Detalhamento matemático formal com demonstrações e anotações para o PIBIC.
 * ============================================================================
 */

export class FormulasViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="grid-2">
        <!-- 1. Função Objetivo SSE / Inércia -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="icon">∑</span> 1. Função Objetivo: SSE (Inércia)</h3>
          </div>
          <div class="math-block">
            <span class="math-title">Equação Fundamental do Particionamento</span>
            <div class="math-formula">
              J(S, μ) = ∑ₖ₌₁ᴷ ∑ₓ∈ₛₖ || x - μₖ ||²
            </div>
            <div class="math-explanation">
              O objetivo do K-Means é particionar N observações em K conjuntos disjuntos S = {S₁, S₂, ..., Sₖ} minimizando a soma das distâncias euclidianas quadráticas de cada ponto ao seu respectivo centróide μₖ.
            </div>
          </div>
          <div class="callout callout-tip" style="margin: 0;">
            <div class="callout-icon">📌</div>
            <div class="callout-content">
              <h4>Natureza da Otimização:</h4>
              <p>Trata-se de um problema NP-difícil no caso geral. O K-Means de Lloyd resolve este problema através de uma heurística de <strong>otimização alternada em dois passos</strong> (Expectation-Maximization): otimiza S mantendo μ fixo, e depois otimiza μ mantendo S fixo.</p>
            </div>
          </div>
        </div>

        <!-- 2. Por que a Média Minimiza os Quadrados? -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="icon">∂</span> 2. Por que a Média Aritmética?</h3>
          </div>
          <div class="math-block">
            <span class="math-title">Derivação Analítica por Igualdade a Zero</span>
            <div class="math-formula">
              ∂J / ∂μₖ = -2 ∑ₓ∈ₛₖ (x - μₖ) = 0
            </div>
            <div class="math-formula" style="color: var(--pink-bright); font-weight: 700;">
              μₖ* = (1 / |Sₖ|) ∑ₓ∈ₛₖ x
            </div>
            <div class="math-explanation">
              Ao expandir o somatório: ∑ x - |Sₖ|·μₖ = 0 ⟹ |Sₖ|·μₖ = ∑ x. Dividindo por |Sₖ| (número de membros do cluster), encontramos que a média aritmética é o único ponto estacionário que anula o gradiente e atinge o mínimo estrito.
            </div>
          </div>
          <div class="callout callout-pibic" style="margin: 0;">
            <div class="callout-icon">⚡</div>
            <div class="callout-content">
              <h4>Conexão com a Norma L2:</h4>
              <p>Se a métrica fosse a Distância de Manhattan (Norma L1), o centróide ótimo seria a <strong>Mediana</strong> (algoritmo K-Medians). Como usamos a Distância Euclidiana Quadrática (Norma L2 ao quadrado), o centróide ótimo é obrigatoriamente a <strong>Média</strong>.</p>
            </div>
          </div>
        </div>

        <!-- 3. Distância Euclidiana Quadrática no PIBIC -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="icon">📐</span> 3. Distância Euclidiana Quadrática</h3>
          </div>
          <div class="math-block">
            <span class="math-title">Eliminação da Raiz Quadrada Redundante</span>
            <div class="math-formula">
              d²(x, μₖ) = ∑ⱼ₌₁ᵈ (xⱼ - μₖ,ⱼ)²
            </div>
            <div class="math-explanation">
              Para quaisquer dois centróides μ₁ e μ₂:
              <br>
              <strong>d²(x, μ₁) < d²(x, μ₂) ⟺ √(d²(x, μ₁)) < √(d²(x, μ₂))</strong>
            </div>
          </div>
          <div class="callout callout-tip" style="margin: 0;">
            <div class="callout-icon">💡</div>
            <div class="callout-content">
              <h4>Vantagem Computacional no PIBIC:</h4>
              <p>A raiz quadrada é uma das operações de ponto flutuante mais caras em arquiteturas computacionais (requer algoritmo iterativo de Newton-Raphson na FPU). A métrica quadrática preserva a classificação Voronoi idêntica com complexidade aritmética muito menor.</p>
            </div>
          </div>
        </div>

        <!-- 4. Coeficiente de Silhueta -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="icon">📊</span> 4. Coeficiente de Silhueta (Rousseeuw, 1987)</h3>
          </div>
          <div class="math-block">
            <span class="math-title">Avaliação Intrínseca de Coesão e Separação</span>
            <div class="math-formula">
              s(i) = (b(i) - a(i)) / max(a(i), b(i))
            </div>
            <div class="math-explanation">
              • <strong>a(i)</strong>: Distância média da amostra i para todos os outros pontos do mesmo cluster (coesão).<br>
              • <strong>b(i)</strong>: Menor distância média da amostra i para os pontos de qualquer outro cluster vizinho (separação).<br>
              • Intervalo: <strong>-1 ≤ s(i) ≤ +1</strong>. Valores próximos a +1 indicam agrupamento excelente.
            </div>
          </div>
        </div>

        <!-- 5. Modified K-Means: Limiar de Atividade -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="icon">🚀</span> 5. Modified K-Means (Lee 1997; Paliwal 2000)</h3>
          </div>
          <div class="math-block">
            <span class="math-title">Critério de Pulo de Cálculos por Inércia</span>
            <div class="math-formula">
              Δμₖ^(t) = || μₖ^(t) - μₖ^(t-1) ||²
            </div>
            <div class="math-explanation">
              Se Δμₖ < δ (onde δ é o limiar de estabilidade), o centróide é classificado como inativo. Pontos pertencentes a esse cluster evitam comparar sua distância com centróides distantes que também não se moveram, poupando ciclos massivos em quantização vetorial.
            </div>
          </div>
        </div>

        <!-- 6. Avaliação de Imagens: PSNR e MSE -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="icon">🖼️</span> 6. Métricas de Qualidade de Imagem (PSNR & MSE)</h3>
          </div>
          <div class="math-block">
            <span class="math-title">Quantificação da Distorção Visual</span>
            <div class="math-formula">
              MSE = (1 / 3N) ∑ᵢ₌₁ᴺ || pᵢ - c(pᵢ) ||²
            </div>
            <div class="math-formula">
              PSNR = 10 · log₁₀( 255² / MSE ) [dB]
            </div>
            <div class="math-explanation">
              Em Quantização Vetorial (QV) de imagens do PIBIC, o MSE mede o erro quadrático médio de cada canal RGB reconstruído pelo Codebook, enquanto o PSNR (em decibéis) quantifica a fidelidade de reprodução perceptual.
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

