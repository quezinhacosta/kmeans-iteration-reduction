"""Técnica 1: Algoritmo K-Means Modificado (Lee et al., 1997; Paliwal & Ramasubramanian, 2000).

Referência no plano de trabalho:
- LEE, D.; BAEK, S.; SUNG, K. Modified K-means Algorithm for Vector Quantizer Design.
  IEEE Signal Processing Letters, v. 4, n. 1, pp. 2-4, 1997.
- PALIWAL, K. K.; RAMASUBRAMANIAN, V. Comments on "Modified K-means Algorithm for Vector
  Quantizer Design". IEEE Transactions on Image Processing, v. 9, n. 11, pp. 1964-1967, 2000.

Conceito-chave:
O K-Means modificado monitora o deslocamento dos centróides entre iterações consecutivas.
Se um centróide se deslocou menos que um limiar delta, pontos que já pertenciam a clusters
estáveis podem pular cálculos redundantes de distância, reduzindo o número total de operações
e acelerando o número de iterações necessárias para a estabilização da quantização vetorial.
"""

import time
from typing import Any, List, Sequence, Optional

from kmeans_reduction.base import BaseKMeans, KMeansResult
from kmeans_reduction.distance import squared_euclidean_distance


class ModifiedKMeans(BaseKMeans):
    """K-Means Modificado para redução de iterações e cálculos redundantes de distância.

    Esta classe representa o esqueleto inicial da Técnica 1 para o bolsista PIBIC,
    estruturada para receber os refinamentos da pesquisa bibliográfica.
    """

    def __init__(
        self,
        n_clusters: int = 8,
        max_iter: int = 300,
        tol: float = 1e-4,
        activity_threshold: float = 1e-3,
        random_state: Optional[int] = None,
    ) -> None:
        """Inicializa o K-Means Modificado.

        Parameters
        ----------
        activity_threshold : float, default=1e-3
            Limiar de movimentação de centróides para determinar atividade/estabilidade.
        """
        super().__init__(
            n_clusters=n_clusters,
            max_iter=max_iter,
            tol=tol,
            random_state=random_state,
        )
        self.activity_threshold = activity_threshold
        self.distance_calculations_saved_ = 0

    def fit(self, X: Sequence[Sequence[float]]) -> "ModifiedKMeans":
        """Executa a partição com monitoramento de atividade de centróides.

        Parameters
        ----------
        X : Sequence[Sequence[float]]
            Conjunto de dados de entrada.

        Returns
        -------
        ModifiedKMeans
            A própria instância ajustada.
        """
        start_time = time.perf_counter()

        n_samples = len(X)
        if n_samples == 0:
            raise ValueError("O conjunto de dados X não pode ser vazio.")
        n_features = len(X[0])

        centroids = self._init_centroids(X)
        history: List[float] = []
        labels = [0] * n_samples

        centroid_shifts = [float("inf")] * self.n_clusters
        saved_calcs = 0
        iteration = 0

        for iteration in range(1, self.max_iter + 1):
            # Identifica centróides que se moveram significativamente
            active_clusters = [
                c_idx for c_idx, shift in enumerate(centroid_shifts)
                if shift > self.activity_threshold or iteration == 1
            ]
            if not active_clusters:
                active_clusters = list(range(self.n_clusters))

            # Atribuição de amostras (usando distância euclidiana quadrática)
            for i, point in enumerate(X):
                current_label = labels[i]
                # Se o cluster do ponto for estável e nenhum outro cluster próximo mudou,
                # pode-se otimizar a checagem (conforme Lee et al., 1997)
                min_dist = squared_euclidean_distance(point, centroids[current_label])
                best_c = current_label

                for c_idx in active_clusters:
                    if c_idx == current_label:
                        continue
                    dist = squared_euclidean_distance(point, centroids[c_idx])
                    if dist < min_dist:
                        min_dist = dist
                        best_c = c_idx

                saved_calcs += (self.n_clusters - len(active_clusters))
                labels[i] = best_c

            # Atualização dos centróides
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
                    new_center = list(centroids[c_idx])

                shift = squared_euclidean_distance(centroids[c_idx], new_center)
                centroid_shifts[c_idx] = shift
                if shift > max_shift:
                    max_shift = shift
                new_centroids.append(new_center)

            centroids = new_centroids
            current_inertia = self._compute_inertia(X, labels, centroids)
            history.append(current_inertia)

            if max_shift <= self.tol:
                break

        elapsed_time = time.perf_counter() - start_time
        final_inertia = self._compute_inertia(X, labels, centroids)

        self.cluster_centers_ = centroids
        self.labels_ = labels
        self.n_iter_ = iteration
        self.inertia_ = final_inertia
        self.distance_calculations_saved_ = max(0, saved_calcs)

        self.result_ = KMeansResult(
            cluster_centers=centroids,
            labels=labels,
            n_iter=iteration,
            inertia=final_inertia,
            elapsed_time_sec=elapsed_time,
            history=history,
            metadata={
                "algorithm": "ModifiedKMeans (Lee et al., 1997; Paliwal & Ramasubramanian, 2000)",
                "distance_calculations_saved": self.distance_calculations_saved_,
                "activity_threshold": self.activity_threshold,
            },
        )

        return self

