// node projects/REP-0019-notas-semestre/test-formula.cjs
const assert = require('node:assert/strict');
const F = require('./app/formula.js');
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} ≠ ${b}`);

// Fórmula do exemplo, escrita como no plano de ensino (vírgula decimal, maiúsculas misturadas).
const plan = F.parsePlan('MP = media(P1, P2, P3)\nMT = média(T1, T2, T3)\n0,7*Mp + 0,3*Mt');
assert.ok(plan.ok, JSON.stringify(plan.errors));
assert.deepEqual(plan.inputs.map((i) => i.name), ['P1', 'P2', 'P3', 'T1', 'T2', 'T3']);
assert.equal(plan.final.display, 'Média final');
const all = { P1: 6, P2: 5, P3: 7, T1: 8, T2: 9, T3: 10 };
near(F.evaluate(plan, all).final, 0.7 * 6 + 0.3 * 9, 'média final');

// Saíram P1, P2 e um trabalho: quanto preciso na P3 (e nos trabalhos que faltam) para fechar 5?
const base = { P1: 4, P2: 5, T1: 8 };
const r = F.solve(plan, base, ['P3', 'T2', 'T3'], 5, 10);
assert.equal(r.status, 'ok');
// 0,7*(9+x)/3 + 0,3*(8+2x)/3 = 5  →  6,3 + 0,7x + 2,4 + 0,6x = 15  →  x = 6,3/1,3
near(r.x, 6.3 / 1.3, 'nota necessária');
assert.equal(r.ceil, 4.85);
// Só a P3 em aberto, trabalhos fixados em 10.
const r2 = F.solve(plan, Object.assign({}, base, { T2: 10, T3: 10 }), ['P3'], 5, 10);
near(r2.x, (15 - 0.3 * 28 - 0.7 * 9) / 0.7, 'só P3');
assert.equal(F.solve(plan, { P1: 10, P2: 10, T1: 10 }, ['P3', 'T2', 'T3'], 5, 10).status, 'garantido');
assert.equal(F.solve(plan, { P1: 0, P2: 0, T1: 0 }, ['P3', 'T2', 'T3'], 5, 10).status, 'impossivel');

// Pesos que não somam 1 são aceitos como escritos.
const odd = F.parsePlan('MP = media(P1;P2)\nMT = soma(T1, T2)\nMF = 0.7*MP + 0.8*MT');
assert.ok(odd.ok);
near(F.evaluate(odd, { P1: 10, P2: 10, T1: 10, T2: 10 }).final, 23, 'pesos livres');

// Funções e porcentagem.
const best = F.parsePlan('MP = melhores(2; P1, P2, P3)\nMF = 60% * MP + 40% * max(T1, T2)');
assert.ok(best.ok, JSON.stringify(best.errors));
near(F.evaluate(best, { P1: 2, P2: 8, P3: 6, T1: 5, T2: 9 }).final, 0.6 * 7 + 0.4 * 9, 'melhores e %');

// Erros com número da linha.
const bad = F.parsePlan('MP = media(P1, P2\nMF = foo(MP)');
assert.equal(bad.ok, false);
assert.deepEqual(bad.errors.map((e) => e.line), [1, 2]);
const cyc = F.parsePlan('A = B + P1\nB = A + 1\nMF = A');
assert.ok(cyc.errors.some((e) => /circular/.test(e.msg)));
assert.equal(F.parseGrade('7,5'), 7.5);
assert.equal(F.parseGrade(''), null);
console.log('PASS fórmula do plano, cálculo, "quanto preciso" e erros');

// Fórmulas reais de quatro planos de ensino (UNESP), transcritas para a sintaxe do piloto.
// Cálculo: N1/N2 com trabalhos; prova de recuperação substitui N1 ou N2 só se for vantajoso.
const calc = F.parsePlan('MT = media(T1, T2)\nN1 = 0,9*P1 + 0,1*MT\nN2 = 0,9*P2 + 0,1*MT\nMF = max(N1 + N2; max(N1, N2) + REC) / 2');
assert.ok(calc.ok, JSON.stringify(calc.errors));
near(F.evaluate(calc, { T1: 8, T2: 6, P1: 3, P2: 6, REC: 0 }).final, (0.9 * 3 + 0.7 + 0.9 * 6 + 0.7) / 2, 'cálculo sem rec');
near(F.evaluate(calc, { T1: 8, T2: 6, P1: 3, P2: 6, REC: 7 }).final, (0.9 * 6 + 0.7 + 7) / 2, 'cálculo rec substitui N1');
// Controle de processos: média ponderada de P1..P3.
const cpi = F.parsePlan('MF = 0,4*P1 + 0,4*P2 + 0,2*P3');
near(F.evaluate(cpi, { P1: 5, P2: 6, P3: 10 }).final, 6.4, 'controle');
// Laboratório: projeto e média de n relatórios.
const lab = F.parsePlan('MR = media(R1, R2, R3, R4, R5)\nMF = 0,3*Projeto + 0,7*MR');
assert.ok(lab.ok);
// Circuitos: MP e MT; recuperação Pn* = min((Pn+Pr)/2; 5).
const ce = F.parsePlan('P1x = min((P1 + PR1)/2; 5)\nMP = media(P1x, P2)\nMT = media(T1, T2)\nMF = 0,9*MP + 0,1*MT');
near(F.evaluate(ce, { P1: 2, PR1: 9, P2: 6, T1: 8, T2: 8 }).final, 0.9 * 5.5 + 0.8, 'circuitos com rec');
// Exame (regra comum): MFA = (MF + NE)/2 ≥ 5  →  NE ≥ 10 − MF.
const exame = F.parsePlan('MFA = (MF + NE) / 2');
near(F.solve(exame, { MF: 3.5 }, ['NE'], 5, 10).x, 6.5, 'exame');
// Arredondamento da Unesp: uma casa, segunda casa ≥ 5 sobe.
assert.deepEqual([4.96, 9.18, 9.14, 9.15, 4.95, 4.94, 7.25].map(F.round1), [5, 9.2, 9.1, 9.2, 5, 4.9, 7.3]);
// Com arredondamento, MP e MT também valem com uma casa: P1=4,9 e P2=5 dão MP=5,0 (4,95).
const rp = F.parsePlan('MP = media(P1, P2)\nMT = media(T1, T2, T3)\nMF = 0,7*MP + 0,3*MT');
const ev = F.evaluate(rp, { P1: 4.9, P2: 5, T1: 4.9, T2: 5, T3: 5 }, { round: true });
near(ev.vars.MP, 5, 'MP arredondada'); near(ev.vars.MT, 5, 'MT arredondada (4,967)'); near(ev.final, 5, 'MF arredondada');
near(F.evaluate(rp, { P1: 4.9, P2: 5, T1: 4.9, T2: 5, T3: 5 }).final, 0.7 * 4.95 + 0.3 * 14.9 / 3, 'sem arredondar');
// "Quanto preciso" com arredondamento: a resposta é a menor nota que fecha 5 depois de arredondar tudo.
const rr = F.solve(plan, { P1: 4, P2: 5, T1: 8 }, ['P3', 'T2', 'T3'], 5, 10, { round: true });
const at = (x) => F.evaluate(plan, { P1: 4, P2: 5, T1: 8, P3: x, T2: x, T3: x }, { round: true }).final;
assert.ok(at(rr.ceil) >= 5 && at(rr.ceil - 0.01) < 5, 'mínimo com arredondamento');
assert.ok(rr.ceil < 4.85, 'arredondar reduz o mínimo em relação a 4,85');
console.log('PASS fórmulas de quatro planos de ensino reais e arredondamento');
