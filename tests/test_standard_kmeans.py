"""Testes para o algoritmo K-Means padrão (Lloyd) - Linha de Base."""

import unittest
from kmeans_reduction.standard_kmeans import StandardKMeans


class TestStandardKMeans(unittest.TestCase):
    """Testa a convergência e integridade do K-Means padrão com distância quadrática."""

    def setUp(self):
        # 6 pontos em 2 grupos bem separados:
        # Cluster 0 perto de (0, 0)
        # Cluster 1 perto de (10, 10)
        self.X = [
            [0.1, 0.2],
            [0.0, 0.1],
            [-0.1, 0.0],
            [10.1, 9.9],
            [9.8, 10.2],
            [10.0, 10.0],
        ]

    def test_fit_returns_correct_shapes_and_types(self):
        kmeans = StandardKMeans(n_clusters=2, max_iter=50, random_state=42)
        kmeans.fit(self.X)

        self.assertIsNotNone(kmeans.cluster_centers_)
        self.assertEqual(len(kmeans.cluster_centers_), 2)
        self.assertEqual(len(kmeans.labels_), 6)
        self.assertGreaterEqual(kmeans.n_iter_, 1)
        self.assertLessEqual(kmeans.n_iter_, 50)
        self.assertGreaterEqual(kmeans.inertia_, 0.0)

        # As três primeiras amostras devem ter o mesmo rótulo e as três últimas outro
        self.assertEqual(kmeans.labels_[0], kmeans.labels_[1])
        self.assertEqual(kmeans.labels_[1], kmeans.labels_[2])
        self.assertEqual(kmeans.labels_[3], kmeans.labels_[4])
        self.assertEqual(kmeans.labels_[4], kmeans.labels_[5])
        self.assertNotEqual(kmeans.labels_[0], kmeans.labels_[3])

    def test_predict_new_samples(self):
        kmeans = StandardKMeans(n_clusters=2, max_iter=50, random_state=42)
        kmeans.fit(self.X)

        p_near_zero = [[0.05, 0.05]]
        p_near_ten = [[9.9, 10.1]]

        label_zero = kmeans.predict(p_near_zero)[0]
        label_ten = kmeans.predict(p_near_ten)[0]

        self.assertEqual(label_zero, kmeans.labels_[0])
        self.assertEqual(label_ten, kmeans.labels_[3])

    def test_empty_dataset_raises(self):
        kmeans = StandardKMeans(n_clusters=2)
        with self.assertRaises(ValueError):
            kmeans.fit([])


if __name__ == "__main__":
    unittest.main()

