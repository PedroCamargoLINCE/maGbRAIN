const assert=require('node:assert/strict'),{validate}=require('./app/layers.js'),{fold}=require('./app/patterns.js');
const v={style:'truchet',seed:'mag',detail:'45',colorCount:'4',paletteMode:'auto'},manual=Array(8).fill('#abcdef');
const old=validate({version:1,values:v,manual});assert.equal(old.layers.length,1);assert.equal(old.layers[0].values.opacity,'100');
const data={version:2,values:old.values,layers:[old.layers[0],structuredClone(old.layers[0])],activeLayer:1};data.layers[1].values.opacity='25';
assert.deepEqual(validate(JSON.parse(JSON.stringify(data))),{values:old.values,layers:data.layers,activeLayer:1});
for(const change of [d=>d.layers[0].values.opacity='200',d=>d.layers[0].values.slices='7',d=>d.layers[0].values.style='unknown',d=>d.layers=[],d=>d.activeLayer=9,d=>d.values.background='javascript:bad']){const bad=structuredClone(data);change(bad);assert.throws(()=>validate(bad));}
const k={x:50,y:50,slices:8,rotation:0,zoom:100};
const a=fold(.65,.6,1,k),b=fold(.65,.4,1,k);assert(Math.abs(a[0]-b[0])<1e-12&&Math.abs(a[1]-b[1])<1e-12);
assert.notDeepEqual(a,fold(.65,.6,1,{...k,zoom:200}));
console.log('OK: legacy config, multilayer roundtrip, invalid inputs and kaleidoscope symmetry');
