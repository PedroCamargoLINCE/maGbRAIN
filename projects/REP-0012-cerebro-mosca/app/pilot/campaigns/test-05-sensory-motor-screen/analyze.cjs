const fs=require('node:fs'),path=require('node:path');
const dir=__dirname,rawDir=path.join(dir,'run');
const report=JSON.parse(fs.readFileSync(path.join(rawDir,'report.json'),'utf8'));
const groupById=new Map(report.groups.map(group=>[group.id,group.name]));
const gngId=report.groups.find(group=>group.name==='GNG_DESC').id;
const modalityOf=caseId=>caseId.includes('visual')?'visual':caseId.includes('contact')?'contact':caseId.includes('danger')?'danger':'other';
const cases=report.results.map(result=>{
  const definition=report.config.cases.find(item=>item.id===result.id);
  return {
    id:result.id,
    modality:modalityOf(result.id),
    stimuli:definition.stimuli,
    ablated:definition.disconnectOutgoing||[],
    gngDescSpikes:result.groupTotals[gngId],
    downstreamSpikes:result.downstreamSpikes,
    responders:result.responders
  };
});
const base=new Map(cases.filter(item=>!item.ablated.length).map(item=>[item.id,item]));
const ablations=cases.filter(item=>item.ablated.length).map(item=>{
  const baseId=item.id.replace(/^abl-\d+-/,'');
  const reference=base.get(baseId);
  return {id:item.id,baseId,candidate:item.ablated[0],modality:item.modality,baseGngDescSpikes:reference&&reference.gngDescSpikes,gngDescSpikes:item.gngDescSpikes,gngDelta:reference?item.gngDescSpikes-reference.gngDescSpikes:null,downstreamSpikes:item.downstreamSpikes};
});
const output={
  schema:'rep-0012-sensory-motor-screen-v1',
  source:'test-05-sensory-motor-screen',
  model:report.provenance,
  parameters:report.config.parameters,
  outputGroup:{name:'GNG_DESC',id:gngId,interpretation:'saída descendente observável; não é comando motor validado'},
  cases:cases.map(({responders,...item})=>item),
  ablations,
  interpretation:'GNG_DESC activity is a screening signal only; zero activity does not prove absence of escape, walking, stopping, or motor function.'
};
fs.writeFileSync(path.join(dir,'sensor-motor-screening.json'),JSON.stringify(output)+'\n');
const signals=cases.filter(item=>item.gngDescSpikes>0);
const lines=[
  '# REP-0012 · Teste 5 — triagem sensorial e saída descendente',
  '',
  `A campanha concluiu ${cases.length} ensaios locais. O grupo observado como saída descendente foi GNG_DESC (índice ${gngId}).`,
  '',
  '| Classe | Ensaios com disparos GNG_DESC | Total |',
  '|---|---:|---:|',
  ...['visual','contact','danger','other'].map(modality=>`| ${modality} | ${signals.filter(item=>item.modality===modality).length} | ${cases.filter(item=>item.modality===modality).length} |`),
  '',
  `Ablações seletivas: ${ablations.length} ensaios em ${new Set(ablations.map(item=>item.candidate)).size} candidatos.`,
  'Os detalhes por caso, potenciais e candidatos estão em `run/`; o resumo exportável está em `sensor-motor-screening.json`.',
  '',
  'Este teste procura evidência de transmissão sensorial para uma população descendente.',
  'Não transforma GNG_DESC em comando de andar, parar ou fugir: uma resposta zero',
  'não descarta circuito motor, e uma resposta positiva não prova a função.'
];
fs.writeFileSync(path.join(dir,'REPORT.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({cases:cases.length,gngDescId:gngId,gngCases:signals.length,ablations:ablations.length}));
