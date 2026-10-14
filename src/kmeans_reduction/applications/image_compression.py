"""Aplicação: Quantização Vetorial (VQ) para Compressão e Segmentação de Imagens.

Conforme a justificativa do plano de trabalho:
"processamento, armazenamento e transmissão digital da informação (LIMA et al., 2024;
BILAL; ULLAH; ISLAM, 2021) ... segmentação de imagens digitais (CALAZANS et al., 2023)."
"""

from typing import Tuple, List, Any, Optional
from kmeans_reduction.base import BaseKMeans
from kmeans_reduction.metrics import calculate_psnr, calculate_mean_squared_error


class ImageVectorQuantizer:
    """Aplica algoritmos K-Means para projeto de codebook e quantização de imagens.

    Representa os pixels ou blocos de imagem em um espaço de características reduzido
    (codebook), permitindo compressão com controle de distorção (PSNR/MSE).
    """

    def __init__(self, model: BaseKMeans) -> None:
        """Inicializa o quantizador com um modelo K-Means específico.

        Parameters
        ----------
        model : BaseKMeans
            Instância de StandardKMeans, ModifiedKMeans ou FastCodebookKMeans.
        """
        self.model = model
        self.original_shape: Optional[Tuple[int, int, int]] = None
        self.codebook_: Optional[List[List[float]]] = None

    def quantize_pixels(
        self,
        pixel_data: List[List[float]],
    ) -> Tuple[List[List[float]], dict]:
        """Ajusta o codebook aos pixels e retorna os pixels quantizados e métricas.

        Parameters
        ----------
        pixel_data : List[List[float]]
            Lista de pixels, onde cada pixel é representado por [R, G, B] ou [L].

        Returns
        -------
        Tuple[List[List[float]], dict]
            (pixels_quantizados, relatório_de_desempenho)
        """
        self.model.fit(pixel_data)
        labels = self.model.labels_ or self.model.predict(pixel_data)
        centers = self.model.cluster_centers_

        self.codebook_ = centers
        quantized = [centers[label] for label in labels]

        mse = calculate_mean_squared_error(pixel_data, quantized)
        psnr = calculate_psnr(pixel_data, quantized, max_val=255.0)

        report = {
            "n_clusters": self.model.n_clusters,
            "n_iter": self.model.n_iter_,
            "inertia": self.model.inertia_,
            "mse": mse,
            "psnr_db": psnr,
        }

        return quantized, report

