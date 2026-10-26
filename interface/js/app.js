/**
 * ============================================================================
 * K-MEANS SEM MEDO - APLICAÇÃO PRINCIPAL (APP BOOTSTRAP)
 * ============================================================================
 * Inspirado no repositório MIPS Sem Medo:
 * Roteamento de abas, atalhos de teclado, controle de estado
 * e inicialização de todos os módulos interativos.
 * ============================================================================
 */

import { CanvasVisualizer } from './canvas-visualizer.js';
import { DevMediaCalculator } from './devmedia-calculator.js';
import { ElbowSilhouetteTool } from './elbow-silhouette.js';
import { ImageVQSimulator } from './image-vq.js';
import { PIBICBenchmarkTool } from './pibic-benchmark.js';
import { QuizEngine } from './quiz-engine.js';
import { FormulasViewer } from './formulas.js';

class App {
  constructor() {
    this.currentTab = 'overview';
    this.visualizer = null;
    this.devMediaCalc = null;
    this.elbowTool = null;
    this.imageVQ = null;
    this.pibicBenchmark = null;
    this.quiz = null;
    this.formulas = null;

    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindKeyboardShortcuts();
    this.initVisualizer();
    this.initInteractiveModules();
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabTarget = item.getAttribute('data-tab');
        this.switchTab(tabTarget);

        // Fecha sidebar no mobile após clique
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Botão de Toggle da Sidebar (Mobile)
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Botão "Explorar no Playground" da tela inicial
    const btnHeroPlayground = document.getElementById('btnHeroPlayground');
    if (btnHeroPlayground) {
      btnHeroPlayground.addEventListener('click', () => {
        this.switchTab('playground');
      });
    }

    const btnHeroDevMedia = document.getElementById('btnHeroDevMedia');
    if (btnHeroDevMedia) {
      btnHeroDevMedia.addEventListener('click', () => {
        this.switchTab('devmedia');
      });
    }
  }

  switchTab(tabName) {
    if (!tabName) return;
    this.currentTab = tabName;

    // Atualiza classes ativas na Sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Exibe módulo de conteúdo correto
    const modules = document.querySelectorAll('.content-module');
    modules.forEach(mod => {
      if (mod.id === `module-${tabName}`) {
        mod.classList.add('active');
      } else {
        mod.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Se mudou para a aba playground ou elbow, redimensiona os canvas
    if (tabName === 'playground' && this.visualizer) {
      setTimeout(() => {
        this.visualizer.resizeCanvas();
        this.visualizer.render();
      }, 50);
    } else if (tabName === 'elbow' && this.elbowTool) {
      setTimeout(() => {
        this.elbowTool.renderCharts();
      }, 50);
    }
  }

  initVisualizer() {
    this.visualizer = new CanvasVisualizer('clusteringCanvas', 'sseChartCanvas');

    // Conecta botões do Visualizador
    const btnPlay = document.getElementById('btnPlay');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.visualizer.togglePlay();
        btnPlay.innerText = this.visualizer.isPlaying ? '⏸ Pausar' : '▶ Executar';
      });
    }

    const btnStep = document.getElementById('btnStep');
    if (btnStep) {
      btnStep.addEventListener('click', () => {
        this.visualizer.step();
      });
    }

    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.visualizer.reset();
        if (btnPlay) btnPlay.innerText = '▶ Executar';
      });
    }

    // Seletor de K
    const sliderK = document.getElementById('sliderK');
    const labelKVal = document.getElementById('labelKVal');
    if (sliderK) {
      sliderK.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (labelKVal) labelKVal.innerText = val;
        this.visualizer.setK(val);
      });
    }

    // Seletor de Presets de Dados
    const selectPreset = document.getElementById('selectPreset');
    if (selectPreset) {
      selectPreset.addEventListener('change', (e) => {
        this.visualizer.setDataset(e.target.value);
      });
    }

    // Seletor de Inicialização
    const selectInit = document.getElementById('selectInit');
    if (selectInit) {
      selectInit.addEventListener('change', (e) => {
        this.visualizer.setInitMethod(e.target.value);
      });
    }

    // Seletor de Velocidade
    const sliderSpeed = document.getElementById('sliderSpeed');
    const labelSpeedVal = document.getElementById('labelSpeedVal');
    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (labelSpeedVal) labelSpeedVal.innerText = `${val.toFixed(1)}x`;
        this.visualizer.setSpeed(val);
      });
    }

    // Toggles de Camadas
    const chkVoronoi = document.getElementById('chkLayerVoronoi');
    if (chkVoronoi) {
      chkVoronoi.addEventListener('change', (e) => {
        this.visualizer.showVoronoi = e.target.checked;
        this.visualizer.render();
      });
    }

    const chkTrajectories = document.getElementById('chkLayerTrajectories');
    if (chkTrajectories) {
      chkTrajectories.addEventListener('change', (e) => {
        this.visualizer.showTrajectories = e.target.checked;
        this.visualizer.render();
      });
    }

    const chkLines = document.getElementById('chkLayerLines');
    if (chkLines) {
      chkLines.addEventListener('change', (e) => {
        this.visualizer.showLines = e.target.checked;
        this.visualizer.render();
      });
    }

    const chkRadii = document.getElementById('chkLayerRadii');
    if (chkRadii) {
      chkRadii.addEventListener('change', (e) => {
        this.visualizer.showRadii = e.target.checked;
        this.visualizer.render();
      });
    }
  }

  initInteractiveModules() {
    this.devMediaCalc = new DevMediaCalculator('devmediaCalculatorContainer');
    this.elbowTool = new ElbowSilhouetteTool('elbowCanvas', 'silhouetteCanvas');
    this.imageVQ = new ImageVQSimulator('vqOriginalCanvas', 'vqQuantizedCanvas', 'vqPaletteContainer');
    this.pibicBenchmark = new PIBICBenchmarkTool('pibicBenchmarkContainer');
    this.quiz = new QuizEngine('quizContainer');
    this.formulas = new FormulasViewer('formulasContainer');
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignora atalhos se o foco estiver em um input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.currentTab === 'playground' && this.visualizer) {
          this.visualizer.togglePlay();
          const btnPlay = document.getElementById('btnPlay');
          if (btnPlay) btnPlay.innerText = this.visualizer.isPlaying ? '⏸ Pausar' : '▶ Executar';
        }
      } else if (e.code === 'KeyS') {
        if (this.currentTab === 'playground' && this.visualizer) {
          this.visualizer.step();
        }
      } else if (e.code === 'KeyR') {
        if (this.currentTab === 'playground' && this.visualizer) {
          this.visualizer.reset();
          const btnPlay = document.getElementById('btnPlay');
          if (btnPlay) btnPlay.innerText = '▶ Executar';
        }
      }
    });
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.kmeansApp = new App();
});

