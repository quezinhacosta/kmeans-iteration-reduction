"""Testes para a classe base e validações."""

import unittest
from kmeans_reduction.base import BaseKMeans, KMeansResult


class DummyKMeans(BaseKMeans):
    """Implementação mínima para testar a classe base abstrata."""

    def fit(self, X):
        self.cluster_centers_ = [[0.0, 0.0]]
        self.labels_ = [0] * len(X)
        self.n_iter_ = 1
        self.inertia_ = 0.0
        self.result_ = KMeansResult(
            cluster_centers=self.cluster_centers_,
            labels=self.labels_,
            n_iter=1,
            inertia=0.0,
        )
        return self


class TestBaseKMeans(unittest.TestCase):
    """Testa comportamentos da classe base abstrata."""

    def test_invalid_parameters_raise(self):
        with self.assertRaises(ValueError):
            DummyKMeans(n_clusters=0)

        with self.assertRaises(ValueError):
            DummyKMeans(max_iter=-5)

        with self.assertRaises(ValueError):
            DummyKMeans(tol=-0.1)

    def test_predict_before_fit_raises(self):
        model = DummyKMeans(n_clusters=2)
        with self.assertRaises(RuntimeError):
            model.predict([[1.0, 2.0]])

    def test_init_centroids_not_enough_samples(self):
        model = DummyKMeans(n_clusters=5)
        with self.assertRaises(ValueError):
            model._init_centroids([[1.0, 2.0], [3.0, 4.0]])

    def test_fit_predict(self):
        model = DummyKMeans(n_clusters=1)
        X = [[1.0, 1.0], [2.0, 2.0]]
        labels = model.fit_predict(X)
        self.assertEqual(len(labels), 2)
        self.assertEqual(labels, [0, 0])


if __name__ == "__main__":
    unittest.main()

