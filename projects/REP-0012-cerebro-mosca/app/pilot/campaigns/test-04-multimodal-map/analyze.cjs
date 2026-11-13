const fs=require('node:fs'),path=require('node:path');
const dir=__dirname;
const rawDir=path.join(dir,'run');
const report=JSON.parse(fs.readFileSync(path.join(rawDir,'report.json'),'utf8'));
const config=report.config;
const groups=new Map(report.groups.map(group=>[group.id,group.name]));
const neurons=new Map();
const cases=[];
const modalityOf=group=>group.startsWith('OLF_')?'odor':group.startsWith('VIS_')?'visual':group.startsWith('MECH_')?'contact':'other';

for(const result of report.results){
  const definition=config.cases.find(item=>item.id===result.id);
  const modalities=[...new Set(definition.stimuli.map(stimulus=>modalityOf(stimulus.group)))];
  cases.push({id:result.id,steps:result.steps,modalities,downstreamSpikes:result.downstreamSpikes,responderCount:result.responders.length});
  for(const responder of result.responders){
    const item=neurons.get(responder.sortedIndex)||{
      sortedIndex:responder.sortedIndex,
      groups:[],
      modalities:{},
      cases:[],
      totalSpikes:0,
      maxPeakV:0
    };
    const group=groups.get(responder.groupId)||`group-${responder.groupId}`;
    if(!item.groups.includes(group))item.groups.push(group);
    for(const modality of modalities){
      const evidence=item.modalities[modality]||{cases:0,totalSpikes:0,maxPeakV:0};
      evidence.cases++;
      evidence.totalSpikes+=responder.spikes;
      evidence.maxPeakV=Math.max(evidence.maxPeakV,responder.peakV);
      item.modalities[modality]=evidence;
    }
    item.cases.push(result.id);
    item.totalSpikes+=responder.spikes;
    item.maxPeakV=Math.max(item.maxPeakV,responder.peakV);
    neurons.set(responder.sortedIndex,item);
  }
}

const exported=[...neurons.values()].sort((a,b)=>b.maxPeakV-a.maxPeakV).map(item=>({
  ...item,
  groups:item.groups.sort(),
  cases:item.cases.sort()
}));
const modalities=['odor','visual','contact'];
const counts=Object.fromEntries(modalities.map(modality=>[
  modality,
  exported.filter(neuron=>neuron.modalities[modality]).length
]));
const output={
  schema:'rep-0012-neural-map-v1',
  source:'test-04-multimodal-map',
  criterion:'initial candidate pool: spike count or peak potential >= 0.1 over the full case after excluding stimulated input groups; not a modality-selectivity claim',
  model:report.provenance,
  rawReport:'run/report.json',
  parameters:report.config.parameters,
  counts,
  cases,
  neurons:exported
};
fs.writeFileSync(path.join(dir,'neuron-map.json'),JSON.stringify(output)+'\n');
const top=modality=>exported.filter(neuron=>neuron.modalities[modality]).slice(0,10).map(neuron=>neuron.sortedIndex).join(', ')||'nenhum';
const lines=[
  '# REP-0012 · Teste 4 — mapa multimodal de respostas',
  '',
  `A campanha foi concluída com ${cases.length} ensaios locais, sem chamadas de IA.`,
  'O executor preservou o worker neural, o conectoma e os parâmetros originais.',
  '',
  '| Modalidade | Ensaios | Neurônios responsivos |',
  '|---|---:|---:|',
  `| Odor | ${cases.filter(item=>item.modalities.includes('odor')).length} | ${counts.odor} |`,
  `| Visão | ${cases.filter(item=>item.modalities.includes('visual')).length} | ${counts.visual} |`,
  `| Contato | ${cases.filter(item=>item.modalities.includes('contact')).length} | ${counts.contact} |`,
  '',
  'Candidatos de maior potencial por modalidade (índices internos):',
  `- odor: ${top('odor')}`,
  `- visão: ${top('visual')}`,
  `- contato: ${top('contact')}`,
  '',
  '`neuron-map.json` é o artefato exportável para a próxima etapa de integração.',
  'A resposta indica atividade sensorial no simulador; não identifica sozinha',
  'um comando motor nem uma função biológica.'
];
fs.writeFileSync(path.join(dir,'REPORT.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({cases:cases.length,neurons:exported.length,counts}));
