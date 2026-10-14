#!/usr/bin/env python3
"""Script experimental para comparação de desempenho entre o K-Means padrão e as técnicas de redução.

Executa:
1. StandardKMeans (Linha de base de Lloyd)
2. ModifiedKMeans (Técnica 1 - Lee et al., 1997; Paliwal & Ramasubramanian, 2000)
3. FastCodebookKMeans (Técnica 2 - Bilal et al., 2021)

Mede:
- Número de iterações até convergência
- Redução percentual de iterações
- Tempo de execução em milissegundos
- Inércia final (distorção euclidiana quadrática)
"""

import sys
import os

# Adiciona src ao path caso o script seja executado diretamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from kmeans_reduction.standard_kmeans import StandardKMeans
from kmeans_reduction.techniques.modified_kmeans import ModifiedKMeans
from kmeans_reduction.techniques.fast_codebook import FastCodebookKMeans
from kmeans_reduction.applications.benchmark_clustering import generate_synthetic_blobs
from kmeans_reduction.metrics import calculate_reduction_percentage


def main():
    print("=" * 78)
    print(" EXPERIMENTO COMPARATIVO: TÉCNICAS DE REDUÇÃO DE ITERAÇÕES DO K-MEANS")
    print("=" * 78)

    # 1. Gera base de dados sintética com 4 grupos gaussianos em 3 dimensões
    n_samples = 400
    n_features = 3
    n_clusters = 4
    random_seed = 42

    print(f"\n[+] Gerando dados sintéticos: {n_samples} amostras, {n_features} atributos, {n_clusters} clusters...")
    X, _ = generate_synthetic_blobs(
        n_samples=n_samples,
        n_features=n_features,
        centers=n_clusters,
        cluster_std=1.2,
        random_state=random_seed,
    )

    # 2. Configura os modelos a serem comparados
    models = {
        "Standard (Lloyd Baseline)": StandardKMeans(
            n_clusters=n_clusters, max_iter=100, tol=1e-4, random_state=random_seed
        ),
        "Modified K-Means (Lee et al.)": ModifiedKMeans(
            n_clusters=n_clusters, max_iter=100, tol=1e-4, activity_threshold=1e-2, random_state=random_seed
        ),
        "Fast Codebook (Bilal et al.)": FastCodebookKMeans(
            n_clusters=n_clusters, max_iter=100, tol=1e-4, init_strategy="pattern_spread", random_state=random_seed
        ),
    }

    # 3. Executa os modelos e coleta resultados
    results = {}
    baseline_iters = 0

    for name, model in models.items():
        print(f"[*] Executando {name}...")
        model.fit(X)
        res = model.result_
        if "Baseline" in name:
            baseline_iters = res.n_iter

        results[name] = {
            "n_iter": res.n_iter,
            "elapsed_ms": res.elapsed_time_sec * 1000.0,
            "inertia": res.inertia,
            "reduction_pct": 0.0,
        }

    # Calcula reduções percentuais em relação à linha de base
    for name in results:
        red = calculate_reduction_percentage(baseline_iters, results[name]["n_iter"])
        results[name]["reduction_pct"] = red

    # 4. Apresenta a tabela formatada
    print("\n" + "-" * 78)
    print(f"{'Algoritmo':<32} | {'Iterações':<10} | {'Redução (%)':<12} | {'Tempo (ms)':<10} | {'Inércia':<10}")
    print("-" * 78)

    for name, data in results.items():
        iter_str = str(data["n_iter"])
        red_str = f"{data['reduction_pct']:+.1f}%" if "Baseline" not in name else "Linha de Base"
        time_str = f"{data['elapsed_ms']:.2f}"
        inertia_str = f"{data['inertia']:.2f}"
        print(f"{name:<32} | {iter_str:<10} | {red_str:<12} | {time_str:<10} | {inertia_str:<10}")

    print("-" * 78)
    print("\n[OK] Experimento concluído com sucesso!")
    return 0


if __name__ == "__main__":
    sys.exit(main())

