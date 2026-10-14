"""Módulo de métricas de distância para particionamento no K-Means.

Conforme especificado no Objetivo Específico do plano de trabalho:
"a etapa de particionamento é realizada com o uso da distância euclidiana quadrática."
"""

from typing import Union, Sequence, List
import math

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    np = None


Vector = Union[Sequence[float], "np.ndarray"]
Matrix = Union[Sequence[Sequence[float]], "np.ndarray"]


def squared_euclidean_distance(point_a: Vector, point_b: Vector) -> float:
    """Calcula a distância euclidiana quadrática entre dois vetores.

    d²(x, y) = sum((x_i - y_i)²)

    Evita o cálculo oneroso da raiz quadrada, acelerando as comparações
    de distância em grandes bases de dados e espaços multidimensionais.

    Parameters
    ----------
    point_a : Vector
        Primeiro vetor (ponto ou centróide).
    point_b : Vector
        Segundo vetor (ponto ou centróide).

    Returns
    -------
    float
        Valor da distância euclidiana quadrática.
    """
    if len(point_a) != len(point_b):
        raise ValueError(
            f"Dimensões incompatíveis: {len(point_a)} != {len(point_b)}"
        )

    if HAS_NUMPY and isinstance(point_a, np.ndarray) and isinstance(point_b, np.ndarray):
        diff = point_a - point_b
        return float(np.sum(diff * diff))

    total = 0.0
    for a, b in zip(point_a, point_b):
        d = float(a) - float(b)
        total += d * d
    return total


def euclidean_distance(point_a: Vector, point_b: Vector) -> float:
    """Calcula a distância euclidiana padrão entre dois vetores.

    d(x, y) = sqrt(sum((x_i - y_i)²))
    """
    return math.sqrt(squared_euclidean_distance(point_a, point_b))


def pairwise_squared_distances(X: Matrix, centers: Matrix) -> List[List[float]]:
    """Calcula matriz de distâncias euclidianas quadráticas entre amostras e centróides.

    Parameters
    ----------
    X : Matrix
        Amostras de dados, formato (n_samples, n_features).
    centers : Matrix
        Centróides atuais, formato (n_clusters, n_features).

    Returns
    -------
    List[List[float]]
        Matriz de distâncias onde o elemento [i][j] é a distância entre
        a amostra i e o centróide j.
    """
    if HAS_NUMPY and isinstance(X, np.ndarray) and isinstance(centers, np.ndarray):
        # Utiliza broadcasting para aceleração vetorial quando numpy estiver disponível
        # (X[:, np.newaxis, :] - centers[np.newaxis, :, :]) ** 2
        diff = X[:, np.newaxis, :] - centers[np.newaxis, :, :]
        return (diff ** 2).sum(axis=2)

    distances = []
    for x in X:
        row = [squared_euclidean_distance(x, c) for c in centers]
        distances.append(row)
    return distances

