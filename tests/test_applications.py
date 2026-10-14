"""Testes para o módulo de aplicações (Quantização de Imagens e Benchmarks)."""

import unittest
from kmeans_reduction.standard_kmeans import StandardKMeans
from kmeans_reduction.techniques.modified_kmeans import ModifiedKMeans
from kmeans_reduction.applications.image_compression import ImageVectorQuantizer
from kmeans_reduction.applications.benchmark_clustering import (
    BenchmarkRunner,
    generate_synthetic_blobs,
)


class TestApplications(unittest.TestCase):
    """Verifica a execução de ponta a ponta dos esqueletos de aplicação."""

    def test_image_vector_quantizer_synthetic_pixels(self):
        # Simula 8 pixels RGB em 2 clusters de cor (escuro vs claro)
        fake_pixels = [
            [10.0, 12.0, 11.0],
            [11.0, 10.0, 9.0],
            [12.0, 13.0, 10.0],
            [9.0, 11.0, 12.0],
            [220.0, 225.0, 230.0],
            [222.0, 221.0, 224.0],
            [230.0, 228.0, 227.0],
            [225.0, 224.0, 226.0],
        ]

        model = StandardKMeans(n_clusters=2, random_state=42)
        quantizer = ImageVectorQuantizer(model=model)
        quantized, report = quantizer.quantize_pixels(fake_pixels)

        self.assertEqual(len(quantized), len(fake_pixels))
        self.assertIn("psnr_db", report)
        self.assertIn("mse", report)
        self.assertGreater(report["psnr_db"], 20.0)

    def test_benchmark_runner_and_synthetic_blobs(self):
        X, y = generate_synthetic_blobs(
            n_samples=60,
            n_features=2,
            centers=3,
            cluster_std=0.5,
            random_state=42,
        )
        self.assertEqual(len(X), 60)
        self.assertEqual(len(y), 60)

        models = {
            "Standard": StandardKMeans(n_clusters=3, random_state=42),
            "Modified": ModifiedKMeans(n_clusters=3, random_state=42),
        }
        runner = BenchmarkRunner(models=models)
        results = runner.run(X)

        self.assertIn("Standard", results)
        self.assertIn("Modified", results)
        self.assertGreater(results["Standard"]["n_iter"], 0)
        self.assertGreater(results["Modified"]["n_iter"], 0)


if __name__ == "__main__":
    unittest.main()

