// Run: node projects/REP-0014-mag-batas/test-patterns.cjs
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const P=require('./app/patterns.js');
function sample(style,seed,colors){const calls=[];const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:img=>calls.push(Buffer.from(img.data).toString('hex'))},{get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args]),set:(o,k,v)=>{calls.push([k,v]);o[k]=v;return true;}});P.render(ctx,64,80,{style,seed,colors,detail:45});return crypto.createHash('sha256').update(JSON.stringify(calls)).digest('hex');}
for(const style of ['fractal','geometry','psychedelic']){
 const c=P.palette('mag',4),a=sample(style,'mag',c);
 assert.equal(a,sample(style,'mag',c),style+' reproducible');
 assert.notEqual(a,sample(style,'outra',c),style+' seed affects output');
 assert.notEqual(a,sample(style,'mag',['#000000','#ffffff']),style+' palette affects output');
}
assert.deepEqual(P.palette('mag',8),P.palette('mag',8));
assert.equal(P.palette('mag',8).length,8);
assert(P.palette('mag',8).every(c=>/^#[0-9a-f]{6}$/.test(c)));
console.log('OK: three seeded algorithms, palette variation and deterministic output');
