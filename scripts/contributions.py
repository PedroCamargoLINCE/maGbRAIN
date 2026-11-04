"""Explicit human attribution. Never derives identity from commit/PR authors."""
import json, re
from pathlib import Path
from datetime import date
TYPES={'ideation','research','code','design','test','documentation','physical'}
def load_contributions(root, idea_ids):
    root=Path(root)
    people_path=root/'contributors.json'
    people=json.loads(people_path.read_text()) if people_path.exists() else []
    persons={}
    for p in people:
        if set(p)-{'id','name','github'} or not re.fullmatch(r'[a-z0-9][a-z0-9-]*',p.get('id','')) or not p.get('name','').strip():
            raise ValueError('Invalid human profile')
        if p['id'] in persons: raise ValueError('Duplicate person ID')
        if p.get('github') and not re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?',p['github']):
            raise ValueError('Invalid GitHub username')
        persons[p['id']]=p
    records=[]; seen=set()
    for path in sorted((root/'contributions').glob('*.json')):
        c=json.loads(path.read_text())
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]*',c.get('id','')) or c['id'] in seen: raise ValueError('Invalid/duplicate contribution ID')
        seen.add(c['id'])
        date.fromisoformat(c['date'])
        if not c.get('summary','').strip(): raise ValueError('Missing summary')
        if not c.get('ideas') or len(c['ideas'])!=len(set(c['ideas'])) or not set(c['ideas'])<=set(idea_ids): raise ValueError('Invalid idea references')
        if not c.get('types') or not set(c['types'])<=TYPES: raise ValueError('Invalid contribution types')
        participants=c.get('participants',[])
        if len(participants)!=len(set(participants)) or not set(participants)<=set(persons): raise ValueError('Invalid participants')
        if c.get('attribution') not in ('confirmed','pending'): raise ValueError('Invalid attribution state')
        if c['attribution']=='confirmed' and not participants: raise ValueError('Confirmed attribution requires humans')
        if c['attribution']=='pending' and participants: raise ValueError('Pending attribution cannot award credit')
        if c['attribution']=='confirmed' and not c.get('attribution_source','').strip(): raise ValueError('Missing human confirmation source')
        if not c.get('evidence'): raise ValueError('Missing evidence')
        for e in c['evidence']:
            if not e.get('label','').strip(): raise ValueError('Missing evidence label')
            target=e.get('path','')
            if not target or Path(target).is_absolute() or '..' in Path(target).parts or not (root/target).is_file(): raise ValueError('Evidence file does not exist')
        c['record_path']=path.relative_to(root).as_posix()
        records.append(c)
    records.sort(key=lambda c:(c['date'],c['id']),reverse=True)
    return people,records

def aggregate(idea_id,people,records):
    relevant=[c for c in records if idea_id in c['ideas']]
    totals={}
    for c in relevant:
        for ident in c['participants']:
            t=totals.setdefault(ident,{'id':ident,'count':0,'types':set()})
            t['count']+=1;t['types'].update(c['types'])
    return {'total':len(relevant),'pending':sum(c['attribution']=='pending' for c in relevant),
            'people':[dict(t,types=sorted(t['types'])) for _,t in sorted(totals.items())]}
