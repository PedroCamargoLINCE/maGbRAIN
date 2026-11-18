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
  function normalize(rhs, ctx) {
    let s = rhs.trim().replace(/[;,.:]+$/, '');
    s = s.replace(/[{[]/g, '(').replace(/[}\]]/g, ')');
    s = s.replace(/(\d)\s*[xX×]\s*(?=[A-Za-z(])/g, '$1*');            // 0,9xMP
    s = s.replace(/\(\s*([A-Za-z]+)1\s*\+[^()]*?\1\s*n\s*\)\s*\/\s*n/gi, (m, p) => {   // (R1+R2+...+Rn)/n
      const L = p.toUpperCase();
      ctx.warnings.push(`O plano usa ${L}1 + … + ${L}n: deixei 3 (${L}1, ${L}2, ${L}3). Ajuste para a quantidade real.`);
      return `media(${L}1, ${L}2, ${L}3)`;
    });
    s = s.replace(/m[ée]dia\s+d[aoe]s?\s+([A-Za-zÀ-ÿ]+)/gi, (m, word) => {     // "média dos trabalhos"
      const L = word.normalize('NFD').replace(/[̀-ͯ]/g, '')[0].toUpperCase();
      const name = 'M' + L;
      if (!ctx.auto[name]) {
        ctx.auto[name] = `media(${L}1, ${L}2)`;
        ctx.warnings.push(`“${m}” virou ${name} = média de ${L}1 e ${L}2. O plano não diz quantos são: ajuste.`);
      }
      return name;
    });
    s = s.replace(/\b([a-z])(\d+)\b/g, (m, a, b) => a.toUpperCase() + b);     // p1 → P1
    return balance(s);
  }

  const NOISE = /^(ATENÇÃO:|https?:\/\/|www\.|Instituto de Ciência e Tecnologia - |Documento emitido|Código de autenticidade|Documento válido)/;

  function parseSyllabus(lines, F, fileName) {
    const counts = {};
    lines.forEach((l) => { counts[l] = (counts[l] || 0) + 1; });
    const clean = lines.filter((l) => counts[l] < 2 && !NOISE.test(l) && !/^[_=\-]{5,}$/.test(l));

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
    let regEnd = section.findIndex((l, i) => i > 0 && (/^(RECUPERA[ÇC][ÃA]O|EXAME)/.test(l) || (/^(Recupera[çc][ãa]o|Exame final)\b/i.test(l) && l.length < 40)));
    if (regEnd < 0) regEnd = section.length;
    const regular = section.slice(0, regEnd);

    const ctx = { warnings: [], auto: {} };
    let pass = null;
    for (const l of regular) {
      const m = l.match(/(?:≥|>=|igual ou superior a|maior ou igual a)\s*(\d+(?:[,.]\d+)?)/i);
      if (m) { pass = m[1].replace('.', ','); break; }
    }

    // Equações "NOME = expressão".
    const defs = [];
    const seen = new Set();
    for (let i = 0; i < regular.length; i++) {
      const line = regular[i].replace(/^[•\-–*\s]+/, '');
      const m = line.match(/^([A-Za-z][A-Za-z0-9_]{0,11})\s*=\s*(.+)$/);
      if (!m) continue;
      const lhs = m[1].toUpperCase().replace(/^([A-Z])(\d+)$/, '$1$2');
      let rhs = m[2].split('=').pop();
      let expr = null;
      for (let extra = 0; extra <= 2 && !expr; extra++) {
        const text = extra ? rhs + ' ' + regular.slice(i + 1, i + 1 + extra).join(' ') : rhs;
        try {
          const ex = F.parseExpression(normalize(text, { warnings: [], auto: {} }));
          if (ex.k !== 'var' || ex.name !== lhs) { expr = ex; rhs = text; }
        } catch (e) { /* tenta com a linha seguinte */ }
        if (!/[+\-*/(,]\s*$/.test(rhs) && extra === 0 && !expr) break;
      }
      if (!expr || seen.has(lhs)) continue;
      expr = F.parseExpression(normalize(rhs, ctx));
      seen.add(lhs);
      defs.push({ name: lhs, expr });
    }
    Object.keys(ctx.auto).forEach((n) => {
      if (!seen.has(n)) { seen.add(n); defs.unshift({ name: n, expr: F.parseExpression(ctx.auto[n]) }); }
    });

    if (!defs.length) {
      return { name, pass: pass || '5', formula: '', found: false, warnings: ['Não encontrei a fórmula no texto. Copie do trecho abaixo para a caixa da fórmula.'], excerpt: section.join('\n') };
    }

    // Média final = definição que nenhuma outra usa (de preferência MF).
    const byName = {};
    defs.forEach((d) => { byName[d.name] = d; });
    const used = new Set();
    defs.forEach((d) => varsOf(d.expr, []).forEach((v) => { if (byName[v] && v !== d.name) used.add(v); }));
    const roots = defs.filter((d) => !used.has(d.name));
    const final = roots.find((d) => /^(MF|MS|MFS|NF|MEDIA)$/.test(d.name)) || roots[roots.length - 1] || defs[defs.length - 1];
    roots.filter((d) => d !== final).forEach((d) => ctx.warnings.push(`Ignorei ${d.name}, que não entra na média final.`));

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

    const text = ['# Lido do plano. Confira com o trecho original.']
      .concat(ctx.warnings.map((w) => '# ' + w))
      .concat(order.map((d) => `${d.name} = ${print(d.expr)}`))
      .join('\n');
    return { name, pass: pass || '5', formula: text, found: true, warnings: ctx.warnings, excerpt: section.join('\n') };
  }

  const api = { pdfLines, parseSyllabus, print };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Syllabus = api;
})(typeof window !== 'undefined' ? window : this);
