import json, re, sys, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import build_site


@unittest.skipUnless((ROOT / 'ideas/REP-0015-me-debata/IDEA.md').exists(), 'só no caderno com a ficha do Me Debata')
class BuildSiteTest(unittest.TestCase):
    def test_external_project_and_next_contribution(self):
        build_site.build()
        html = (ROOT / 'dist/index.html').read_text(encoding='utf-8')
        data = json.loads(re.search(r'const DATA=(.*?);\n', html).group(1))
        ideas = {r['id']: r for r in data['ideas']}
        # Projeto externo: o campo repo chega ao mapa; ideias comuns não ganham repo.
        self.assertEqual(ideas['REP-0015']['repo'], 'https://github.com/fkumagae/Me-Debata')
        self.assertEqual(ideas['REP-0001']['repo'], '')
        # A seção "Próxima contribuição" é lida do IDEA.md.
        self.assertIn('Consultar o repositório', ideas['REP-0015']['next'])


if __name__ == '__main__':
    unittest.main()
