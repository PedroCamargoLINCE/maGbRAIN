const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'app/script.js'), 'utf8').split('function updateOutputs()')[0];
const context = { document: { getElementById: () => null } };
vm.createContext(context);
vm.runInContext(source, context);
const results = JSON.parse(vm.runInContext(`JSON.stringify((() => {
  const zero = forwardKinematics([0,0,0,0,0,0]);
  ROBOT_PARAMETERS.mode = 'cosimir';
  const photo = forwardKinematics([10,45,70,70,15,20]);
  const [x,y,z] = rpyFromR(photo.R);
  return {zero:zero.T.slice(0,3).map(row=>row[3]), position:photo.T.slice(0,3).map(row=>row[3]), orientation:[z,y,x]};
})())`, context));
assert.deepEqual(results.zero, [43,0,829]);
for (const [field, expected] of [['position',[497.5,159.4,373.9]],['orientation',[136.8,32.2,125.2]]]) {
  results[field].forEach((value,i) => assert.equal(Number(value.toFixed(1)), expected[i]));
}
console.log('PASS schematic zero and all six rounded COSIMIR components');
