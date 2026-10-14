"""Testes unitários para as métricas de distância."""

import unittest
from kmeans_reduction.distance import (
    squared_euclidean_distance,
    euclidean_distance,
    pairwise_squared_distances,
)


class TestDistanceMetrics(unittest.TestCase):
    """Testa a precisão matemática da distância euclidiana quadrática."""

    def test_squared_euclidean_known_values(self):
        # Triângulo retângulo 3-4-5: distância = 5, quadrática = 25
        p1 = [0.0, 0.0]
        p2 = [3.0, 4.0]
        self.assertAlmostEqual(squared_euclidean_distance(p1, p2), 25.0)
        self.assertAlmostEqual(euclidean_distance(p1, p2), 5.0)

    def test_squared_euclidean_zero_distance(self):
        p1 = [1.5, -2.0, 7.3]
        p2 = [1.5, -2.0, 7.3]
        self.assertAlmostEqual(squared_euclidean_distance(p1, p2), 0.0)

    def test_dimension_mismatch_raises_error(self):
        p1 = [1.0, 2.0]
        p2 = [1.0, 2.0, 3.0]
        with self.assertRaises(ValueError):
            squared_euclidean_distance(p1, p2)

    def test_pairwise_squared_distances(self):
        X = [[0.0, 0.0], [1.0, 1.0]]
        centers = [[0.0, 0.0], [2.0, 2.0]]
        matrix = pairwise_squared_distances(X, centers)

        # Distância de [0,0] a [0,0] é 0; a [2,2] é 4+4=8
        self.assertAlmostEqual(matrix[0][0], 0.0)
        self.assertAlmostEqual(matrix[0][1], 8.0)
        # Distância de [1,1] a [0,0] é 1+1=2; a [2,2] é 1+1=2
        self.assertAlmostEqual(matrix[1][0], 2.0)
        self.assertAlmostEqual(matrix[1][1], 2.0)


if __name__ == "__main__":
    unittest.main()

