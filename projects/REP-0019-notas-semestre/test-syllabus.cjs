// node projects/REP-0019-notas-semestre/test-syllabus.cjs
// Linhas no formato que o leitor de PDF devolve para um plano de ensino (modelo UNESP), com cabeçalho repetido por página.
const assert = require('node:assert/strict');
const F = require('./app/formula.js');
const S = require('./app/syllabus.js');
const page = (body) => ['Câmpus X', 'PLANO DE ENSINO'].concat(body, ['ATENÇÃO: Este é um documento oficial.', 'www.exemplo.br']);
const doc = (...pages) => pages.flatMap(page);

// Fórmula em várias linhas, fora de ordem, com "x" como multiplicação e "média dos trabalhos" por extenso.
const a = S.parseSyllabus(doc(
  ['Disciplina', '0001 - Disciplina A'],
  ['Critérios de Avaliação da Aprendizagem', 'Será aprovado o aluno com média igual ou superior a 5,0 (cinco).',
   'MS= (N1+N2)/2,', 'N1= 0,9xp1 + 0,1*(média dos trabalhos)', 'N2= 0,9xp2 + 0,1*(média dos trabalhos)',
   'RECUPERAÇÃO:', 'Pn*= (Pn+Pr)/2', 'EXAME FINAL:', 'MFA = (MF + NE) / 2;', 'Ementa (Tópicos)']
), F, 'a.pdf');
assert.equal(a.name, 'Disciplina A');
assert.equal(a.pass, '5,0');
const pa = F.parsePlan(a.formula);
assert.ok(pa.ok, a.formula);
assert.equal(pa.final.name, 'MS');
assert.deepEqual(pa.inputs.map((i) => i.name).sort(), ['P1', 'P2', 'T1', 'T2']);
assert.ok(!/NE|PR/.test(a.formula), 'recuperação e exame ficam de fora');
assert.ok(a.warnings.some((w) => /MT/.test(w)));

// Chaves desbalanceadas e "(R1+...+Rn)/n".
const b = S.parseSyllabus(doc(['Disciplina', 'XY.B - Disciplina B', 'Critérios de Avaliação da Aprendizagem',
  'MF={[(Projeto)]*0,3 + [(R1+R2+R3+......Rn)/n]*0,7]}', 'Para ser aprovado, o aluno deve obter média final (MF) ≥ 5.', 'Ementa']), F);
assert.equal(b.name, 'Disciplina B');
const pb = F.parsePlan(b.formula);
assert.ok(pb.ok, b.formula);
assert.ok(/MF = Projeto\*0,3 \+ media\(R1, R2, R3\)\*0,7/.test(b.formula), b.formula);

// Linhas com "=" em palavras são ignoradas; a média final é a que ninguém usa.
const c = S.parseSyllabus(doc(['Disciplina', 'C - Disciplina C', 'Critérios de Avaliação da Aprendizagem',
  'P1 = média das notas das atividades relativas aos conteúdos de 1 a 2.', 'MF = (0,4*P1 + 0,4*P2 + 0,2*P3)', 'Ementa']), F);
assert.ok(F.parsePlan(c.formula).ok);
assert.ok(/^MF = 0,4\*P1 \+ 0,4\*P2 \+ 0,2\*P3$/m.test(c.formula), c.formula);

// Sem fórmula: devolve o trecho para o aluno copiar.
const d = S.parseSyllabus(doc(['Disciplina', 'D - Disciplina D', 'Critérios de Avaliação da Aprendizagem', 'Provas e trabalhos.', 'Ementa']), F);
assert.equal(d.found, false);
assert.ok(/Provas e trabalhos/.test(d.excerpt));
console.log('PASS leitura de planos de ensino (nome, aprovação, fórmula, trecho)');
