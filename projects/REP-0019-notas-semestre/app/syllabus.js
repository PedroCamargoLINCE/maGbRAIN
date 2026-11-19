/* Leitura de planos de ensino em PDF: texto do PDF (pdf.js), nome da disciplina,
   trecho "Critérios de Avaliação" e proposta de fórmula na sintaxe do piloto.
   A proposta sempre passa pela conferência do aluno antes de virar matéria. */
(function (root) {
  'use strict';

  /* ---------- texto do PDF, linha a linha (navegador, com pdf.js) ---------- */
  async function pdfLines(pdfjsLib, data) {
    const doc = await pdfjsLib.getDocument({ data }).promise;
    const out = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const tc = await page.getTextContent();
      const rows = [];
      tc.items.forEach((it) => {
        if (!it.str || !it.str.trim()) return;
        const y = it.transform[5], x = it.transform[4];
        let row = rows.find((r) => Math.abs(r.y - y) < 2.5);
        if (!row) { row = { y, items: [] }; rows.push(row); }
        row.items.push({ x, s: it.str });
      });
      rows.sort((a, b) => b.y - a.y);
      rows.forEach((r) => out.push(r.items.sort((a, b) => a.x - b.x).map((i) => i.s).join(' ').replace(/\s+/g, ' ').trim()));
    }
    return out.filter(Boolean);
  }

  /* ---------- impressão de uma expressão em texto limpo ---------- */
  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2 };
  function num(v) { return String(Math.round(v * 1e6) / 1e6).replace('.', ','); }
  function print(node) {
    switch (node.k) {
      case 'num': return num(node.v);
      case 'var': return node.display;
      case 'neg': return '-' + wrap(node.a, 3);
      case 'call': {
        const args = node.args.map(print);
        const sep = args.some((a) => /\d,\d/.test(a)) ? '; ' : ', ';
        return node.fn + '(' + args.join(sep) + ')';
      }
      case 'bin': {
        const p = PREC[node.op];
        const left = wrap(node.a, p);
        const right = wrap(node.b, p + (node.op === '-' || node.op === '/' ? 1 : 0));
        return node.op === '*' ? `${left}*${right}` : node.op === '/' ? `${left}/${right}` : `${left} ${node.op} ${right}`;
      }
    }
    return '';
  }
  function prec(node) { return node.k === 'bin' ? PREC[node.op] : 9; }
  function wrap(node, min) { const s = print(node); return prec(node) < min ? `(${s})` : s; }
  function varsOf(node, out) {
    if (node.k === 'var') out.push(node.name);
    else if (node.k === 'bin') { varsOf(node.a, out); varsOf(node.b, out); }
    else if (node.k === 'neg') varsOf(node.a, out);
    else if (node.k === 'call') node.args.forEach((x) => varsOf(x, out));
    return out;
  }

  function balance(s) {
    let open = 0;
    for (const c of s) { if (c === '(') open++; else if (c === ')') open--; }
    while (open < 0 && /\)\s*$/.test(s)) { s = s.replace(/\)\s*$/, ''); open++; }
    while (open > 0) { s += ')'; open--; }
    return s;
  }

  /* Texto do plano → expressão que o piloto entende. */
  const deaccent = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '');
  function normalize(rhs, ctx) {
    let s = rhs.trim();
    s = s.split(/,\s+(?=[A-Za-zÀ-ÿ'"‘“])|\s+(?:onde|em que|sendo|com)\b/)[0];           // corta a explicação depois da conta
    s = s.replace(/[;,.:]+$/, '');
    s = s.replace(/[{[]/g, '(').replace(/[}\]]/g, ')');
    s = s.replace(/(\d)\s*[xX×]\s*(?=[A-Za-z(])/g, '$1*');                            // 0,9xMP
    s = s.replace(/(\d)\s+(?=[A-Za-z(])/g, '$1*');                                     // 0,8 MP
    s = s.replace(/\(\s*([A-Za-z]+)1\s*\+[^()]*?\1\s*n\s*\)\s*\/\s*n/gi, (m, p) => `media(${p.toUpperCase()}1..n)`);  // (R1+...+Rn)/n
    s = s.replace(/m[ée]dia\s+d[aoe]s?\s+([A-Za-zÀ-ÿ]+)/gi, (m, word) => {          // "média dos trabalhos"
      const L = deaccent(word)[0].toUpperCase();
      ctx.letters['M' + L] = ctx.letters['M' + L] || L;
      return 'M' + L;
    });
    s = s.replace(/\b([a-z])(\d+)\b/g, (m, a, b) => a.toUpperCase() + b);             // p1 → P1
    return balance(s);
  }
  // "media(T1..n)" ainda não é sintaxe válida: troca pela lista com a quantidade conhecida (ou 3).
  function expandN(s, ctx) {
    return s.replace(/media\(([A-Z])1\.\.n\)/g, (m, L) => {
      const n = ctx.counts[L] || 3;
      if (!ctx.counts[L]) ctx.warnings.push(`O plano usa ${L}1 + … + ${L}n sem dizer quantos são: deixei ${n}. Use o + nas notas para acrescentar.`);
      return `media(${Array.from({ length: n }, (_, i) => L + (i + 1)).join(', ')})`;
    });
  }

  const NOISE = /^(ATENÇÃO:|https?:\/\/|www\.|Instituto de Ciência e Tecnologia - |Documento emitido|Código de autenticidade|Documento válido)/;
  const WORDNUM = { um: 1, uma: 1, dois: 2, duas: 2, 'três': 3, tres: 3, quatro: 4, cinco: 5, seis: 6 };

  /* (X1 + X2 + X3)/3 → media(X1, X2, X3); soma dividida por outro número fica como está, com aviso. */
  function sumVars(node, out) {
    if (node.k === 'var') { out.push(node); return out; }
    if (node.k === 'bin' && node.op === '+') { const a = sumVars(node.a, out); return a && sumVars(node.b, out); }
    return null;
  }
  function toMedia(node, ctx) {
    if (node.k === 'bin') {
      node.a = toMedia(node.a, ctx); node.b = toMedia(node.b, ctx);
      // 0,85*(P1+P2)/2 → 0,85*media(P1, P2)
      if (node.op === '/' && node.b.k === 'num' && node.a.k === 'bin' && node.a.op === '*') {
        for (const side of ['b', 'a']) {
          const vars = sumVars(node.a[side], []);
          if (vars && vars.length > 1 && vars.length === node.b.v) {
            const other = side === 'a' ? node.a.b : node.a.a;
            return { k: 'bin', op: '*', a: other, b: { k: 'call', fn: 'media', args: vars } };
          }
        }
      }
      if (node.op === '/' && node.b.k === 'num') {
        const vars = sumVars(node.a, []);
        if (vars && vars.length > 1) {
          if (vars.length === node.b.v) return { k: 'call', fn: 'media', args: vars };
          ctx.warnings.push(`O plano soma ${vars.length} notas (${vars.map((v) => v.display).join(', ')}) e divide por ${String(node.b.v).replace('.', ',')}. Mantive como está escrito; confira.`);
        }
      }
    } else if (node.k === 'neg') node.a = toMedia(node.a, ctx);
    else if (node.k === 'call') node.args = node.args.map((x) => toMedia(x, ctx));
    return node;
  }
  /* Uma média de notas no meio da conta vira uma média com nome (MT = media(T1, T2, T3)), para agrupar e poder acrescentar notas. */
  function liftMeans(node, defs, byName, isRoot) {
    if (node.k === 'bin') { node.a = liftMeans(node.a, defs, byName); node.b = liftMeans(node.b, defs, byName); return node; }
    if (node.k === 'neg') { node.a = liftMeans(node.a, defs, byName); return node; }
    if (node.k !== 'call' || isRoot || node.fn !== 'media') return node;
    const letters = new Set(node.args.map((a) => (a.k === 'var' && /^[A-Z]\d+$/.test(a.name) ? a.name[0] : '?')));
    if (letters.size !== 1 || letters.has('?')) return node;
    const name = 'M' + [...letters][0];
    if (byName[name]) return node;
    const def = { name, expr: node };
    byName[name] = def; defs.unshift(def);
    return { k: 'var', name, display: name };
  }

  function parseSyllabus(lines, F, fileName) {
    const counts = {};
    lines.forEach((l) => { counts[l] = (counts[l] || 0) + 1; });
    const clean = lines.filter((l) => counts[l] < 2 && !NOISE.test(l) && !/^[_=\-%]{5,}$/.test(l));

    // Nome da disciplina: linha depois de "Disciplina", sem o código.
    let name = '';
    const di = lines.findIndex((l) => /^Disciplina$/i.test(l.trim()));
    if (di >= 0 && lines[di + 1]) name = lines[di + 1].replace(/^[^-]{1,24}?\s-\s/, '').trim();
    if (!name && fileName) name = fileName.replace(/\.pdf$/i, '');

    // Trecho dos critérios de avaliação, até a ementa.
    const start = clean.findIndex((l) => /crit[ée]rios de avalia[çc][ãa]o/i.test(l));
    let end = clean.findIndex((l, i) => i > start && /^(Ementa|Aprovação$)/.test(l));
    if (end < 0) end = clean.length;
    const section = start >= 0 ? clean.slice(start, end) : [];
    // Só a parte regular: para antes de recuperação e exame (registrados para depois).
    let regEnd = section.findIndex((l, i) => i > 0 && (
      /^(PER[ÍI]ODO DE )?(RECUPERA[ÇC][ÃA]O|EXAME)/.test(l) || /^Recupera[çc][ãa]o\b/.test(l) ||
      /^Exame final\b/i.test(l) || /^Conforme alterado pela Resolu/.test(l) || /^Metodologia do exame/i.test(l)));
    if (regEnd < 0) regEnd = section.length;
    const regular = section.slice(0, regEnd);

    const ctx = { warnings: [], letters: {}, counts: {} };
    let pass = null;
    for (const l of regular) {
      const m = l.match(/(?:≥|>=|igual ou superior a|maior ou igual a)\s*(\d+(?:[,.]\d+)?)/i);
      if (m) { pass = m[1].replace('.', ','); break; }
    }
    // Pistas em texto: "MT = Média dos relatórios", "média de provas MP", "2 provas", "02 provas (P1 e P2)".
    const text = regular.join(' ');
    let m;
    regular.forEach((line) => {
      const w1 = line.match(/\b(M[A-Z])\s*[=–:-]\s*m[ée]dia\s+(?:aritm[ée]tica\s+)?d[aeo]s?\s+([A-Za-zÀ-ÿ]+)/i);
      if (w1) ctx.letters[w1[1].toUpperCase()] = deaccent(w1[2])[0].toUpperCase();
      const w2 = line.match(/m[ée]dia\s+d[aeo]s?\s+([A-Za-zÀ-ÿ]+)\s+(M[A-Z])\b/i);
      if (w2) ctx.letters[w2[2].toUpperCase()] = deaccent(w2[1])[0].toUpperCase();
    });
    const reCount = /\b(\d{1,2}|uma?|dois|duas|tr[êe]s|quatro|cinco|seis)\s+(provas|trabalhos|relat[óo]rios|listas|projetos|semin[áa]rios)\b/gi;
    while ((m = reCount.exec(text))) {
      const n = /\d/.test(m[1]) ? parseInt(m[1], 10) : WORDNUM[m[1].toLowerCase()];
      const L = deaccent(m[2])[0].toUpperCase();
      if (n > 0 && n < 20 && !ctx.counts[L]) ctx.counts[L] = n;
    }

    // Equações "NOME = expressão".
    const defs = [];
    const byName = {};
    for (let i = 0; i < regular.length; i++) {
      const line = regular[i].replace(/^[•\-–*\s]+/, '');
      const mm = line.match(/^([A-Za-z][A-Za-z0-9_]{0,11})\s*=\s*(.+)$/);
      if (!mm) continue;
      const lhs = mm[1].toUpperCase();
      let rhs = mm[2].split('=').pop();
      let expr = null;
      for (let extra = 0; extra <= 2 && !expr; extra++) {
        const t = extra ? rhs + ' ' + regular.slice(i + 1, i + 1 + extra).join(' ') : rhs;
        try {
          const probe = { warnings: [], letters: {}, counts: ctx.counts };
          const ex = F.parseExpression(expandN(normalize(t, probe), { warnings: [], counts: ctx.counts }));
          if (ex.k !== 'var' || ex.name !== lhs) { expr = ex; rhs = t; }
        } catch (e) { /* tenta com a linha seguinte */ }
        if (!/[+\-*/(,]\s*$/.test(rhs) && extra === 0 && !expr) break;
      }
      if (!expr || byName[lhs]) continue;
      const def = { name: lhs, expr: F.parseExpression(expandN(normalize(rhs, ctx), ctx)) };
      byName[lhs] = def;
      defs.push(def);
    }

    if (!defs.length) {
      return { name, pass: pass || '5', formula: '', found: false, warnings: ['Não encontrei a fórmula no texto. Copie do trecho abaixo para a caixa da fórmula.'], excerpt: section.join('\n') };
    }

    // Médias com nome: (P1+P2)/2 → media(P1, P2); média no meio da conta → MP, MT...
    defs.forEach((d) => { d.expr = toMedia(d.expr, ctx); });
    defs.slice().forEach((d) => { d.expr = liftMeans(d.expr, defs, byName, true); });

    // MP, MT... usados sem definição viram a média das notas, nunca um campo para preencher.
    const undefinedMeans = new Set();
    defs.forEach((d) => varsOf(d.expr, []).forEach((v) => { if (/^M[A-Z]$/.test(v) && !byName[v]) undefinedMeans.add(v); }));
    undefinedMeans.forEach((v) => {
      const L = ctx.letters[v] || v[1];
      const n = ctx.counts[L] || (L === 'P' ? 2 : 3);
      const args = Array.from({ length: n }, (_, i) => L + (i + 1));
      const def = { name: v, expr: F.parseExpression(`media(${args.join(', ')})`) };
      byName[v] = def; defs.unshift(def);
      if (!ctx.counts[L]) ctx.warnings.push(`${v} = média de ${args.join(', ')}: o plano não diz quantos são. Use o + nas notas para acrescentar.`);
    });

    // Média final = definição que nenhuma outra usa (de preferência MF).
    const used = new Set();
    defs.forEach((d) => varsOf(d.expr, []).forEach((v) => { if (byName[v] && v !== d.name) used.add(v); }));
    const roots = defs.filter((d) => !used.has(d.name));
    const final = roots.find((d) => /^(MF|MS|MFS|NF|MEDIA)$/.test(d.name)) || roots[roots.length - 1] || defs[defs.length - 1];

    const order = [];
    const done = new Set();
    const visit = (d, path) => {
      if (done.has(d.name) || path.has(d.name)) return;
      path.add(d.name);
      varsOf(d.expr, []).forEach((v) => { if (byName[v] && v !== d.name) visit(byName[v], path); });
      done.add(d.name);
      order.push(d);
    };
    visit(final, new Set());

    const out = ['# Lido do plano. Confira com o trecho original.']
      .concat(ctx.warnings.map((w) => '# ' + w))
      .concat(order.map((d) => `${d.name} = ${print(d.expr)}`))
      .join('\n');
    return { name, pass: pass || '5', formula: out, found: true, warnings: ctx.warnings, excerpt: section.join('\n') };
  }

  const api = { pdfLines, parseSyllabus, print };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Syllabus = api;
})(typeof window !== 'undefined' ? window : this);
