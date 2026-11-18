"""RAG gratuito sobre a base do maGbRAIN (REP-0018). Somente biblioteca padrão do Python.

Busca: BM25 sobre os textos do repositório (ideias, projetos, handoffs, docs e fichas).
Resposta: opcional, por um modelo local via Ollama (OLLAMA_URL). Sem Ollama, devolve os
trechos e um prompt pronto para colar em qualquer assistente que o grupo já use.

Uso:
  python scripts/rag.py search "pergunta"
  python scripts/rag.py prompt "pergunta"
  python scripts/rag.py ask "pergunta"          # usa Ollama se OLLAMA_URL estiver definido
  python scripts/rag.py serve [--host 0.0.0.0] [--port 8081]
"""
import argparse, json, math, os, re, sys, unicodedata, urllib.error, urllib.request
from collections import Counter
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {'.git', 'node_modules', 'dist', '__pycache__', '.venv', 'venv'}
MAX_CHUNK = 1200
STOPWORDS = set('''
a o as os um uma uns umas de do da dos das no na nos nas em por para pra com sem sob sobre
e ou mas se que quem qual quais como quando onde porque ja nao sim mais menos muito pouco
ao aos ate entre eh e esta este isto isso esse essa aquele aquela ser estar ter tem foi sao
seu sua seus suas meu minha nosso nossa ele ela eles elas voce voces eu nos lhe lhes
the of and or to in on for with is are was be it this that from by at as an
'''.split())


def normalize(text):
    text = unicodedata.normalize('NFKD', text.lower())
    return ''.join(c for c in text if not unicodedata.combining(c))


def tokenize(text):
    words = re.findall(r'[a-z0-9]+', normalize(text))
    out = []
    for w in words:
        if len(w) < 2 or w in STOPWORDS:
            continue
        if len(w) > 4 and w.endswith('s'):
            w = w[:-1]  # plural simples: ideias -> ideia
        out.append(w)
    return out


def source_files(root):
    root = Path(root)
    for path in sorted(root.rglob('*')):
        rel = path.relative_to(root)
        if any(part in SKIP_DIRS or part.startswith('.') for part in rel.parts[:-1]):
            continue
        if not path.is_file():
            continue
        if path.suffix == '.md' or (rel.parts[0] == 'contributions' and path.suffix == '.json' and path.name != 'contributors.json'):
            yield path


def contribution_text(path):
    try:
        c = json.loads(path.read_text(encoding='utf-8'))
    except (ValueError, OSError):
        return ''
    who = ', '.join(c.get('participants') or []) or 'autoria a confirmar'
    return (f"# Contribuição {c.get('id', '')}\n\nData: {c.get('date', '')}. Ideias: {', '.join(c.get('ideas', []))}. "
            f"Tipos: {', '.join(c.get('types', []))}. Participantes: {who}.\n\n{c.get('summary', '')}")


def split_long(text, limit=MAX_CHUNK):
    parts, current = [], ''
    for para in re.split(r'\n\s*\n', text):
        para = para.strip()
        if not para:
            continue
        while len(para) > limit:
            parts.append(para[:limit]); para = para[limit:]
        if current and len(current) + len(para) + 2 > limit:
            parts.append(current); current = para
        else:
            current = f'{current}\n\n{para}' if current else para
    if current:
        parts.append(current)
    return parts


def chunk_document(rel, text):
    """Divide um markdown por títulos; cada trecho leva o título do documento como contexto."""
    text = re.sub(r'\A---\n.*?\n---\n', lambda m: m.group(0).replace('---', ''), text, flags=re.S)
    title_match = re.search(r'^#\s+(.+)$', text, re.M) or re.search(r'^title:\s*"?(.+?)"?$', text, re.M)
    title = title_match.group(1).strip() if title_match else rel
    sections = re.split(r'^(?=#{1,3}\s)', text, flags=re.M)
    chunks = []
    for section in sections:
        heading_match = re.match(r'#{1,3}\s+(.+)', section)
        heading = heading_match.group(1).strip() if heading_match else ''
        for piece in split_long(section):
            if len(tokenize(piece)) < 3:
                continue
            chunks.append(dict(path=rel, title=title, heading=heading, text=piece))
    return chunks


