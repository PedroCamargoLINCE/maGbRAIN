#!/bin/sh
# Modos: site | rag | new-group <pasta> [--name ...] [--repo ...] | test | <comando qualquer>
set -e
cd /magbrain
mode="${1:-site}"
[ $# -gt 0 ] && shift
case "$mode" in
  site)
    # Reconstrói na partida para refletir a pasta montada como volume (dist/ fica fora do Git).
    python scripts/build_site.py
    echo "Mapa de ideias em http://localhost:${SITE_PORT:-8080}/"
    exec python -m http.server "${SITE_PORT:-8080}" --bind 0.0.0.0 --directory dist ;;
  rag)
    exec python scripts/rag.py serve --host 0.0.0.0 --port "${RAG_PORT:-8081}" ;;
  new-group)
    exec python scripts/new_group.py "$@" ;;
  test)
    python -m unittest discover -s tests -v
    exec python scripts/build_site.py ;;
  *)
    exec "$mode" "$@" ;;
esac
