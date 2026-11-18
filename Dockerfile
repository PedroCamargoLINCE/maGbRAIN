# maGbRAIN em contêiner (REP-0017): mapa de ideias, RAG gratuito e criação de cadernos novos.
# Somente Python da biblioteca padrão; nenhuma chave ou serviço pago.
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /magbrain
COPY . .
RUN chmod +x scripts/docker-entrypoint.sh && python scripts/build_site.py
EXPOSE 8080 8081
ENTRYPOINT ["scripts/docker-entrypoint.sh"]
CMD ["site"]
