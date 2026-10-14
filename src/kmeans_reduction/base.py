"""Interface base e estruturas de dados para algoritmos K-Means e variantes."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional, Any, Sequence, Union
import random
import time

from kmeans_reduction.distance import squared_euclidean_distance

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    np = None


@dataclass
class KMeansResult:
    """Estrutura com os resultados da convergência e métricas do K-Means.

    Attributes
    ----------
    cluster_centers : list or np.ndarray
        Coordenadas dos centróides finais (tamanho n_clusters x n_features).
    labels : list or np.ndarray
        Índice do cluster atribuído a cada ponto de dados.
    n_iter : int
        Número de iterações executadas até a convergência ou max_iter.
    inertia : float
        Soma das distâncias euclidianas quadráticas dos pontos aos seus
        respectivos centróides (critério SSE / distorção).
    elapsed_time_sec : float
        Tempo total de execução do ajuste em segundos.
    history : list, optional
        Histórico de inércia ou centróides ao longo das iterações para análise.
    metadata : dict
        Metadados adicionais específicos da técnica (ex: cálculos de distância poupados).
    """
    cluster_centers: Any
    labels: List[int]
    n_iter: int
    inertia: float
    elapsed_time_sec: float = 0.0
    history: List[float] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)


class BaseKMeans(ABC):
    """Classe base abstrata para o algoritmo K-Means e técnicas de redução de iterações.

    Define os métodos obrigatórios para manter uma interface uniforme entre o
    algoritmo tradicional e as técnicas avançadas de aceleração.
    """

    def __init__(
        self,
        n_clusters: int = 8,
        max_iter: int = 300,
        tol: float = 1e-4,
        random_state: Optional[int] = None,
    ) -> None:
        """Inicializa parâmetros comuns de clusterização.

        Parameters
        ----------
        n_clusters : int, default=8
            Número de grupos (clusters) ou tamanho do codebook.
        max_iter : int, default=300
            Número máximo de iterações permitidas.
        tol : float, default=1e-4
            Tolerância de variação dos centróides para declarar convergência.
        random_state : int, optional
            Semente para reprodutibilidade da inicialização aleatória.
        """
        if n_clusters <= 0:
            raise ValueError(f"n_clusters deve ser > 0, recebido: {n_clusters}")
        if max_iter <= 0:
            raise ValueError(f"max_iter deve ser > 0, recebido: {max_iter}")
        if tol < 0:
            raise ValueError(f"tol deve ser >= 0, recebido: {tol}")

        self.n_clusters = n_clusters
        self.max_iter = max_iter
        self.tol = tol
        self.random_state = random_state

        self.cluster_centers_: Optional[Any] = None
        self.labels_: Optional[List[int]] = None
        self.n_iter_: int = 0
        self.inertia_: float = float("inf")
        self.result_: Optional[KMeansResult] = None

    def _init_centroids(self, X: Sequence[Sequence[float]]) -> List[List[float]]:
        """Inicializa os centróides selecionando k amostras aleatórias de X."""
        n_samples = len(X)
        if n_samples < self.n_clusters:
            raise ValueError(
                f"n_samples ({n_samples}) deve ser maior ou igual a n_clusters ({self.n_clusters})"
            )

        rng = random.Random(self.random_state)
        indices = rng.sample(range(n_samples), self.n_clusters)
        
        # Converte para listas padrão de floats
        centers = []
        for idx in indices:
            row = [float(val) for val in X[idx]]
            centers.append(row)
        return centers

    def _compute_inertia(
        self,
        X: Sequence[Sequence[float]],
        labels: Sequence[int],
        centers: Sequence[Sequence[float]],
    ) -> float:
        """Calcula a inércia (SSE) com base na distância euclidiana quadrática."""
        total_inertia = 0.0
        for x, label in zip(X, labels):
            center = centers[label]
            total_inertia += squared_euclidean_distance(x, center)
        return total_inertia

    @abstractmethod
    def fit(self, X: Any) -> "BaseKMeans":
        """Executa o agrupamento K-Means sobre os dados X.

        Deve atualizar:
        - self.cluster_centers_
        - self.labels_
        - self.n_iter_
        - self.inertia_
        - self.result_
        """
        pass

    def predict(self, X: Any) -> List[int]:
        """Atribui cada amostra de X ao centróide mais próximo usando distância euclidiana quadrática.

        Parameters
        ----------
        X : Sequence[Sequence[float]] ou np.ndarray
            Amostras de dados.

        Returns
        -------
        List[int]
            Lista com os índices dos centróides associados.
        """
        if self.cluster_centers_ is None:
            raise RuntimeError("O modelo precisa ser treinado com fit() antes de chamar predict().")

        labels = []
        for point in X:
            best_idx = 0
            best_dist = float("inf")
            for c_idx, center in enumerate(self.cluster_centers_):
                dist = squared_euclidean_distance(point, center)
                if dist < best_dist:
                    best_dist = dist
                    best_idx = c_idx
            labels.append(best_idx)
        return labels

    def fit_predict(self, X: Any) -> List[int]:
        """Ajusta o modelo aos dados e retorna as atribuições de rótulos."""
        self.fit(X)
        if self.labels_ is not None:
            return self.labels_
        return self.predict(X)

