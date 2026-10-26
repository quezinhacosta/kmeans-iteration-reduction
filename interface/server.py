#!/usr/bin/env python3
"""Servidor Web e API local para o K-Means Sem Medo.

Permite rodar a interface interativa localmente e oferece uma API REST
para executar os algoritmos Python reais do repositório (src/kmeans_reduction)
diretamente a partir do navegador.

Uso:
    python3 interface/server.py [porta]
"""

import http.server
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

# Adiciona o diretório 'src' ao sys.path para importar o pacote do PIBIC
REPO_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = REPO_ROOT / "src"
INTERFACE_DIR = REPO_ROOT / "interface"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

# Tenta importar os algoritmos do projeto
try:
    from kmeans_reduction.standard_kmeans import StandardKMeans
    from kmeans_reduction.techniques.modified_kmeans import ModifiedKMeans
    from kmeans_reduction.techniques.fast_codebook import FastCodebookKMeans
    HAS_PIBIC_BACKEND = True
except ImportError as err:
    HAS_PIBIC_BACKEND = False
    _import_err = err


class KMeansHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manipulador HTTP com suporte a arquivos estáticos e API do PIBIC."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(INTERFACE_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            payload = {
                "status": "online",
                "backend_available": HAS_PIBIC_BACKEND,
                "python_version": sys.version,
                "project": "PIBIC - K-Means Iteration Reduction"
            }
            self.wfile.write(json.dumps(payload).encode("utf-8"))
            return

        # Serve arquivos estáticos padrão de interface/
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/run-pibic":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)

            try:
                data = json.loads(body.decode("utf-8"))
            except Exception as e:
                self._send_json_error(400, f"JSON inválido: {e}")
                return

            if not HAS_PIBIC_BACKEND:
                self._send_json_error(500, f"Backend PIBIC indisponível: {_import_err}")
                return

            k = int(data.get("k", 3))
            algorithm = data.get("algorithm", "standard")
            points = data.get("points", [])

            if not points:
                self._send_json_error(400, "Lista de pontos vazia.")
                return

            # Executa o algoritmo selecionado
            start_time = time.perf_counter()
            try:
                if algorithm == "modified":
                    model = ModifiedKMeans(n_clusters=k, max_iter=300, random_state=42)
                elif algorithm == "fast_codebook":
                    model = FastCodebookKMeans(n_clusters=k, max_iter=300, random_state=42)
                else:
                    model = StandardKMeans(n_clusters=k, max_iter=300, random_state=42)

                model.fit(points)
                elapsed_ms = (time.perf_counter() - start_time) * 1000

                response = {
                    "algorithm": algorithm,
                    "k": k,
                    "n_iter": model.n_iter_,
                    "inertia": model.inertia_,
                    "elapsed_ms": elapsed_ms,
                    "cluster_centers": model.cluster_centers_,
                    "saved_calculations": getattr(model, "distance_calculations_saved_", 0)
                }

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode("utf-8"))

            except Exception as e:
                self._send_json_error(500, f"Erro na execução do K-Means: {e}")
            return

        self._send_json_error(404, "Endpoint não encontrado")

    def _send_json_error(self, code, message):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode("utf-8"))


def run_server(port=8000, max_attempts=50):
    http.server.ThreadingHTTPServer.allow_reuse_address = True

    current_port = port
    httpd = None

    for attempt in range(max_attempts):
        try:
            server_address = ("", current_port)
            httpd = http.server.ThreadingHTTPServer(server_address, KMeansHTTPRequestHandler)
            break
        except OSError as err:
            if err.errno == 98:  # Address already in use
                print(f"⚠️  Porta {current_port} já está em uso. Tentando porta {current_port + 1}...", flush=True)
                current_port += 1
            else:
                raise err

    if httpd is None:
        print(f"❌ Não foi possível encontrar uma porta livre após {max_attempts} tentativas.", flush=True)
        sys.exit(1)

    print("=" * 68, flush=True)
    print(" 🌸 K-MEANS SEM MEDO - SERVIDOR DIDÁTICO PIBIC INICIADO", flush=True)
    print("=" * 68, flush=True)
    print(f" • Endereço Local:  http://localhost:{current_port}", flush=True)
    if current_port != port:
        print(f" • Observação:      A porta {port} estava ocupada, foi alocada a porta {current_port}", flush=True)
    print(f" • Diretório Web:   {INTERFACE_DIR}", flush=True)
    print(f" • Backend Python:  {'Disponível (src/kmeans_reduction)' if HAS_PIBIC_BACKEND else 'Não Carregado'}", flush=True)
    print(" • Pressione Ctrl+C para encerrar o servidor.", flush=True)
    print("=" * 68, flush=True)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado com sucesso.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)

