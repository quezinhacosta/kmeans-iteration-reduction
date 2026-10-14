"""Técnica 2: Geração Acelerada de Codebook / Máscaras de Padrão (Bilal et al., 2021).

Referência no plano de trabalho:
- BILAL, M.; ULLAH, Z.; ISLAM, I. U. Fast Codebook Generation Using Pattern Based Masking
  Algorithm for Image Compression. IEEE Access, v. 9, pp. 98904–98915, 2021.
- CALAZANS, R. S. H. et al. Inicialização do Algoritmo do Vagalume Aplicado ao Projeto
  de Dicionários. CBIC, 2019.
- LIMA, V. S. et al. On the Initialization of Swarm Intelligence Algorithms for
  Vector Quantization Codebook Design. Sensors, v. 24, p. 2606, 2024.

Conceito-chave:
A inicialização e pré-seleção orientada por padrões (pattern masking) acelera a convergência
do algoritmo K-Means gerando um conjunto inicial de centróides (codebook) mais bem distribuído
no espaço das características. Isso reduz expressivamente o número de iterações necessárias
para que o particionamento atinja a convergência com distância euclidiana quadrática.
"""

import time
import random
from typing import Any, List, Sequence, Optional

from kmeans_reduction.base import BaseKMeans, KMeansResult
from kmeans_reduction.distance import squared_euclidean_distance


class FastCodebookKMeans(BaseKMeans):
    """K-Means com Inicialização e Geração Rápida de Codebook baseada em Padrões.

    Esta classe representa o esqueleto inicial da Técnica 2 para o bolsista PIBIC,
    estruturada para quantização vetorial de imagens e clustering geral.
    """

    def __init__(
        self,
        n_clusters: int = 8,
        max_iter: int = 300,
        tol: float = 1e-4,
        init_strategy: str = "pattern_spread",
        random_state: Optional[int] = None,
    ) -> None:
        """Inicializa o Fast Codebook K-Means.

        Parameters
        ----------
        init_strategy : str, default="pattern_spread"
            Estratégia de dispersão/mascaramento de padrões ("pattern_spread", "k-means++", "random").
        """
        super().__init__(
            n_clusters=n_clusters,
            max_iter=max_iter,
            tol=tol,
            random_state=random_state,
        )
        self.init_strategy = init_strategy

    def _init_pattern_centroids(self, X: Sequence[Sequence[float]]) -> List[List[float]]:
        """Inicialização acelerada inspirada no espalhamento de padrões (Bilal et al., 2021).

        Seleciona sementes representativas com máxima separação mútua no espaço de características
        usando distância euclidiana quadrática.
        """
        n_samples = len(X)
        if n_samples < self.n_clusters:
            raise ValueError("n_samples deve ser maior ou igual a n_clusters.")

        rng = random.Random(self.random_state)
        first_idx = rng.randint(0, n_samples - 1)
        centroids = [[float(v) for v in X[first_idx]]]

        for _ in range(1, self.n_clusters):
            # Para cada ponto, calcula a menor distância aos centróides já escolhidos
            max_dist = -1.0
            best_candidate = X[0]

            # Amostra um subconjunto de candidatos para eficiência computacional
            candidate_indices = rng.sample(range(n_samples), min(n_samples, 50))
            for idx in candidate_indices:
                point = X[idx]
                min_to_existing = min(
                    squared_euclidean_distance(point, c) for c in centroids
                )
                if min_to_existing > max_dist:
                    max_dist = min_to_existing
                    best_candidate = point

            centroids.append([float(v) for v in best_candidate])

        return centroids

    def fit(self, X: Sequence[Sequence[float]]) -> "FastCodebookKMeans":
        """Executa o agrupamento com inicialização acelerada baseada em padrões.

        Parameters
        ----------
        X : Sequence[Sequence[float]]
            Conjunto de dados de entrada.

        Returns
        -------
        FastCodebookKMeans
            A própria instância ajustada.
        """
        start_time = time.perf_counter()

        n_samples = len(X)
        if n_samples == 0:
            raise ValueError("O conjunto de dados X não pode ser vazio.")
        n_features = len(X[0])

        # Inicialização com espalhamento de padrões para convergência rápida
        if self.init_strategy == "pattern_spread":
            centroids = self._init_pattern_centroids(X)
        else:
            centroids = self._init_centroids(X)

        history: List[float] = []
        labels = [0] * n_samples
        iteration = 0

        for iteration in range(1, self.max_iter + 1):
            # Etapa de particionamento (distância euclidiana quadrática)
            for i, point in enumerate(X):
                min_dist = float("inf")
                best_c = 0
                for c_idx, center in enumerate(centroids):
                    dist = squared_euclidean_distance(point, center)
                    if dist < min_dist:
                        min_dist = dist
                        best_c = c_idx
                labels[i] = best_c

            # Etapa de atualização dos centróides
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

        self.result_ = KMeansResult(
            cluster_centers=centroids,
            labels=labels,
            n_iter=iteration,
            inertia=final_inertia,
            elapsed_time_sec=elapsed_time,
            history=history,
            metadata={
                "algorithm": "FastCodebookKMeans (Bilal et al., 2021)",
                "init_strategy": self.init_strategy,
            },
        )

        return self

