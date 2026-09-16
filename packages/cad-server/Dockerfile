FROM condaforge/miniforge3:24.9.2-0

WORKDIR /app

COPY environment.yml .
RUN mamba env create -f environment.yml && mamba clean -afy

COPY app ./app

ENV PATH=/opt/conda/envs/feai-cad-server/bin:$PATH
# FreeCAD.so/Part.so live in the conda env's lib/ directly, not lib/python3.11/site-packages/,
# so they're not importable without this on the path.
ENV PYTHONPATH=/opt/conda/envs/feai-cad-server/lib
EXPOSE 8000

# Render injects PORT; local runs default to 8000. Shell form so ${PORT:-8000} expands
# (the base image's tini ENTRYPOINT still wraps it).
CMD /opt/conda/envs/feai-cad-server/bin/uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
