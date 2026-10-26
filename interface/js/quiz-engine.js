/**
 * ============================================================================
 * K-MEANS SEM MEDO - QUIZ INTERATIVO (DESAFIO DO PESQUISADOR)
 * ============================================================================
 * Inspirado nos quizzes didáticos do MIPS Sem Medo:
 * Testa e consolida o entendimento conceitual, matemático e prático
 * com explicações imediatas para cada resposta.
 * ============================================================================
 */

export class QuizEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.questions = [
      {
        id: 1,
        title: "Métrica de Distância no PIBIC",
        question: "Por que no plano de trabalho PIBIC a etapa de particionamento é realizada obrigatoriamente com a Distância Euclidiana Quadrática (d²) em vez da Distância Euclidiana tradicional (√d)?",
        options: [
          { text: "A) Porque a raiz quadrada alteraria a ordem de proximidade entre os pontos e os centróides.", correct: false },
          { text: "B) Porque f(z) = √z é estritamente crescente para z ≥ 0; logo, a ordem de proximidade é idêntica, mas eliminamos a dispendiosa operação de raiz quadrada na CPU.", correct: true },
          { text: "C) Porque a distância euclidiana tradicional não funciona em espaços com mais de 2 dimensões.", correct: false },
          { text: "D) Porque a distância quadrática transforma o algoritmo K-Means em supervisionado.", correct: false }
        ],
        explanation: "Exatamente! Como a função raiz quadrada é monotônica estritamente crescente para números não-negativos, se d²(x, c₁) < d²(x, c₂), então necessariamente √(d²(x, c₁)) < √(d²(x, c₂)). Calcular raiz quadrada milhões de vezes em grandes bases de dados desperdiça ciclos de processador sem mudar nenhum cluster atribuído!"
      },
      {
        id: 2,
        title: "Otimização Matemática da Média",
        question: "Por que na etapa de atualização do K-Means a posição ótima do centróide μₖ é dada rigorosamente pela MÉDIA ARITMÉTICA dos pontos do cluster?",
        options: [
          { text: "A) Foi uma escolha arbitrária de Lloyd apenas para simplificar a programação.", correct: false },
          { text: "B) Porque a derivada de primeira ordem da Soma dos Erros Quadráticos (SSE) em relação a μₖ igualada a zero (∂SSE/∂μₖ = 0) resulta exatamente na média aritmética.", correct: true },
          { text: "C) Porque a mediana geraria clusters com formatos circulares perfeitos.", correct: false },
          { text: "D) Porque a média aritmética impede a ocorrência de mínimos locais.", correct: false }
        ],
        explanation: "Perfeito! A função de custo intra-cluster é J = ∑ ||xᵢ - μₖ||². Derivando em relação a μₖ e igualando a zero: ∂J/∂μₖ = -2 ∑ (xᵢ - μₖ) = 0 ⟹ |Sₖ|·μₖ = ∑ xᵢ ⟹ μₖ = (1/|Sₖ|) ∑ xᵢ. A média aritmética é a solução analítica exata que minimiza os desvios quadráticos!"
      },
      {
        id: 3,
        title: "Garantia de Convergência",
        question: "O algoritmo K-Means de Lloyd tradicional garante convergir para o mínimo global absoluto da inércia SSE?",
        options: [
          { text: "A) Sim, K-Means sempre encontra a partição perfeita e ótima global.", correct: false },
          { text: "B) Não. O K-Means garante convergir para um mínimo LOCAL (ou ponto de sela), sendo altamente sensível à inicialização dos centróides.", correct: true },
          { text: "C) Só garante convergência se K for um número primo.", correct: false },
          { text: "D) O algoritmo nunca converge matematicamente; ele apenas para por limite de iterações.", correct: false }
        ],
        explanation: "Correto! Como a função objetivo do K-Means é não-convexa no espaço das partições discretas, o algoritmo realiza uma descida coordenada que garante parada (pois o número de partições é finito e o SSE nunca aumenta), mas pode ficar preso em mínimos locais ruins. Por isso técnicas como K-Means++ e Fast Codebook são tão cruciais!"
      },
      {
        id: 4,
        title: "Limitações Geométricas (Visão Google ML)",
        question: "Qual das seguintes estruturas de dados faz o K-Means padrão falhar ou produzir partições sem sentido físico?",
        options: [
          { text: "A) Três grupos de pontos esféricos bem separados com densidades similares.", correct: false },
          { text: "B) Clusters em formato de meias-luas entrelaçadas ou anéis concêntricos com raios diferentes.", correct: true },
          { text: "C) Dados bidimensionais normalizados entre 0 e 1.", correct: false },
          { text: "D) Conjuntos com centenas de amostras distribuídas gaussianamente.", correct: false }
        ],
        explanation: "Certíssimo! O K-Means assume implicitamente clusters esféricos (convexos) e de variância similar, particionando o espaço em polígonos convexos de Voronoi através de hiperplanos lineares. Meias-luas e anéis concêntricos exigem algoritmos baseados em densidade ou grafos, como DBSCAN ou Spectral Clustering."
      },
      {
        id: 5,
        title: "Técnica 1: Modified K-Means (Lee / Paliwal)",
        question: "Como a técnica do Modified K-Means proposta por Lee et al. (1997) e refinada por Paliwal (2000) consegue acelerar a convergência e poupar computações?",
        options: [
          { text: "A) Substituindo o cálculo de distâncias por uma rede neural profunda.", correct: false },
          { text: "B) Monitorando o vetor de deslocamento dos centróides (Δμ) entre iterações; se centróides se moveram menos que um limiar δ, pontos de clusters estáveis pulam cálculos redundantes.", correct: true },
          { text: "C) Reduzindo o número de clusters K a cada iteração até sobrar apenas 1.", correct: false },
          { text: "D) Utilizando vetores de números inteiros de 8 bits em vez de ponto flutuante.", correct: false }
        ],
        explanation: "Sensacional! Na prática, após as primeiras iterações do K-Means, muitos centróides praticamente estabilizam (Δμ < δ). O Modified K-Means aproveita essa inércia para ignorar o recálculo de distâncias para centróides distantes e estáveis, reduzindo drasticamente o número total de cálculos de distância por iteração!"
      },
      {
        id: 6,
        title: "Técnica 2: Fast Codebook (Bilal et al., 2021)",
        question: "Qual o princípio da Geração Rápida de Codebook (Fast Codebook / Pattern Masking) investigada na literatura do PIBIC?",
        options: [
          { text: "A) Dispersar estrategicamente os centróides iniciais no espaço de características maximizando a separação preliminar, evitando iterações redundantes de aproximação.", correct: true },
          { text: "B) Executar o K-Means apenas em 10% dos pixels e descartar os outros 90%.", correct: false },
          { text: "C) Eliminar a etapa de atualização dos centróides.", correct: false },
          { text: "D) Executar o algoritmo em ordem reversa, dos centróides finais para os iniciais.", correct: false }
        ],
        explanation: "Excelente! Em Quantização Vetorial de Imagens, grande parte das iterações do K-Means clássico serve apenas para 'desembolar' sementes que começaram próximas por azar da aleatoriedade. O Fast Codebook cria centróides preliminares já bem espalhados ao longo dos eixos de máxima variância, diminuindo as iterações de convergência de dezenas para apenas 5 a 10!"
      }
    ];

    this.userAnswers = {};
    this.render();
  }

  handleSelect(questionIdx, optionIdx) {
    if (this.userAnswers[questionIdx] !== undefined) return; // já respondeu

    this.userAnswers[questionIdx] = optionIdx;
    this.render();
  }

  render() {
    if (!this.container) return;

    let score = 0;
    let answeredCount = 0;

    for (let i = 0; i < this.questions.length; i++) {
      if (this.userAnswers[i] !== undefined) {
        answeredCount++;
        if (this.questions[i].options[this.userAnswers[i]].correct) {
          score++;
        }
      }
    }

    let html = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge-pibic">Desafio Interativo</span>
          <h3 style="font-size: 1.5rem; font-weight: 800; color: #ffffff; margin-top: 0.3rem;">
            Quiz: K-Means Sem Medo 🌸
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">
            Teste seus conhecimentos sobre o algoritmo, a matemática do PIBIC e os conceitos avançados de aprendizagem de máquina.
          </p>
        </div>
        <div class="stat-card" style="min-width: 170px; text-align: center; border-color: var(--pink-border-active);">
          <span class="stat-label">Sua Pontuação</span>
          <span class="stat-value" style="font-size: 1.8rem;">${score} / ${this.questions.length}</span>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">${answeredCount} de ${this.questions.length} respondidas</span>
        </div>
      </div>
    `;

    this.questions.forEach((q, qIdx) => {
      const selected = this.userAnswers[qIdx];
      const isAnswered = (selected !== undefined);

      html += `
        <div class="quiz-card">
          <div class="quiz-question">
            <span class="quiz-q-num">#0${q.id}</span>
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--pink-bright); margin-bottom: 0.2rem;">
                ${q.title}
              </div>
              <div>${q.question}</div>
            </div>
          </div>

          <div class="quiz-options">
            ${q.options.map((opt, optIdx) => {
              let optClass = 'quiz-opt';
              if (isAnswered) {
                if (opt.correct) optClass += ' selected-correct';
                else if (selected === optIdx) optClass += ' selected-wrong';
              }
              return `
                <div class="${optClass}" data-q="${qIdx}" data-opt="${optIdx}">
                  <span style="font-weight: 700; color: ${isAnswered && opt.correct ? '#10b981' : (isAnswered && selected === optIdx ? '#f43f5e' : 'var(--text-muted)')};">
                    ${isAnswered && opt.correct ? '✓' : (isAnswered && selected === optIdx ? '✗' : '○')}
                  </span>
                  <span>${opt.text}</span>
                </div>
              `;
            }).join('')}
          </div>

          ${isAnswered ? `
            <div class="quiz-feedback show ${q.options[selected].correct ? 'correct' : 'wrong'}">
              <strong>${q.options[selected].correct ? '🎉 Resposta Correta!' : '⚠️ Não foi dessa vez!'}</strong><br>
              ${q.explanation}
            </div>
          ` : ''}
        </div>
      `;
    });

    if (answeredCount === this.questions.length) {
      html += `
        <div class="card card-highlight" style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎓</div>
          <h3 style="font-size: 1.4rem; color: #ffffff; font-weight: 800; margin-bottom: 0.4rem;">
            ${score === this.questions.length ? 'Incrível! Você dominou o K-Means Sem Medo!' : 'Parabéns por concluir o desafio!'}
          </h3>
          <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 1.25rem auto;">
            Você acertou <strong>${score} de ${this.questions.length}</strong> questões. Você agora possui uma base sólida em otimização de centróides, distância euclidiana quadrática e técnicas de aceleração para seu PIBIC.
          </p>
          <button id="btnResetQuiz" class="btn btn-primary btn-sm">↺ Refazer Quiz</button>
        </div>
      `;
    }

    this.container.innerHTML = html;

    // Conecta eventos de clique nas opções
    const optEls = this.container.querySelectorAll('.quiz-opt');
    optEls.forEach(el => {
      el.addEventListener('click', () => {
        const qIdx = parseInt(el.getAttribute('data-q'), 10);
        const optIdx = parseInt(el.getAttribute('data-opt'), 10);
        this.handleSelect(qIdx, optIdx);
      });
    });

    const btnReset = document.getElementById('btnResetQuiz');
    if (btnReset) {
      btnReset.onclick = () => {
        this.userAnswers = {};
        this.render();
      };
    }
  }
}

