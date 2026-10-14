"""Módulo de métricas de avaliação e comparação de desempenho."""

import math
from typing import Sequence, Dict, Any
from kmeans_reduction.distance import squared_euclidean_distance
from kmeans_reduction.base import KMeansResult


def calculate_inertia(
    X: Sequence[Sequence[float]],
    labels: Sequence[int],
    centers: Sequence[Sequence[float]],
) -> float:
    """Calcula a inércia total (Soma dos Erros Quadráticos - SSE).

    Inércia = sum(||x_i - c_{label_i}||²)
    """
    total = 0.0
    for x, label in zip(X, labels):
        total += squared_euclidean_distance(x, centers[label])
    return total


def calculate_mean_squared_error(
    original: Sequence[Sequence[float]],
    reconstructed: Sequence[Sequence[float]],
) -> float:
    """Calcula o Erro Quadrático Médio (MSE) entre vetores originais e reconstruídos."""
    n_samples = len(original)
    if n_samples == 0:
        return 0.0
    total_sq_err = 0.0
    total_elements = 0
    for orig_row, rec_row in zip(original, reconstructed):
        for o_val, r_val in zip(orig_row, rec_row):
            diff = float(o_val) - float(r_val)
            total_sq_err += diff * diff
            total_elements += 1
    return total_sq_err / max(1, total_elements)


def calculate_psnr(
    original: Sequence[Sequence[float]],
    reconstructed: Sequence[Sequence[float]],
    max_val: float = 255.0,
) -> float:
    """Calcula a Relação Sinal-Ruído de Pico (PSNR) em decibéis (dB).

    Muito utilizada em Quantização Vetorial para compressão de imagens.
    PSNR = 10 * log10(max_val² / MSE)
    """
    mse = calculate_mean_squared_error(original, reconstructed)
    if mse <= 1e-12:
        return float("inf")
    return 10.0 * math.log10((max_val * max_val) / mse)


def calculate_reduction_percentage(baseline_value: float, candidate_value: float) -> float:
    """Calcula a redução percentual obtida pela técnica em relação à linha de base.

    Redução (%) = ((baseline - candidate) / baseline) * 100
    """
    if baseline_value == 0:
        return 0.0
    return ((baseline_value - candidate_value) / baseline_value) * 100.0


def compare_kmeans_results(
    baseline_result: KMeansResult,
    candidate_result: KMeansResult,
) -> Dict[str, Any]:
    """Compara o desempenho de uma técnica contra a linha de base (StandardKMeans).

    Parameters
    ----------
    baseline_result : KMeansResult
        Resultado obtido pelo K-Means padrão.
    candidate_result : KMeansResult
        Resultado obtido pela técnica de redução.

    Returns
    -------
    dict
        Métricas comparativas (redução de iterações %, ganho de velocidade %, diferença de inércia).
    """
    iter_reduction = calculate_reduction_percentage(
        baseline_result.n_iter, candidate_result.n_iter
    )
    time_reduction = calculate_reduction_percentage(
        baseline_result.elapsed_time_sec, candidate_result.elapsed_time_sec
    )
    inertia_diff_percent = (
        (candidate_result.inertia - baseline_result.inertia) / max(1e-9, baseline_result.inertia)
    ) * 100.0

    return {
        "baseline_iterations": baseline_result.n_iter,
        "candidate_iterations": candidate_result.n_iter,
        "iteration_reduction_pct": iter_reduction,
        "baseline_time_sec": baseline_result.elapsed_time_sec,
        "candidate_time_sec": candidate_result.elapsed_time_sec,
        "time_reduction_pct": time_reduction,
        "baseline_inertia": baseline_result.inertia,
        "candidate_inertia": candidate_result.inertia,
        "inertia_difference_pct": inertia_diff_percent,
    }

