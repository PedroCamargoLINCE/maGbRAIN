import unittest,tempfile,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from contributions import load_contributions,aggregate
class ContributionsTest(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  (self.root/'contributions').mkdir();(self.root/'proof.md').write_text('test')
  (self.root/'contributors.json').write_text(json.dumps([{'id':'ana','name':'Ana'},{'id':'bia','name':'Bia'}]))
  self.record=dict(id='delivery',date='2026-11-04',ideas=['REP-0001','REP-0002'],summary='Entrega',types=['code','test'],participants=['ana','bia'],attribution='confirmed',attribution_source='Confirmed in test',evidence=[{'label':'Proof','path':'proof.md'}])
 def tearDown(self): self.tmp.cleanup()
 def write(self): (self.root/'contributions/a.json').write_text(json.dumps(self.record))
 def load(self): self.write();return load_contributions(self.root,['REP-0001','REP-0002'])
 def test_joint_delivery_not_double_counted(self):
  p,c=self.load();a=aggregate('REP-0001',p,c)
  self.assertEqual(a['total'],1);self.assertEqual([x['count'] for x in a['people']],[1,1]);self.assertEqual(aggregate('REP-0002',p,c)['total'],1)
 def test_pending_has_no_credit(self):
  self.record.update(participants=[],attribution='pending');p,c=self.load();a=aggregate('REP-0001',p,c)
  self.assertEqual(a['pending'],1);self.assertEqual(a['people'],[])
 def test_invalid_identity_and_idea(self):
  for field,val in [('participants',['bot-not-registered']),('ideas',['REP-9999'])]:
   with self.subTest(field=field):
    old=self.record[field];self.record[field]=val
    with self.assertRaises(ValueError):self.load()
    self.record[field]=old
 def test_duplicate_delivery(self):
  self.write();(self.root/'contributions/b.json').write_text(json.dumps(self.record))
  with self.assertRaises(ValueError):load_contributions(self.root,['REP-0001','REP-0002'])
 def test_unsafe_or_missing_evidence(self):
  for path in ['../proof.md','/etc/passwd','https://example.com','missing.md']:
   self.record['evidence'][0]['path']=path
   with self.assertRaises(ValueError):self.load()
 def test_empty_history(self):
  p,c=load_contributions(self.root,['REP-0001']);self.assertEqual(aggregate('REP-0001',p,c)['total'],0)
 def test_confirmation_requires_source(self):
  self.record['attribution_source']=''
  with self.assertRaises(ValueError):self.load()
if __name__=='__main__':unittest.main()
