"""Aplicação: Particionamento e Avaliação em Conjuntos de Dados de Benchmark."""

import random
from typing import List, Dict, Any, Tuple
from kmeans_reduction.base import BaseKMeans


def generate_synthetic_blobs(
    n_samples: int = 300,
    n_features: int = 2,
    centers: int = 3,
    cluster_std: float = 1.0,
    random_state: int = 42,
) -> Tuple[List[List[float]], List[int]]:
    """Gera pontos distribuídos em agrupamentos gaussianos sintéticos.

    Permite testar e validar algoritmos sem depender de bibliotecas externas pesadas.
    """
    rng = random.Random(random_state)
    true_centers = [
        [rng.uniform(-10.0, 10.0) for _ in range(n_features)]
        for _ in range(centers)
    ]

    data = []
    labels = []
    samples_per_cluster = n_samples // centers

    for c_idx, center in enumerate(true_centers):
        for _ in range(samples_per_cluster):
            point = [
                center[f] + rng.gauss(0.0, cluster_std)
                for f in range(n_features)
            ]
            data.append(point)
            labels.append(c_idx)

    return data, labels


class BenchmarkRunner:
    """Executor de benchmarks comparativos entre variantes do K-Means."""

    def __init__(self, models: Dict[str, BaseKMeans]) -> None:
        """Inicializa o runner com um dicionário de modelos rotulados.

        Parameters
        ----------
        models : Dict[str, BaseKMeans]
            Exemplo: {"Standard": StandardKMeans(), "Modified": ModifiedKMeans()}
        """
        self.models = models

    def run(self, X: List[List[float]]) -> Dict[str, Dict[str, Any]]:
        """Executa todos os modelos sobre os dados X e coleta métricas de iterações e tempo."""
        results = {}
        for name, model in self.models.items():
            model.fit(X)
            results[name] = {
                "n_iter": model.n_iter_,
                "inertia": model.inertia_,
                "elapsed_time_sec": model.result_.elapsed_time_sec if model.result_ else 0.0,
            }
        return results

