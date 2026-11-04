"""Build a static catalog from idea records; Python standard library only."""
import json, re, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
STATES=['inbox','exploring','ready','building','trying','done','parked']
def build():
    records=[]
    for p in sorted((ROOT/'ideas').glob('*/IDEA.md')):
        raw=p.read_text()
        front=raw.split('---',2)[1]
        meta=dict(re.findall(r'^([a-z_]+):\s*(.*)$',front,re.M))
        ident=meta['id']; status=meta.get('status','inbox')
        if status not in STATES: raise ValueError(f'{p}: unknown status {status}')
        def section(prefix):
            return next((s.split('\n',1)[1].strip() for s in raw.split('\n## ')[1:] if s.startswith(prefix)), '')
        records.append(dict(id=ident,title=meta['title'].strip('"'),status=status,summary=section('Registro'),next=section('Próxima'),path=p.relative_to(ROOT).as_posix()))
    ids=[r['id'] for r in records]
    if len(ids)!=len(set(ids)): raise ValueError('Duplicate IDs')
    links=json.loads((ROOT/'web/relations.json').read_text())
    links=[l for l in links if l['source'] in ids and l['target'] in ids]
    out=ROOT/'dist'; out.mkdir(exist_ok=True)
    html=(ROOT/'web/index.html').read_text()
    data=json.dumps(dict(ideas=records,links=links),ensure_ascii=False).replace('<','\\u003c')
    (out/'index.html').write_text(html.replace('/*CATALOG*/',data))
    (out/'.nojekyll').touch()
    print(f'Built {len(records)} ideas and {len(links)} relationships')
if __name__=='__main__': build()
