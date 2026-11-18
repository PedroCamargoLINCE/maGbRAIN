import json, sys, tempfile, threading, unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import rag


class RagTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); root = self.root = Path(self.tmp.name)
        (root / 'ideas/REP-0001-gatos').mkdir(parents=True)
        (root / 'ideas/REP-0001-gatos/IDEA.md').write_text('---\nid: REP-0001\ntitle: "Gatos sentinelas"\n---\n\n# Gatos sentinelas\n\n## Registro\nColeiras para gatos vigiarem a república à noite.\n')
        (root / 'ideas/REP-0002-surf').mkdir(parents=True)
        (root / 'ideas/REP-0002-surf/IDEA.md').write_text('# Surfilation\n\n## Registro\nPrevisão de ondas para surfistas usando sensores.\n')
        (root / 'contributions').mkdir()
        (root / 'contributions/a.json').write_text(json.dumps(dict(id='a', date='2026-11-18', ideas=['REP-0002'], types=['code'], participants=[], summary='Protótipo do previsor de ondas')))
        (root / 'node_modules').mkdir(); (root / 'node_modules/x.md').write_text('# gatos gatos gatos')

    def tearDown(self): self.tmp.cleanup()

    def test_search_finds_right_idea_and_skips_vendor_dirs(self):
        hits = rag.Index(self.root).search('quais ideias falam de gatos?')
        self.assertEqual(hits[0]['path'], 'ideas/REP-0001-gatos/IDEA.md')
        self.assertFalse(any('node_modules' in h['path'] for h in hits))

    def test_accents_plurals_and_contributions_are_indexed(self):
        hits = rag.Index(self.root).search('previsão onda')
        self.assertIn('contributions/a.json', [h['path'] for h in hits])
        self.assertEqual(rag.tokenize('Previsão de Ideias'), ['previsao', 'ideia'])

    def test_prompt_cites_sources(self):
        hits = rag.Index(self.root).search('gatos')
        prompt = rag.build_prompt('gatos?', hits)
        self.assertIn('[1] ideas/REP-0001-gatos/IDEA.md', prompt)
        self.assertIn('Não invente', prompt)

    def test_without_ollama_returns_prompt_instead_of_failing(self):
        text, error = rag.ollama_generate('oi', url='')
        self.assertIsNone(text); self.assertIn('OLLAMA_URL', error)
        text, error = rag.ollama_generate('oi', url='http://127.0.0.1:9', timeout=2)
        self.assertIsNone(text); self.assertIn('indisponível', error)

    def test_uses_ollama_when_available(self):
        seen = {}
        class Fake(BaseHTTPRequestHandler):
            def do_POST(self):
                seen.update(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
                body = json.dumps({'response': 'Resposta local [1]'}).encode()
                self.send_response(200); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
            def log_message(self, *a): pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Fake)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            text, error = rag.ollama_generate('pergunta', url=f'http://127.0.0.1:{server.server_port}', model='modelo-teste')
        finally:
            server.shutdown()
        self.assertEqual(text, 'Resposta local [1]'); self.assertIsNone(error)
        self.assertEqual(seen['model'], 'modelo-teste'); self.assertFalse(seen['stream'])


if __name__ == '__main__':
    unittest.main()