class Index:
    def __init__(self, root=ROOT):
        self.root = Path(root)
        self.chunks = []
        for path in source_files(self.root):
            rel = path.relative_to(self.root).as_posix()
            text = contribution_text(path) if path.suffix == '.json' else path.read_text(encoding='utf-8', errors='replace')
            self.chunks.extend(chunk_document(rel, text))
        self.docs = [Counter(tokenize(f"{c['title']} {c['heading']} {c['path']} {c['text']}")) for c in self.chunks]
        self.lengths = [sum(d.values()) for d in self.docs]
        self.avg = (sum(self.lengths) / len(self.lengths)) if self.lengths else 0
        df = Counter()
        for d in self.docs:
            df.update(d.keys())
        n = len(self.docs)
        self.idf = {t: math.log(1 + (n - f + 0.5) / (f + 0.5)) for t, f in df.items()}

    def search(self, query, k=6, per_file=2, k1=1.5, b=0.75):
        terms = tokenize(query)
        scored = []
        for i, d in enumerate(self.docs):
            score = 0.0
            for t in terms:
                f = d.get(t)
                if f:
                    score += self.idf[t] * f * (k1 + 1) / (f + k1 * (1 - b + b * self.lengths[i] / self.avg))
            if score > 0:
                scored.append((score, i))
        scored.sort(reverse=True)
        hits, per_path = [], Counter()
        for s, i in scored:  # no máximo per_file trechos por arquivo, para variar as fontes
            path = self.chunks[i]['path']
            if per_path[path] < per_file:
                per_path[path] += 1
                hits.append(dict(self.chunks[i], score=round(s, 3)))
            if len(hits) == k:
                break
        return hits


def build_prompt(question, hits):
    context = '\n\n'.join(f"[{n}] {h['path']} — {h['title']}{' / ' + h['heading'] if h['heading'] and h['heading'] != h['title'] else ''}\n{h['text']}"
                          for n, h in enumerate(hits, 1))
    return ("Você responde perguntas sobre o maGbRAIN, o caderno coletivo de ideias de um grupo de amigos.\n"
            "Use somente os trechos abaixo. Cite as fontes como [n]. Se os trechos não bastarem, diga que não encontrou.\n"
            "Não invente autoria, resultados ou decisões.\n\n"
            f"Trechos:\n{context or '(nenhum trecho encontrado)'}\n\nPergunta: {question}\nResposta:")


def ollama_generate(prompt, url=None, model=None, timeout=180):
    url = (url if url is not None else os.environ.get('OLLAMA_URL', '')).rstrip('/')
    if not url:
        return None, 'OLLAMA_URL não definido'
    model = model or os.environ.get('OLLAMA_MODEL', 'qwen2.5:3b')
    body = json.dumps(dict(model=model, prompt=prompt, stream=False, options=dict(temperature=0.2))).encode()
    req = urllib.request.Request(url + '/api/generate', data=body, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read()).get('response', '').strip(), None
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors='replace')[:300]
        return None, f'Ollama respondeu {e.code}: {detail} (o modelo {model} foi baixado com "ollama pull {model}"?)'
    except (urllib.error.URLError, OSError, ValueError) as e:
        return None, f'Ollama indisponível em {url}: {e}'


def answer(question, index=None, k=6):
    index = index or Index()
    hits = index.search(question, k=k)
    prompt = build_prompt(question, hits)
    text, error = ollama_generate(prompt) if hits else (None, 'nenhum trecho encontrado')
    return dict(question=question, answer=text, error=error, prompt=prompt,
                sources=[dict(path=h['path'], title=h['title'], heading=h['heading'], score=h['score'], text=h['text']) for h in hits])


