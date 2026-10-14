"""K-Means Iteration Reduction Library (PIBIC).

Estudo e Avaliação de Técnicas de Redução do Número de Iterações do Algoritmo K-Means.
"""

from kmeans_reduction.distance import (
    squared_euclidean_distance,
    euclidean_distance,
    pairwise_squared_distances,
)
from kmeans_reduction.base import BaseKMeans, KMeansResult
from kmeans_reduction.standard_kmeans import StandardKMeans
from kmeans_reduction.techniques.modified_kmeans import ModifiedKMeans
from kmeans_reduction.techniques.fast_codebook import FastCodebookKMeans
from kmeans_reduction.metrics import (
    calculate_inertia,
    calculate_mean_squared_error,
    calculate_psnr,
    calculate_reduction_percentage,
    compare_kmeans_results,
)

__version__ = "0.1.0"

__all__ = [
    "squared_euclidean_distance",
    "euclidean_distance",
    "pairwise_squared_distances",
    "BaseKMeans",
    "KMeansResult",
    "StandardKMeans",
    "ModifiedKMeans",
    "FastCodebookKMeans",
    "calculate_inertia",
    "calculate_mean_squared_error",
    "calculate_psnr",
    "calculate_reduction_percentage",
    "compare_kmeans_results",
]

