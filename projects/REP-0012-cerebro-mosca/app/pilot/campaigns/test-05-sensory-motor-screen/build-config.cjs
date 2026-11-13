const fs=require('node:fs'),path=require('node:path');
const dir=__dirname;
const cases=[
  {id:'blank',stimuli:[]},
  {id:'visual-r1r6',stimuli:[{group:'VIS_R1R6',start:20,end:140,current:.3,profile:'constant'}]},
  {id:'visual-lo',stimuli:[{group:'VIS_LO',start:20,end:140,current:.3,profile:'constant'}]},
  {id:'visual-lptc',stimuli:[{group:'VIS_LPTC',start:20,end:140,current:.3,profile:'constant'}]},
  {id:'visual-me',stimuli:[{group:'VIS_ME',start:20,end:140,current:.1,profile:'constant'}]},
  {id:'contact-bristle',stimuli:[{group:'MECH_BRISTLE',start:20,end:140,current:.3,profile:'constant'}]},
  {id:'contact-jo',stimuli:[{group:'MECH_JO',start:20,end:140,current:.3,profile:'constant'}]},
  {id:'danger-odor',stimuli:[{group:'OLF_ORN_DANGER',start:20,end:140,current:.3,profile:'constant'}]},
  {id:'visual-contact',stimuli:[{group:'VIS_R1R6',start:20,end:140,current:.15,profile:'constant'},{group:'MECH_BRISTLE',start:20,end:140,current:.15,profile:'constant'}]},
  {id:'visual-danger',stimuli:[{group:'VIS_R1R6',start:20,end:140,current:.15,profile:'constant'},{group:'OLF_ORN_DANGER',start:20,end:140,current:.15,profile:'constant'}]},
  {id:'contact-danger',stimuli:[{group:'MECH_BRISTLE',start:20,end:140,current:.15,profile:'constant'},{group:'OLF_ORN_DANGER',start:20,end:140,current:.15,profile:'constant'}]},
  {id:'all-sensory',stimuli:[{group:'VIS_R1R6',start:20,end:140,current:.1,profile:'constant'},{group:'MECH_BRISTLE',start:20,end:140,current:.1,profile:'constant'},{group:'OLF_ORN_DANGER',start:20,end:140,current:.1,profile:'constant'}]},
  {id:'visual-ramp',stimuli:[{group:'VIS_R1R6',start:20,end:140,current:.3,profile:'ramp'}]},
  {id:'visual-pulse',stimuli:[{group:'VIS_R1R6',start:20,end:140,current:.3,profile:'pulse',period:20,on:5}]},
  {id:'contact-pulse',stimuli:[{group:'MECH_BRISTLE',start:20,end:140,current:.3,profile:'pulse',period:20,on:5}]},
  {id:'danger-pulse',stimuli:[{group:'OLF_ORN_DANGER',start:20,end:140,current:.3,profile:'pulse',period:20,on:5}]}
].map(item=>({steps:200,...item}));
const baseById=new Map(cases.map(item=>[item.id,item]));
const candidates=[100437,99973,100555,99987,100133,100136];
for(const candidate of candidates)for(const baseId of ['visual-r1r6','contact-bristle','danger-odor']){
  const base=baseById.get(baseId);
  cases.push({id:`abl-${candidate}-${baseId}`,steps:200,stimuli:base.stimuli,disconnectOutgoing:[candidate]});
}
const config={version:1,name:'Teste 5: triagem sensorial e saída descendente',parameters:{threshold:1,leak:.95,refractory:3},watch:[99987,100133,100555],cases};
fs.writeFileSync(path.join(dir,'config.json'),JSON.stringify(config,null,2)+'\n');
console.log(JSON.stringify({cases:cases.length,candidates}));
