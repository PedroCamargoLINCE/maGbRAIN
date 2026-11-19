/* Fórmulas de média do plano de ensino: leitura, cálculo e "quanto preciso tirar".
   Sem dependências; roda no navegador (window.Formula) e no Node (require). */
(function (root) {
  'use strict';

  const FUNCTIONS = {
    media: { min: 1, run: (xs) => xs.reduce((a, b) => a + b, 0) / xs.length },
    soma: { min: 1, run: (xs) => xs.reduce((a, b) => a + b, 0) },
    min: { min: 1, run: (xs) => Math.min(...xs) },
    max: { min: 1, run: (xs) => Math.max(...xs) },
    // melhores(n; a, b, c...) = média das n maiores notas (quando o plano descarta a menor).
    melhores: {
      min: 2,
      run: (xs) => {
        const n = Math.round(xs[0]);
        const rest = xs.slice(1).sort((a, b) => b - a);
        if (n < 1 || n > rest.length) throw new Error('melhores(n; ...) precisa de 1 ≤ n ≤ quantidade de notas');
        return rest.slice(0, n).reduce((a, b) => a + b, 0) / n;
      },
    },
  };

  const key = (name) => name.toUpperCase();
  const fnKey = (name) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function tokenize(src) {
    const tokens = [];
    const re = /\s*(?:(\d+(?:[.,]\d+)?|[.,]\d+)|([A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*)|(\S))/gy;
    let m;
    while (re.lastIndex < src.length && (m = re.exec(src))) {
      if (m[1] !== undefined) tokens.push({ t: 'num', v: parseFloat(m[1].replace(',', '.')) });
      else if (m[2] !== undefined) tokens.push({ t: 'id', v: m[2] });
      else if (m[3] !== undefined) {
        const c = { '×': '*', '·': '*', '÷': '/', '−': '-' }[m[3]] || m[3];
        if (!'+-*/()%,;'.includes(c)) throw new Error(`símbolo "${m[3]}" não reconhecido`);
        tokens.push({ t: c === ',' || c === ';' ? 'sep' : c, v: c });
      }
    }
    return tokens;
  }

  function parseExpression(src) {
    const tokens = tokenize(src);
    let i = 0;
    const peek = () => tokens[i];
    const take = (t) => {
      const tok = tokens[i];
      if (!tok || tok.t !== t) throw new Error(tok ? `esperava "${t}" e encontrei "${tok.v}"` : `faltou "${t}" no fim`);
      i++;
      return tok;
    };
    function expr() {
      let node = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) node = { k: 'bin', op: tokens[i++].t, a: node, b: term() };
      return node;
    }
    function term() {
      let node = unary();
      while (peek() && (peek().t === '*' || peek().t === '/')) node = { k: 'bin', op: tokens[i++].t, a: node, b: unary() };
      return node;
    }
    function unary() {
      if (peek() && peek().t === '-') { i++; return { k: 'neg', a: unary() }; }
      if (peek() && peek().t === '+') { i++; return unary(); }
      return postfix();
    }
    function postfix() {
      let node = primary();
      while (peek() && peek().t === '%') { i++; node = { k: 'bin', op: '/', a: node, b: { k: 'num', v: 100 } }; }
      return node;
    }
    function primary() {
      const tok = peek();
      if (!tok) throw new Error('expressão incompleta');
      if (tok.t === 'num') { i++; return { k: 'num', v: tok.v }; }
      if (tok.t === '(') { i++; const node = expr(); take(')'); return node; }
      if (tok.t === 'id') {
        i++;
        if (peek() && peek().t === '(') {
          const fn = fnKey(tok.v);
          if (!FUNCTIONS[fn]) throw new Error(`função "${tok.v}" não existe (use media, soma, min, max ou melhores)`);
          i++;
          const args = [];
          if (peek() && peek().t !== ')') {
            args.push(expr());
            while (peek() && peek().t === 'sep') { i++; args.push(expr()); }
          }
          take(')');
          if (args.length < FUNCTIONS[fn].min) throw new Error(`${fn}() precisa de pelo menos ${FUNCTIONS[fn].min} valor(es)`);
          return { k: 'call', fn, args };
        }
        return { k: 'var', name: key(tok.v), display: tok.v };
      }
      throw new Error(`"${tok.v}" fora do lugar`);
    }
    if (!tokens.length) throw new Error('expressão vazia');
    const node = expr();
    if (i < tokens.length) throw new Error(`"${tokens[i].v}" fora do lugar`);
    return node;
  }

  function collectVars(node, out) {
    if (node.k === 'var') out.push(node);
    else if (node.k === 'bin') { collectVars(node.a, out); collectVars(node.b, out); }
    else if (node.k === 'neg') collectVars(node.a, out);
    else if (node.k === 'call') node.args.forEach((a) => collectVars(a, out));
    return out;
  }

  /* Um plano é uma linha por definição: "MP = media(P1, P2, P3)".
     A última linha é a média final; ela pode ser só a expressão.
     Nomes que não são definidos viram avaliações (P1, T1...). Maiúsculas e minúsculas não importam. */
  function parsePlan(text) {
    const defs = [];
    const errors = [];
    const lines = String(text || '').split(/\r?\n/);
    lines.forEach((raw, idx) => {
      const line = raw.replace(/(#|\/\/).*$/, '').trim();
      if (!line) return;
      const m = line.match(/^([A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_ ]*?)\s*(?:=|:)\s*(.+)$/);
      const name = m ? m[1].trim().replace(/\s+/g, '_') : null;
      const body = m ? m[2] : line;
      try {
        const expr = parseExpression(body);
        defs.push({ name: name ? key(name) : null, display: name, expr, line: idx + 1 });
      } catch (err) {
        errors.push({ line: idx + 1, msg: err.message });
      }
    });
    defs.forEach((d, n) => {
      if (!d.name) {
        if (n === defs.length - 1) { d.name = 'MÉDIA FINAL'; d.display = 'Média final'; }
        else errors.push({ line: d.line, msg: 'só a última linha pode ficar sem nome; escreva "NOME = ..."' });
      }
    });
    const byName = {};
    defs.forEach((d) => {
      if (!d.name) return;
      if (byName[d.name]) errors.push({ line: d.line, msg: `${d.display} já foi definida na linha ${byName[d.name].line}` });
      else byName[d.name] = d;
    });
    const inputs = [];
    const seen = new Set();
    defs.forEach((d) => collectVars(d.expr, []).forEach((v) => {
      if (!byName[v.name] && !seen.has(v.name)) { seen.add(v.name); inputs.push({ name: v.name, display: v.display }); }
    }));
    // Detecta definições circulares (MP depende de MF que depende de MP).
    const state = {};
    const visit = (name, path) => {
      if (state[name] === 2 || !byName[name]) return;
      if (state[name] === 1) { errors.push({ line: byName[name].line, msg: `definição circular: ${path.concat(name).join(' → ')}` }); return; }
      state[name] = 1;
      collectVars(byName[name].expr, []).forEach((v) => visit(v.name, path.concat(name)));
      state[name] = 2;
    };
    Object.keys(byName).forEach((n) => visit(n, []));
    if (!defs.length && !errors.length) errors.push({ line: 1, msg: 'escreva a fórmula da média final' });
    const final = defs.length ? defs[defs.length - 1] : null;
    return { defs, byName, inputs, errors, final, ok: errors.length === 0 && !!final };
  }

  /* values: { P1: 7.5, ... } com as chaves em maiúsculas. Toda avaliação precisa de número.
     opts.round: cada média definida no plano (MP, MT, MF...) vale com uma casa, como na Unesp. */
  function evaluate(plan, values, opts) {
    const cache = {};
    const r = opts && opts.round ? round1 : (v) => v;
    const calc = (node) => {
      switch (node.k) {
        case 'num': return node.v;
        case 'neg': return -calc(node.a);
        case 'bin': {
          const a = calc(node.a), b = calc(node.b);
          if (node.op === '+') return a + b;
          if (node.op === '-') return a - b;
          if (node.op === '*') return a * b;
          if (b === 0) throw new Error('divisão por zero');
          return a / b;
        }
        case 'call': return FUNCTIONS[node.fn].run(node.args.map(calc));
        case 'var': {
          if (plan.byName[node.name]) {
            if (!(node.name in cache)) cache[node.name] = r(calc(plan.byName[node.name].expr));
            return cache[node.name];
          }
          const v = values[node.name];
          if (typeof v !== 'number' || !isFinite(v)) throw new Error(`sem nota para ${node.display}`);
          return v;
        }
      }
      throw new Error('expressão inválida');
    };
    const vars = {};
    plan.defs.forEach((d) => { vars[d.name] = calc({ k: 'var', name: d.name, display: d.display }); });
    return { final: vars[plan.final.name], vars };
  }

  /* Menor nota x, igual em todas as "unknowns", para a média final chegar a "target".
     Supõe que a média não diminui quando uma nota sobe (vale para pesos positivos). */
  function solve(plan, base, unknowns, target, maxGrade, opts) {
    const f = (x) => {
      const values = Object.assign({}, base);
      unknowns.forEach((u) => { values[u] = x; });
      return evaluate(plan, values, opts).final;
    };
    const eps = 1e-9;
    const atZero = f(0);
    if (atZero >= target - eps) return { status: 'garantido', atZero };
    const atMax = f(maxGrade);
    if (atMax < target - eps) return { status: 'impossivel', atMax };
    let lo = 0, hi = maxGrade;
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2;
      if (f(mid) >= target - eps) hi = mid; else lo = mid;
    }
    return { status: 'ok', x: hi, ceil: Math.ceil(hi * 100 - 1e-6) / 100 };
  }

  /* Regra da Unesp para as médias: uma casa decimal, e da segunda casa 5 para cima sobe (4,96 → 5,0; 9,14 → 9,1; 9,15 → 9,2). */
  function round1(v) { return Math.floor(v * 10 + 0.5 + 1e-9) / 10; }

  function parseGrade(raw) {
    if (raw === null || raw === undefined) return null;
    const s = String(raw).trim().replace(',', '.');
    if (!s) return null;
    const v = Number(s);
    return isFinite(v) ? v : NaN;
  }

  const api = { parsePlan, evaluate, solve, round1, parseGrade, parseExpression, FUNCTIONS: Object.keys(FUNCTIONS) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Formula = api;
})(typeof window !== 'undefined' ? window : this);