PAGE = '''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>maGbRAIN · Perguntar</title><style>
:root{--bg:#fbfaf7;--fg:#1d1d1b;--muted:#6b6862;--line:#e3dfd6;--accent:#2f6f5e}
@media(prefers-color-scheme:dark){:root{--bg:#161614;--fg:#ecebe6;--muted:#a19e96;--line:#34322e;--accent:#7cc3ad}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px}h1{margin:0 0 4px}p.sub{color:var(--muted);margin:0 0 20px}
form{display:flex;gap:8px}input{flex:1;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:transparent;color:inherit;font:inherit}
button{padding:10px 16px;border:0;border-radius:8px;background:var(--accent);color:#fff;font:inherit;cursor:pointer}
#answer{white-space:pre-wrap;margin:20px 0}.note{color:var(--muted);font-size:14px}
details{border-top:1px solid var(--line);padding:8px 0}summary{cursor:pointer}pre{white-space:pre-wrap;font-size:14px;color:var(--muted)}
textarea{width:100%;min-height:140px;box-sizing:border-box;font:13px monospace;background:transparent;color:inherit;border:1px solid var(--line);border-radius:8px}
</style></head><body><main><h1>Perguntar ao maGbRAIN</h1>
<p class="sub">Busca nos registros do repositório. Com Ollama ligado, um modelo local responde; sem ele, você recebe os trechos e um prompt para colar no assistente que já usa.</p>
<form id="f"><input id="q" placeholder="Ex.: quais ideias falam de gatos?" autofocus><button>Perguntar</button></form>
<div id="answer"></div><div id="sources"></div></main><script>
const $=id=>document.getElementById(id);
$('f').onsubmit=async e=>{e.preventDefault();const q=$('q').value.trim();if(!q)return;$('answer').textContent='Pensando…';$('sources').replaceChildren();
const r=await fetch('api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q})}).then(r=>r.json()).catch(()=>({error:'Falha na conexão'}));
$('answer').replaceChildren();if(r.answer){$('answer').textContent=r.answer}else{const n=document.createElement('p');n.className='note';n.textContent='Sem resposta do modelo local ('+(r.error||'?')+'). Cole o prompt abaixo no seu assistente:';const t=document.createElement('textarea');t.value=r.prompt||'';$('answer').append(n,t)}
(r.sources||[]).forEach((s,i)=>{const d=document.createElement('details'),m=document.createElement('summary'),p=document.createElement('pre');m.textContent='['+(i+1)+'] '+s.path+(s.heading?' · '+s.heading:'');p.textContent=s.text;d.append(m,p);$('sources').append(d)})}
</script></body></html>'''


def serve(host='127.0.0.1', port=8081, root=ROOT):
    class Handler(BaseHTTPRequestHandler):
        def send(self, code, body, ctype='application/json; charset=utf-8'):
            data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode()
            self.send_response(code); self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(data)))
            self.end_headers(); self.wfile.write(data)

        def do_GET(self):
            url = urlparse(self.path)
            if url.path in ('/', '/index.html'):
                return self.send(200, PAGE.encode(), 'text/html; charset=utf-8')
            if url.path == '/api/search':
                q = parse_qs(url.query).get('q', [''])[0]
                return self.send(200, dict(sources=Index(root).search(q)))
            self.send(404, dict(error='não encontrado'))

        def do_POST(self):
            if urlparse(self.path).path != '/api/ask':
                return self.send(404, dict(error='não encontrado'))
            try:
                length = min(int(self.headers.get('Content-Length', 0)), 10_000)
                q = str(json.loads(self.rfile.read(length) or b'{}').get('q', '')).strip()[:500]
            except ValueError:
                return self.send(400, dict(error='JSON inválido'))
            if not q:
                return self.send(400, dict(error='pergunta vazia'))
            self.send(200, answer(q, Index(root)))  # reindexa a cada pergunta: a base é pequena e fica sempre atualizada

    print(f'maGbRAIN RAG em http://{host}:{port}/ (Ollama: {os.environ.get("OLLAMA_URL") or "desligado"})', flush=True)
    ThreadingHTTPServer((host, port), Handler).serve_forever()


def main(argv=None):
    ap = argparse.ArgumentParser(description='RAG gratuito sobre a base do maGbRAIN')
    sub = ap.add_subparsers(dest='cmd', required=True)
    for name in ('search', 'prompt', 'ask'):
        p = sub.add_parser(name); p.add_argument('question', nargs='+'); p.add_argument('-k', type=int, default=6)
    s = sub.add_parser('serve'); s.add_argument('--host', default='127.0.0.1'); s.add_argument('--port', type=int, default=8081)
    args = ap.parse_args(argv)
    if args.cmd == 'serve':
        return serve(args.host, args.port)
    question = ' '.join(args.question)
    index = Index()
    if args.cmd == 'search':
        for n, h in enumerate(index.search(question, k=args.k), 1):
            print(f"[{n}] {h['score']:.2f}  {h['path']}  {h['heading']}")
    elif args.cmd == 'prompt':
        print(build_prompt(question, index.search(question, k=args.k)))
    else:
        r = answer(question, index, k=args.k)
        if r['answer']:
            print(r['answer'])
        else:
            print(f"(sem modelo local: {r['error']})\n\n{r['prompt']}")
        print('\nFontes:\n' + '\n'.join(f"[{n}] {s['path']}" for n, s in enumerate(r['sources'], 1)))


if __name__ == '__main__':
    main()
