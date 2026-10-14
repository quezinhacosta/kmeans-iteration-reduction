"""Testes para as técnicas de redução de iterações do K-Means."""

import unittest
from kmeans_reduction.techniques.modified_kmeans import ModifiedKMeans
from kmeans_reduction.techniques.fast_codebook import FastCodebookKMeans


class TestReductionTechniques(unittest.TestCase):
    """Verifica a conformidade das duas técnicas exigidas no plano de trabalho."""

    def setUp(self):
        self.X = [
            [1.0, 1.0],
            [1.2, 0.9],
            [0.8, 1.1],
            [8.0, 8.0],
            [8.2, 7.9],
            [7.8, 8.1],
        ]

    def test_modified_kmeans_fit_and_metadata(self):
        model = ModifiedKMeans(
            n_clusters=2,
            max_iter=30,
            activity_threshold=0.01,
            random_state=42,
        )
        model.fit(self.X)

        self.assertIsNotNone(model.cluster_centers_)
        self.assertEqual(len(model.cluster_centers_), 2)
        self.assertEqual(len(model.labels_), 6)
        self.assertGreaterEqual(model.n_iter_, 1)
        self.assertIsNotNone(model.result_)
        self.assertIn("distance_calculations_saved", model.result_.metadata)
        self.assertIn("ModifiedKMeans", model.result_.metadata["algorithm"])

    def test_fast_codebook_kmeans_fit_and_metadata(self):
        model = FastCodebookKMeans(
            n_clusters=2,
            max_iter=30,
            init_strategy="pattern_spread",
            random_state=42,
        )
        model.fit(self.X)

        self.assertIsNotNone(model.cluster_centers_)
        self.assertEqual(len(model.cluster_centers_), 2)
        self.assertEqual(len(model.labels_), 6)
        self.assertGreaterEqual(model.n_iter_, 1)
        self.assertIsNotNone(model.result_)
        self.assertEqual(model.result_.metadata["init_strategy"], "pattern_spread")

    def test_prediction_consistency(self):
        m_model = ModifiedKMeans(n_clusters=2, random_state=42).fit(self.X)
        f_model = FastCodebookKMeans(n_clusters=2, random_state=42).fit(self.X)

        pred_m = m_model.predict([[1.1, 1.0]])
        pred_f = f_model.predict([[1.1, 1.0]])

        self.assertEqual(len(pred_m), 1)
        self.assertEqual(len(pred_f), 1)


if __name__ == "__main__":
    unittest.main()

