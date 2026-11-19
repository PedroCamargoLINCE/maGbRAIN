import unittest,sys
from pathlib import Path
from xml.dom import minidom
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import placar
class PlacarTest(unittest.TestCase):
 def setUp(self):
  self.ideas=[{'status':'inbox'},{'status':'inbox'},{'status':'trying'}]
  self.people=[{'id':'ana','name':'Ana <&>'},{'id':'bia','name':'Bia'},{'id':'caio','name':'Caio'}]
  self.contributions=[dict(participants=['ana','bia'],attribution='confirmed'),dict(participants=['ana'],attribution='confirmed'),dict(participants=[],attribution='pending')]
 def test_counts(self):
  s=placar.stats(self.ideas,self.people,self.contributions,1)
  self.assertEqual((s['ideas'],s['projects'],s['contributions'],s['people'],s['pending']),(3,1,3,2,1))
  self.assertEqual(s['ranking'],[('Ana <&>',2),('Bia',1)])
  self.assertEqual(s['states'],[('inbox',2),('trying',1)])
 def test_svg_is_well_formed(self):
  for args in [(self.ideas,self.people,self.contributions,1),([],[],[],0)]:
   minidom.parseString(placar.render(placar.stats(*args)))
if __name__=='__main__':unittest.main()
