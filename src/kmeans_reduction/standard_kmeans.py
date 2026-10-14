"""Implementação de linha de base: Algoritmo K-Means Tradicional (Lloyd).

Utiliza a distância euclidiana quadrática para a etapa de partição,
conforme os requisitos do plano de trabalho PIBIC.
"""

import time
from typing import Any, List, Sequence, Optional

from kmeans_reduction.base import BaseKMeans, KMeansResult
from kmeans_reduction.distance import squared_euclidean_distance


class StandardKMeans(BaseKMeans):
    """Algoritmo K-Means convencional (Lloyd's Algorithm) - Linha de Base (Baseline).

    Esta classe serve como referência comparativa para quantificar a redução
    no número de iterações e no tempo computacional proporcionados pelas técnicas
    estudadas no plano de trabalho.
    """

    def __init__(
        self,
        n_clusters: int = 8,
        max_iter: int = 300,
        tol: float = 1e-4,
        random_state: Optional[int] = None,
    ) -> None:
        super().__init__(
            n_clusters=n_clusters,
            max_iter=max_iter,
            tol=tol,
            random_state=random_state,
        )

    def fit(self, X: Sequence[Sequence[float]]) -> "StandardKMeans":
        """Executa o particionamento K-Means de Lloyd tradicional.

        Parameters
        ----------
        X : Sequence[Sequence[float]]
            Conjunto de dados com formato (n_samples, n_features).

        Returns
        -------
        StandardKMeans
            A própria instância ajustada.
        """
        start_time = time.perf_counter()

        n_samples = len(X)
        if n_samples == 0:
            raise ValueError("O conjunto de dados X não pode ser vazio.")
        n_features = len(X[0])

        # 1. Inicialização dos centróides
        centroids = self._init_centroids(X)
        history: List[float] = []

        labels = [0] * n_samples
        iteration = 0

        for iteration in range(1, self.max_iter + 1):
            # 2. Etapa de Associação (Particionamento) via Distância Euclidiana Quadrática
            for i, point in enumerate(X):
                min_dist = float("inf")
                best_c = 0
                for c_idx, center in enumerate(centroids):
                    dist = squared_euclidean_distance(point, center)
                    if dist < min_dist:
                        min_dist = dist
                        best_c = c_idx
                labels[i] = best_c

            # 3. Etapa de Atualização dos Centróides (Média dos membros)
            cluster_sums = [[0.0] * n_features for _ in range(self.n_clusters)]
            cluster_counts = [0] * self.n_clusters

            for point, label in zip(X, labels):
                cluster_counts[label] += 1
                for f in range(n_features):
                    cluster_sums[label][f] += float(point[f])

            new_centroids = []
            max_shift = 0.0

            for c_idx in range(self.n_clusters):
                count = cluster_counts[c_idx]
                if count > 0:
                    new_center = [cluster_sums[c_idx][f] / count for f in range(n_features)]
                else:
                    # Em caso de cluster vazio, mantém a posição anterior
                    new_center = list(centroids[c_idx])

                shift = squared_euclidean_distance(centroids[c_idx], new_center)
                if shift > max_shift:
                    max_shift = shift
                new_centroids.append(new_center)

            centroids = new_centroids
            current_inertia = self._compute_inertia(X, labels, centroids)
            history.append(current_inertia)

            # 4. Critério de parada: convergência dos centróides abaixo de tol
            if max_shift <= self.tol:
                break

        elapsed_time = time.perf_counter() - start_time
        final_inertia = self._compute_inertia(X, labels, centroids)

        self.cluster_centers_ = centroids
        self.labels_ = labels
        self.n_iter_ = iteration
        self.inertia_ = final_inertia

        self.result_ = KMeansResult(
            cluster_centers=centroids,
            labels=labels,
            n_iter=iteration,
            inertia=final_inertia,
            elapsed_time_sec=elapsed_time,
            history=history,
            metadata={"algorithm": "StandardKMeans (Lloyd)"},
        )

        return self

