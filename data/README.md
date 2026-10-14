# Diretório de Dados

Este diretório gerencia as bases de dados utilizadas nos experimentos do projeto PIBIC.

## Estrutura

- `raw/`: Dados originais e brutos (ex: imagens de teste sem compressão, arquivos de áudio, bases de diabetes ou odontológicas).
- `processed/`: Dados normalizados, filtrados ou convertidos em vetores de características.
- `synthetic/`: Dados gerados artificialmente (ex: aglomerados gaussianos para testes de validação matemática).

> **Aviso**: Arquivos volumosos contidos em `data/` são ignorados pelo `.gitignore` para não sobrecarregar o repositório Git. Utilize scripts para download ou pré-processamento.

