const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),core=require('../../core.js');
const campaignDir=__dirname,pilotDir=path.resolve(campaignDir,'..','..'),appDir=path.resolve(pilotDir,'..');
const mapPath=path.join(pilotDir,'sensory-map.json'),map=JSON.parse(fs.readFileSync(mapPath,'utf8'));
const worker=fs.readFileSync(path.join(appDir,'js','sim-worker.js'),'utf8').replace(/\r\n/g,'\n');
const compressed=fs.readFileSync(path.join(appDir,'data','connectome.bin.gz'));
const access=fs.readFileSync(path.join(pilotDir,'engine-access.js'),'utf8');
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
if(sha256(Buffer.from(worker,'utf8'))!==map.canonicalWorkerSHA256||sha256(compressed)!==map.connectomeSHA256)throw Error('Model mismatch');
function createEngine(readout){
 const buffer=zlib.gunzipSync(compressed),selected={...map,readout};
 return new Function('self','performance','setTimeout','binary','map',`${worker}\n${access}\nparseBinary(binary);buildGroupStructures();return createPilotEngine(map);`)({postMessage:()=>{}},performance,()=>0,buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),selected);
}
const starts=[{x:-4,y:-3,heading:0},{x:-4,y:3,heading:0},{x:4,y:-4,heading:Math.PI/2},{x:0,y:4,heading:Math.PI},{x:-3,y:0,heading:-Math.PI/2},{x:3,y:3,heading:Math.PI/2}],sources=[{x:3,y:2},{x:-2,y:-2}],scenarios=sources.flatMap(source=>starts.map(start=>({start,source})));
const conditions=[['normal',v=>v],['left-zero',([,r])=>[0,r]],['right-zero',([l])=>[l,0]],['both-zero',()=>[0,0]],['swapped',([l,r])=>[r,l]],['normal-restored',v=>v]];
const pairs=[
 {id:'alpn-right-alln-right',left:{index:100555,rootId:'720575940622726271',class:'ALPN'},right:{index:99987,rootId:'720575940623636701',class:'ALLN'}},
 {id:'alln-left-alpn-right',left:{index:100133,rootId:'720575940632403986',class:'ALLN'},right:{index:100555,rootId:'720575940622726271',class:'ALPN'}}
];
function trial(engine,calibration,scenario,transform){
 engine.reset(false);const body={...scenario.start},smooth=[0,0],trace=[];let collisions=0,reached=false;
 for(let step=0;step<1200;step++){
  const inputs=core.sensors(body,scenario.source);let originalReadout=[0,0],usedReadout=[0,0],originalSpikes=[false,false];
  for(let tick=0;tick<core.params.neuralTicks;tick++){const output=engine.step(...inputs);originalReadout=output.map(n=>n.voltage);originalSpikes=output.map(n=>n.spike);usedReadout=transform(originalReadout);usedReadout.forEach((v,i)=>{smooth[i]+=.02*(v-smooth[i]);});}
  const motor=core.decode(smooth,calibration),state=core.advance(body,motor,scenario.source);collisions+=state.collision?1:0;
  trace.push({step,x:body.x,y:body.y,heading:body.heading,inputs,originalReadout,originalSpikes,usedReadout,voltage:[...smooth],motor});
  if(state.reached){reached=true;break;}
 }
 return {start:scenario.start,source:scenario.source,reached,collisions,steps:trace.length,finalDistance:Math.hypot(body.x-scenario.source.x,body.y-scenario.source.y),trace};
}
function hash(file,binary=false){const data=fs.readFileSync(file);return crypto.createHash('sha256').update(binary?data:data.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');}
const runs=[],calibrations={};
for(const pair of pairs){const engine=createEngine([pair.left,pair.right]),calibration=core.calibrate(engine);calibrations[pair.id]=calibration;
 for(const [condition,transform] of conditions)for(const scenario of scenarios){const run=trial(engine,calibration,scenario,transform);runs.push({pair:pair.id,condition,...run});console.log(JSON.stringify({pair:pair.id,condition,reached:run.reached,steps:run.steps,finalDistance:run.finalDistance}));}
}
const provenance={'core.js':hash(path.join(pilotDir,'core.js')),'engine-access.js':hash(path.join(pilotDir,'engine-access.js')),'neural-engine.cjs':hash(path.join(pilotDir,'neural-engine.cjs')),'sensory-map.json':hash(mapPath),'connectome.bin.gz':hash(path.join(appDir,'data','connectome.bin.gz'),true),'evaluate.cjs':hash(path.join(campaignDir,'evaluate.cjs'))};
fs.writeFileSync(path.join(campaignDir,'results.json'),JSON.stringify({test:'REP-0012 Teste 3 — readout alternativo com ALPN 100555',execution:{runner:'Node.js local',aiCallsPerTrial:0,scenarios:12,pairs:pairs.map(p=>p.id),conditions:conditions.map(([id])=>id),stepsLimit:1200},params:core.params,calibrations,pairs,provenance,runs})+'\n');
