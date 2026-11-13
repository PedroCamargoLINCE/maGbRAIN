const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const createEngine = require('../../neural-engine.cjs');
const core = require('../../core.js');

const campaignDir = __dirname;
const pilotDir = path.resolve(campaignDir, '..', '..');
const referencePath = path.join(pilotDir, 'evaluation.json');
const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));

const starts = [
  { x: -4, y: -3, heading: 0 },
  { x: -4, y: 3, heading: 0 },
  { x: 4, y: -4, heading: Math.PI / 2 },
  { x: 0, y: 4, heading: Math.PI },
  { x: -3, y: 0, heading: -Math.PI / 2 },
  { x: 3, y: 3, heading: Math.PI / 2 }
];
const sources = [{ x: 3, y: 2 }, { x: -2, y: -2 }];
const scenarios = sources.flatMap(source => starts.map(start => ({ start, source })));
const conditions = [
  { id: 'normal', label: 'Leitura normal', transform: values => values },
  { id: 'left-zero', label: 'Esquerda zerada', transform: ([left, right]) => [0, right] },
  { id: 'right-zero', label: 'Direita zerada', transform: ([left]) => [left, 0] },
  { id: 'both-zero', label: 'Ambas zeradas', transform: () => [0, 0] },
  { id: 'swapped', label: 'Leituras trocadas', transform: ([left, right]) => [right, left] },
  { id: 'normal-restored', label: 'Normal restaurada', transform: values => values }
];

function hashFile(name, encoding = 'utf8') {
  const contents = fs.readFileSync(path.join(pilotDir, name));
  const normalized = encoding === 'utf8' ? contents.toString('utf8').replace(/\r\n/g, '\n') : contents;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function equalNumber(a, b) {
  return Math.abs(a - b) <= 1e-12;
}

function trial(engine, calibration, scenario, condition, steps = 1200) {
  engine.reset(false);
  const body = { ...scenario.start };
  const smooth = [0, 0];
  const trace = [];
  let collisions = 0;
  let reached = false;

  for (let step = 0; step < steps; step++) {
    const inputs = core.sensors(body, scenario.source);
    let originalReadout = [0, 0];
    let usedReadout = [0, 0];
    let originalSpikes = [false, false];
    for (let tick = 0; tick < core.params.neuralTicks; tick++) {
      const output = engine.step(...inputs);
      originalReadout = output.map(neuron => neuron.voltage);
      originalSpikes = output.map(neuron => neuron.spike);
      usedReadout = condition.transform(originalReadout);
      usedReadout.forEach((voltage, index) => {
        smooth[index] += 0.02 * (voltage - smooth[index]);
      });
    }

    const motor = core.decode(smooth, calibration);
    const state = core.advance(body, motor, scenario.source);
    collisions += state.collision ? 1 : 0;
    trace.push({
      step,
      x: body.x,
      y: body.y,
      heading: body.heading,
      inputs,
      originalReadout,
      originalSpikes,
      usedReadout,
      voltage: [...smooth],
      motor
    });
    if (state.reached) {
      reached = true;
      break;
    }
  }

  return {
    condition: condition.id,
    start: scenario.start,
    source: scenario.source,
    reached,
    collisions,
    steps: trace.length,
    finalDistance: Math.hypot(body.x - scenario.source.x, body.y - scenario.source.y),
    trace
  };
}

function sameRun(actual, expected) {
  return actual.reached === expected.reached &&
    actual.collisions === expected.collisions &&
    actual.steps === expected.steps &&
    equalNumber(actual.finalDistance, expected.finalDistance);
}

const engine = createEngine();
const calibration = reference.calibration;
const runs = [];
for (const condition of conditions) {
  for (const scenario of scenarios) {
    const run = trial(engine, calibration, scenario, condition);
    runs.push(run);
    console.log(JSON.stringify({
      condition: run.condition,
      start: run.start,
      source: run.source,
      reached: run.reached,
      steps: run.steps,
      finalDistance: run.finalDistance
    }));
  }
}

const referenceNormal = reference.runs.filter(run => run.mode === 'neural');
const normalRuns = runs.filter(run => run.condition === 'normal');
const restoredRuns = runs.filter(run => run.condition === 'normal-restored');
const normalMatches = normalRuns.filter((run, index) => sameRun(run, referenceNormal[index])).length;
const restoredMatches = restoredRuns.filter((run, index) => sameRun(run, referenceNormal[index])).length;
const matrixMatches = JSON.stringify(calibration.matrix) === JSON.stringify(reference.calibration.matrix);

const provenance = {
  'core.js': hashFile('core.js'),
  'engine-access.js': hashFile('engine-access.js'),
  'neural-engine.cjs': hashFile('neural-engine.cjs'),
  'sensory-map.json': hashFile('sensory-map.json'),
  'evaluation.json': hashFile('evaluation.json'),
  'connectome.bin.gz': hashFile(path.join('..', 'data', 'connectome.bin.gz'), 'binary')
};

const result = {
  test: 'REP-0012 Teste 2 — intervenções no readout ALLN',
  execution: {
    runner: 'Node.js local',
    aiCallsPerTrial: 0,
    scenarios: scenarios.length,
    conditions: conditions.map(({ id, label }) => ({ id, label })),
    stepsLimit: 1200
  },
  params: core.params,
  calibration,
  alln: {
    left: { index: 100133, rootId: '720575940632403986' },
    right: { index: 99987, rootId: '720575940623636701' }
  },
  referenceComparison: {
    referencePath: 'app/pilot/evaluation.json',
    referenceNormalRuns: referenceNormal.length,
    calibrationMatrixMatches: matrixMatches,
    normalMatchesReference: normalMatches,
    normalRestoredMatchesReference: restoredMatches,
    normalRestoredMatchesNormal: restoredRuns.filter((run, index) => sameRun(run, normalRuns[index])).length
  },
  provenance,
  runs
};

fs.writeFileSync(path.join(campaignDir, 'results.json'), `${JSON.stringify(result)}\n`);
