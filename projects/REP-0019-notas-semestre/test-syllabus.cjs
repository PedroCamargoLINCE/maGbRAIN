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
assert.deepEqual(pa.inputs.map((i) => i.name).sort(), ['P1', 'P2', 'T1', 'T2', 'T3']);
assert.ok(!/NE|PR/.test(a.formula), 'recuperação e exame ficam de fora');
assert.ok(a.warnings.some((w) => /MT/.test(w)));

// Chaves desbalanceadas e "(R1+...+Rn)/n".
const b = S.parseSyllabus(doc(['Disciplina', 'XY.B - Disciplina B', 'Critérios de Avaliação da Aprendizagem',
  'MF={[(Projeto)]*0,3 + [(R1+R2+R3+......Rn)/n]*0,7]}', 'Para ser aprovado, o aluno deve obter média final (MF) ≥ 5.', 'Ementa']), F);
assert.equal(b.name, 'Disciplina B');
const pb = F.parsePlan(b.formula);
assert.ok(pb.ok, b.formula);
assert.ok(/^MR = media\(R1, R2, R3\)$/m.test(b.formula) && /^MF = Projeto\*0,3 \+ MR\*0,7$/m.test(b.formula), b.formula);

// Linhas com "=" em palavras são ignoradas; a média final é a que ninguém usa.
const c = S.parseSyllabus(doc(['Disciplina', 'C - Disciplina C', 'Critérios de Avaliação da Aprendizagem',
  'P1 = média das notas das atividades relativas aos conteúdos de 1 a 2.', 'MF = (0,4*P1 + 0,4*P2 + 0,2*P3)', 'Ementa']), F);
assert.ok(F.parsePlan(c.formula).ok);
assert.ok(/^MF = 0,4\*P1 \+ 0,4\*P2 \+ 0,2\*P3$/m.test(c.formula), c.formula);

// Sem fórmula: devolve o trecho para o aluno copiar.
const d = S.parseSyllabus(doc(['Disciplina', 'D - Disciplina D', 'Critérios de Avaliação da Aprendizagem', 'Provas e trabalhos.', 'Ementa']), F);
assert.equal(d.found, false);
assert.ok(/Provas e trabalhos/.test(d.excerpt));
// MP e MT nunca viram campos: médias citadas só em texto viram a média das notas.
const e = S.parseSyllabus(doc(['Disciplina', 'E - Disciplina E', 'Critérios de Avaliação da Aprendizagem',
  'A disciplina possui 2 provas teóricas.', 'MF = (0,5 MP + 0,5 MT)', 'Sendo', 'MP = Média das Provas',
  'MT = Média dos relatórios dos experimentos de laboratório', 'Ementa']), F);
const pe = F.parsePlan(e.formula);
assert.ok(pe.ok, e.formula);
assert.deepEqual(pe.inputs.map((i) => i.name), ['P1', 'P2', 'R1', 'R2', 'R3'], e.formula);
assert.ok(/^MF = 0,5\*MP \+ 0,5\*MT$/m.test(e.formula), e.formula);

// Conta com explicação no fim, "x" com espaços, soma dividida pelo número errado e peso multiplicando a soma.
const f = S.parseSyllabus(doc(['Disciplina', 'F - Disciplina F', 'Critérios de Avaliação da Aprendizagem',
  'MF = 0,8 x MP + 0,2 x MT,', 'MP = média de prova, calculada como MP = (P1+P2+P3)/2',
  "MT = média de trabalhos, calculada como MT = (T1+..+Tn)/n, em que 'n' é o número de", 'Ementa']), F);
assert.ok(F.parsePlan(f.formula).ok, f.formula);
assert.ok(/^MP = \(P1 \+ P2 \+ P3\)\/2$/m.test(f.formula) && f.warnings.some((w) => /divide por 2/.test(w)), f.formula);
assert.ok(/^MT = media\(T1, T2, T3\)$/m.test(f.formula), f.formula);
const g = S.parseSyllabus(doc(['Disciplina', 'G - Disciplina G', 'Critérios de Avaliação da Aprendizagem',
  'MF = 0,85*(P1+P2)/2 + 0,15*T1', 'Ementa']), F);
assert.ok(/^MP = media\(P1, P2\)$/m.test(g.formula) && /^MF = 0,85\*MP \+ 0,15\*T1$/m.test(g.formula), g.formula);

console.log('PASS leitura de planos de ensino (nome, aprovação, fórmula, trecho)');
