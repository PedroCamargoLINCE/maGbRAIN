import json, subprocess, sys, tempfile, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import new_group


@unittest.skipUnless(any((ROOT / 'ideas').glob('*/IDEA.md')), 'só roda num caderno com ideias, evitando recursão')
class NewGroupTest(unittest.TestCase):
    def test_creates_empty_notebook_that_builds(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = new_group.create(Path(tmp) / 'casa', 'Caderno <da> Casa', 'https://github.com/amigos/caderno')
            self.assertEqual(list((target / 'ideas').glob('*/IDEA.md')), [])
            self.assertEqual(json.loads((target / 'contributors.json').read_text()), [])
            self.assertFalse((target / 'projects/REP-0012-cerebro-mosca').exists())
            self.assertNotIn('Felipe', (target / 'AGENTS.md').read_text())
            index = (target / 'web/index.html').read_text()
            self.assertIn('<title>Caderno &lt;da&gt; Casa · Mapa de ideias</title>', index)
            self.assertIn('https://github.com/amigos/caderno', index)
            self.assertNotIn('PedroCamargoLINCE', index)
            self.assertIn('amigos.github.io/caderno', (target / 'docs/MAPA.md').read_text())
            built = subprocess.run([sys.executable, 'scripts/build_site.py'], cwd=target, capture_output=True, text=True)
            self.assertEqual(built.returncode, 0, built.stderr)
            self.assertIn('Built 0 ideas', built.stdout)
            tests = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests'], cwd=target, capture_output=True, text=True)
            self.assertEqual(tests.returncode, 0, tests.stderr)

    def test_refuses_non_empty_folder(self):
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / 'x').write_text('x')
            with self.assertRaises(SystemExit):
                new_group.create(tmp, 'X')


if __name__ == '__main__':
    unittest.main()
