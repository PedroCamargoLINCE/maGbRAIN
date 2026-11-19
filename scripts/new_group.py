"""Cria um maGbRAIN novo e vazio para outro grupo de amigos (REP-0017). Somente biblioteca padrão.

Copia a estrutura reutilizável (protocolo, modelos, scripts, site, RAG, Docker e CI) sem as
ideias, projetos, pessoas e fichas deste grupo.

Uso:
  python scripts/new_group.py ../meu-magbrain --name "Caderno da Casa" --repo https://github.com/usuario/repo
"""
import argparse, html, json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL_REPO = 'https://github.com/PedroCamargoLINCE/maGbRAIN'
ORIGINAL_PAGES = 'https://pedrocamargolince.github.io/maGbRAIN/'
COPY = [
    'AGENTS.md', 'CONTRIBUTING.md', 'LICENSE', 'Dockerfile', 'docker-compose.yml', '.dockerignore', '.gitignore',
    'docs/templates', 'tests', 'site/index.html', 'site/assets',
    'scripts/build_site.py', 'scripts/placar.py', 'scripts/contributions.py', 'scripts/rag.py', 'scripts/new_group.py', 'scripts/docker-entrypoint.sh',
    'docs/CONTRIBUTIONS.md', 'docs/PROMPTS.md', 'docs/MAPA.md', 'docs/DOCKER.md', 'docs/RAG.md',
    '.github/pull_request_template.md', '.github/ISSUE_TEMPLATE',
    '.github/workflows/contributions.yml', '.github/workflows/pages.yml',
]
TEXT_SUFFIXES = {'.md', '.html', '.yml', '.json', '.py', '.sh', ''}


def pages_url(repo):
    m = re.fullmatch(r'https://github\.com/([A-Za-z0-9-]+)/([A-Za-z0-9._-]+?)/?', repo or '')
    return f'https://{m.group(1).lower()}.github.io/{m.group(2)}/' if m else ''


def readme(name, repo):
    repo_line = f'Repositório: {repo}\n\n' if repo else ''
    return f'''# {name}

Caderno coletivo de ideias do grupo, criado a partir do [maGbRAIN]({ORIGINAL_REPO}).

{repo_line}## Como usar
- Registre uma ideia copiando `docs/templates/IDEA.md` para `ideas/REP-0001-nome/IDEA.md`.
- Veja o mapa com `docker compose up site` e abra http://localhost:8080 (ou `python scripts/build_site.py` e abra `dist/index.html`).
- Pergunte à base com `docker compose up rag` e abra http://localhost:8081. Detalhes em [docs/RAG.md](docs/RAG.md).
- Protocolo de contribuição e créditos: [CONTRIBUTING.md](CONTRIBUTING.md) e [docs/CONTRIBUTIONS.md](docs/CONTRIBUTIONS.md).
- Instruções para agentes de IA: [AGENTS.md](AGENTS.md).

## Ideias
O mapa lista todas as ideias e é gerado sozinho a partir de `ideas/`; não mantenha lista manual aqui.
'''


def create(target, name, repo=''):
    target = Path(target).resolve()
    if target.exists() and any(target.iterdir()):
        raise SystemExit(f'{target} já existe e não está vazio; escolha outra pasta.')
    if repo and not re.fullmatch(r'https://github\.com/[A-Za-z0-9-]+/[A-Za-z0-9._-]+/?', repo):
        raise SystemExit('--repo deve ser https://github.com/usuario/repositorio')
    target.mkdir(parents=True, exist_ok=True)
    for item in COPY:
        src = ROOT / item
        if not src.exists():
            continue
        dst = target / item
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, dst, ignore=shutil.ignore_patterns('__pycache__', 'magnatas'))  # o logo da casa não vai para outros grupos
        else:
            shutil.copy2(src, dst)
    for folder in ('ideas', 'projects', 'contributions'):
        (target / folder).mkdir(exist_ok=True)
        (target / folder / '.gitkeep').touch()
    (target / 'contributions/contributors.json').write_text('[]\n')
    (target / 'site/relations.json').write_text('[]\n')
    (target / 'README.md').write_text(readme(name, repo))

    # Regras específicas deste grupo não valem para o novo (ex.: crédito pré-confirmado de uma pessoa).
    agents = target / 'AGENTS.md'
    if agents.exists():
        text = agents.read_text()
        text = re.sub(r'^Felipe confirmou.*\n', '', text, flags=re.M)
        agents.write_text(text)

    new_repo = repo.rstrip('/') if repo else 'https://github.com/SEU-USUARIO/SEU-REPOSITORIO'
    new_pages = pages_url(repo) or 'https://SEU-USUARIO.github.io/SEU-REPOSITORIO/'
    for path in target.rglob('*'):
        if path.is_file() and path.suffix in TEXT_SUFFIXES and path.name != 'new_group.py':
            text = path.read_text(errors='ignore')
            updated = text.replace(ORIGINAL_REPO, new_repo).replace(ORIGINAL_PAGES, new_pages)
            if updated != text:
                path.write_text(updated)
    index = target / 'site/index.html'
    if index.exists():
        safe = html.escape(name)
        text = index.read_text()
        text = re.sub(r'<title>[^<]*</title>', f'<title>{safe} · Mapa de ideias</title>', text, count=1)
        text = text.replace('<h1>ma<span>GbRAIN</span></h1>', f'<h1>{safe}</h1>', 1)
        index.write_text(text)
    return target


def main(argv=None):
    ap = argparse.ArgumentParser(description='Cria um maGbRAIN vazio para outro grupo')
    ap.add_argument('target', help='pasta nova (vazia) para o caderno do grupo')
    ap.add_argument('--name', default='Nosso maGbRAIN', help='nome do caderno, mostrado no site')
    ap.add_argument('--repo', default='', help='endereço do repositório no GitHub, se já existir')
    args = ap.parse_args(argv)
    target = create(args.target, args.name, args.repo)
    print(f'Caderno criado em {target}\n\nPróximos passos:\n'
          f'  cd {target}\n  git init && git add . && git commit -m "Começar nosso maGbRAIN"\n'
          f'  docker compose up site rag   # mapa em :8080, perguntas em :8081\n'
          f'Depois, crie o repositório no GitHub, envie e ative o Pages (docs/MAPA.md).')


if __name__ == '__main__':
    main()
