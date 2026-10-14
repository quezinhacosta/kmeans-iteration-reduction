"""Testes para o módulo de métricas de avaliação e comparação."""

import unittest
from kmeans_reduction.metrics import (
    calculate_inertia,
    calculate_mean_squared_error,
    calculate_psnr,
    calculate_reduction_percentage,
    compare_kmeans_results,
)
from kmeans_reduction.base import KMeansResult


class TestMetrics(unittest.TestCase):
    """Testa o cálculo correto das métricas de inércia, erro e redução."""

    def test_calculate_inertia(self):
        X = [[0.0, 0.0], [2.0, 0.0]]
        labels = [0, 1]
        centers = [[0.0, 0.0], [2.0, 0.0]]
        # Inércia perfeita = 0
        self.assertAlmostEqual(calculate_inertia(X, labels, centers), 0.0)

        # Centróide deslocado em 1 unidade: d² = 1² = 1
        centers_shifted = [[1.0, 0.0], [1.0, 0.0]]
        self.assertAlmostEqual(calculate_inertia(X, labels, centers_shifted), 2.0)

    def test_mean_squared_error_and_psnr(self):
        orig = [[10.0, 20.0], [30.0, 40.0]]
        reconst = [[10.0, 20.0], [30.0, 40.0]]

        mse = calculate_mean_squared_error(orig, reconst)
        self.assertAlmostEqual(mse, 0.0)
        self.assertEqual(calculate_psnr(orig, reconst), float("inf"))

        reconst_diff = [[11.0, 20.0], [30.0, 40.0]]
        mse_diff = calculate_mean_squared_error(orig, reconst_diff)
        self.assertAlmostEqual(mse_diff, 1.0 / 4.0)

    def test_reduction_percentage(self):
        # Baseline = 20 iterações, técnica = 10 iterações -> 50% de redução
        reduction = calculate_reduction_percentage(20.0, 10.0)
        self.assertAlmostEqual(reduction, 50.0)

        # Baseline zero
        self.assertAlmostEqual(calculate_reduction_percentage(0.0, 5.0), 0.0)

    def test_compare_kmeans_results(self):
        res_baseline = KMeansResult(
            cluster_centers=[[0.0]],
            labels=[0],
            n_iter=20,
            inertia=100.0,
            elapsed_time_sec=0.10,
        )
        res_candidate = KMeansResult(
            cluster_centers=[[0.0]],
            labels=[0],
            n_iter=8,
            inertia=102.0,
            elapsed_time_sec=0.04,
        )

        comp = compare_kmeans_results(res_baseline, res_candidate)
        self.assertEqual(comp["baseline_iterations"], 20)
        self.assertEqual(comp["candidate_iterations"], 8)
        self.assertAlmostEqual(comp["iteration_reduction_pct"], 60.0)
        self.assertAlmostEqual(comp["time_reduction_pct"], 60.0)


if __name__ == "__main__":
    unittest.main()

