/* Acompanhador de notas do semestre (REP-0019). Estado só no navegador (localStorage). */
(function () {
  'use strict';
  const F = window.Formula;
  const STORE = 'magbrain-notas-semestre-v1';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (v) => (isFinite(v) ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '–');
  const fmtShort = (v) => (isFinite(v) ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '–');
  const listNames = (names) => (names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1]);
  const uid = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function exampleSubject() {
    return {
      id: uid(), example: true, name: 'Matéria de exemplo',
      formula: '# MP: média simples das provas · MT: média simples dos trabalhos\nMP = media(P1, P2, P3)\nMT = media(T1, T2, T3)\nMF = 0,7*MP + 0,3*MT',
      pass: '5', max: '10', grades: { P1: '4', P2: '5', T1: '8' }, sim: {}, meta: null,
    };
  }
  function blankSubject() {
    return {
      id: uid(), name: 'Nova matéria',
      formula: 'MP = media(P1, P2)\nMT = media(T1, T2)\nMF = 0,7*MP + 0,3*MT',
      pass: '5', max: '10', grades: {}, sim: {}, meta: null,
    };
  }

  let state = load();
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s && Array.isArray(s.subjects) && s.subjects.length) return s;
    } catch (e) { /* sem armazenamento: segue com o exemplo */ }
    const ex = exampleSubject();
    return { version: 1, current: ex.id, subjects: [ex] };
  }
  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 150);
  }
  function flush() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignora */ }
  }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  const subject = () => state.subjects.find((s) => s.id === state.current) || state.subjects[0];
  function touch(s) { if (s.example) delete s.example; save(); }

  /* ---------- cálculo ---------- */
  function analyse(s) {
    const plan = F.parsePlan(s.formula);
    const maxG = F.parseGrade(s.max);
    const pass = F.parseGrade(s.pass);
    const out = { plan, maxG: maxG > 0 ? maxG : 10, pass: isFinite(pass) && pass !== null ? pass : null, known: {}, pending: [], badGrades: [] };
    plan.inputs.forEach((inp) => {
      const v = F.parseGrade(s.grades[inp.name]);
      if (v === null) out.pending.push(inp);
      else if (!isFinite(v) || v < 0) { out.badGrades.push(inp.name); out.pending.push(inp); }
      else out.known[inp.name] = v;
    });
    if (!plan.ok) return out;
    const fill = (x) => { const vals = Object.assign({}, out.known); out.pending.forEach((p) => { vals[p.name] = x; }); return vals; };
    try {
      out.secured = F.evaluate(plan, fill(0));
      out.best = F.evaluate(plan, fill(out.maxG)).final;
      const allMax = {}; plan.inputs.forEach((p) => { allMax[p.name] = out.maxG; });
      out.ceiling = F.evaluate(plan, allMax).final;
      const knownVals = Object.values(out.known);
      if (knownVals.length && out.pending.length) {
        out.avg = knownVals.reduce((a, b) => a + b, 0) / knownVals.length;
        out.projection = F.evaluate(plan, fill(out.avg)).final;
      }
      out.impact = {};
      plan.inputs.forEach((p) => {
        const base = fill(0);
        const lo = F.evaluate(plan, Object.assign({}, base, { [p.name]: 0 })).final;
        const hi = F.evaluate(plan, Object.assign({}, base, { [p.name]: out.maxG })).final;
        out.impact[p.name] = (hi - lo) / out.maxG;
      });
    } catch (err) { out.evalError = err.message; }
    return out;
  }

  /* ---------- medidor em anel ---------- */
  function ringLen(r, frac) { const c = 2 * Math.PI * r; return `${Math.max(0, Math.min(1, frac)) * c} ${c}`; }
  function statusOf(a) {
    if (!a.plan.ok || a.evalError || !a.secured || a.pass === null) return { kind: '', text: a.plan.ok ? '' : 'Fórmula com erro' };
    const g = a.secured.final, pass = a.pass;
    if (g >= pass - 1e-9) return { kind: 'good', text: a.pending.length ? 'Já aprovado' : 'Aprovado' };
    if (a.best < pass - 1e-9) return { kind: 'bad', text: a.pending.length ? 'Não dá mais para passar' : 'Reprovado' };
    return { kind: 'warn', text: `Faltam ${fmt(pass - g)}` };
  }

  /* ---------- painel de matérias ---------- */
  function renderTabs() {
    const cur = subject();
    $('tabs').innerHTML = state.subjects.map((s) => {
      const a = analyse(s);
      const st = statusOf(a);
      const ok = a.secured && !a.evalError;
      const top = ok ? Math.max(a.ceiling, a.pass || 0, 1e-9) : 1;
      const n = a.plan.inputs.length, k = Object.keys(a.known).length;
      return `<button type="button" class="tab ${st.kind}" data-id="${s.id}" aria-pressed="${s.id === cur.id}">` +
        `<svg class="mini" viewBox="0 0 44 44" aria-hidden="true"><circle class="g-track" cx="22" cy="22" r="17"></circle>` +
        (ok ? `<circle class="g-possible" cx="22" cy="22" r="17" stroke-dasharray="${ringLen(17, a.best / top)}"></circle><circle class="g-secured" cx="22" cy="22" r="17" stroke-dasharray="${ringLen(17, a.secured.final / top)}"></circle>` : '') +
        `</svg><span class="tab-text"><span class="tab-name">${esc(s.name || 'Sem nome')}</span>` +
        `<span class="tab-meta">${ok ? `<b>${fmt(a.secured.final)}</b> garantido · ${k}/${n} notas` : 'confira a fórmula'}</span>` +
        `<span class="tab-status">${esc(st.text)}</span></span></button>`;
    }).join('') + '<button type="button" class="tab add" id="addSubject"><span class="plus" aria-hidden="true">+</span><span class="tab-text"><span class="tab-name">Nova matéria</span><span class="tab-meta">cole a fórmula do plano</span></span></button>';
  }
  $('tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'addSubject') {
      const s = blankSubject();
      state.subjects.push(s); state.current = s.id; save(); planOpen = true; renderAll();
      $('subjectName').focus(); $('subjectName').select();
      return;
    }
    state.current = b.dataset.id; save(); planOpen = !F.parsePlan(subject().formula).ok; renderAll();
  });

  /* ---------- plano ---------- */
  let planOpen = false;
  function renderPlanOpen() {
    $('planDrawer').hidden = !planOpen;
    $('togglePlan').setAttribute('aria-expanded', String(planOpen));
    $('togglePlan').textContent = planOpen ? 'Fechar fórmula' : 'Editar fórmula';
  }
  $('togglePlan').addEventListener('click', () => { planOpen = !planOpen; renderPlanOpen(); if (planOpen) $('formula').focus(); });
  function renderPlan() {
    const s = subject();
    $('subjectName').value = s.name;
    $('formula').value = s.formula;
    fitFormula();
    $('pass').value = s.pass;
    $('maxGrade').value = s.max;
    renderDanger(false);
    renderPlanOpen();
  }
  function renderDanger(confirming) {
    const s = subject();
    $('dangerZone').innerHTML = confirming
      ? `<span>Apagar “${esc(s.name)}” e todas as notas dela?</span><button type="button" class="danger-btn" id="delYes">Apagar de vez</button><button type="button" class="ghost" id="delNo">Cancelar</button>`
      : '<button type="button" class="link danger-link" id="delAsk">Apagar esta matéria</button>';
  }
  $('dangerZone').addEventListener('click', (e) => {
    const id = e.target.id;
    if (id === 'delAsk') { renderDanger(true); $('delNo').focus(); }
    if (id === 'delNo') renderDanger(false);
    if (id === 'delYes') {
      state.subjects = state.subjects.filter((s) => s.id !== state.current);
      if (!state.subjects.length) state.subjects.push(blankSubject());
      state.current = state.subjects[0].id; save(); planOpen = false; renderAll();
    }
  });
  function fitFormula() { const t = $('formula'); t.rows = Math.max(4, t.value.split('\n').length + 1); }
  $('subjectName').addEventListener('input', (e) => { const s = subject(); s.name = e.target.value; touch(s); $('subjectTitle').textContent = s.name || 'Sem nome'; renderTabs(); });
  $('formula').addEventListener('input', (e) => { const s = subject(); s.formula = e.target.value; fitFormula(); touch(s); renderStructure(); });
  $('pass').addEventListener('input', (e) => { const s = subject(); s.pass = e.target.value; touch(s); paint(); });
  $('maxGrade').addEventListener('input', (e) => { const s = subject(); s.max = e.target.value; touch(s); renderSim(); paint(); });

  /* ---------- notas, agrupadas pela média em que entram ---------- */
  function varsOf(node, out) {
    if (node.k === 'var') out.push(node.name);
    else if (node.k === 'bin') { varsOf(node.a, out); varsOf(node.b, out); }
    else if (node.k === 'neg') varsOf(node.a, out);
    else if (node.k === 'call') node.args.forEach((x) => varsOf(x, out));
    return out;
  }
  function groupsOf(plan) {
    const inputIdx = {};
    plan.inputs.forEach((inp, i) => { inputIdx[inp.name] = i; });
    const placed = new Set();
    const groups = [];
    plan.defs.forEach((d) => {
      if (!d.name) return;
      const items = [];
      varsOf(d.expr, []).forEach((n) => { if (n in inputIdx && !placed.has(n)) { placed.add(n); items.push(inputIdx[n]); } });
      if (items.length) groups.push({ def: d, isFinal: d === plan.final, items });
    });
    return groups;
  }
  let gradeSig = '';
  let groupDefs = [];
  function renderGrades() {
    const s = subject();
    const plan = F.parsePlan(s.formula);
    gradeSig = plan.inputs.map((i) => i.name).join('|') + '#' + plan.defs.map((d) => d.name).join('|');
    if (!plan.inputs.length) { groupDefs = []; $('gradesTable').innerHTML = '<p class="muted">A fórmula ainda não tem avaliações.</p>'; return; }
    const groups = groupsOf(plan);
    groupDefs = groups.map((g) => g.def.name);
    $('gradesTable').innerHTML = groups.map((g, gi) =>
      `<div class="group"><div class="group-head"><span class="group-name">${g.isFinal ? 'Direto na média final' : esc(g.def.display)}</span>` +
      (g.isFinal ? '' : `<span class="group-val" id="gv-${gi}"></span>`) + '</div><div class="tiles">' +
      g.items.map((i) => {
        const inp = plan.inputs[i];
        return `<label class="tile" id="row-${i}" for="g-${i}"><span class="tile-name">${esc(inp.display)}</span>` +
          `<input id="g-${i}" class="grade" data-name="${esc(inp.name)}" inputmode="decimal" autocomplete="off" placeholder="?" value="${esc(s.grades[inp.name] || '')}" aria-label="Nota de ${esc(inp.display)}">` +
          `<span class="tile-imp" id="imp-${i}"></span></label>`;
      }).join('') + '</div></div>').join('') +
      '<p class="muted small">Em cada nota: quanto 1 ponto nela soma na média final.</p>';
  }
  $('gradesTable').addEventListener('input', (e) => {
    if (!e.target.classList.contains('grade')) return;
    const s = subject();
    const v = e.target.value;
    if (v.trim()) s.grades[e.target.dataset.name] = v; else delete s.grades[e.target.dataset.name];
    touch(s);
    renderSim();
    paint();
  });

  /* ---------- simulador ---------- */
  let simSig = '';
  function renderSim(force) {
    const s = subject();
    const a = analyse(s);
    const sig = a.pending.map((p) => p.name + ':' + ((s.sim[p.name] || {}).mode || 'x')).join('|') + '#' + a.maxG + '#' + a.plan.ok;
    if (sig === simSig && !force) return;
    simSig = sig;
    const active = document.activeElement && document.activeElement.id;
    if (!a.plan.ok) { $('simRows').innerHTML = ''; return; }
    if (!a.pending.length) { $('simRows').innerHTML = '<p class="muted">Todas as notas saíram. A média final já está fechada.</p>'; return; }
    const step = a.maxG <= 10 ? 0.1 : a.maxG / 100;
    $('simRows').innerHTML = '<p class="muted small">Ainda não saíram. Em “descobrir”, a página calcula o mínimo. Em “supor nota”, você testa um valor.</p>' +
      a.pending.map((p, i) => {
        const sim = s.sim[p.name] || { mode: 'x', value: '' };
        const fixed = sim.mode === 'fix';
        const val = F.parseGrade(sim.value);
        const v = isFinite(val) && val !== null ? Math.min(Math.max(val, 0), a.maxG) : a.maxG / 2;
        return `<div class="sim-row${fixed ? ' fixed' : ''}"><span class="sim-name">${esc(p.display)}</span>` +
          `<div class="seg-ctl" role="group" aria-label="${esc(p.display)}">` +
          `<button type="button" id="sx-${i}" data-name="${esc(p.name)}" data-mode="x" aria-pressed="${!fixed}">descobrir</button>` +
          `<button type="button" id="sf-${i}" data-name="${esc(p.name)}" data-mode="fix" aria-pressed="${fixed}">supor nota</button></div>` +
          (fixed ? `<div class="sim-val"><input type="range" id="sr-${i}" data-name="${esc(p.name)}" min="0" max="${a.maxG}" step="${step}" value="${v}" aria-label="Nota suposta em ${esc(p.display)}">` +
            `<input id="st-${i}" class="num-input" data-name="${esc(p.name)}" inputmode="decimal" autocomplete="off" value="${esc(sim.value === '' ? fmtShort(v) : sim.value)}" aria-label="Nota suposta em ${esc(p.display)}"></div>` : '<span class="sim-q">?</span>') +
          '</div>';
      }).join('');
    if (active && $(active)) $(active).focus();
  }
  $('simRows').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mode]');
    if (!b) return;
    const s = subject();
    const cur = s.sim[b.dataset.name] || { mode: 'x', value: '' };
    if (b.dataset.mode === 'fix' && cur.value === '') { const a = analyse(s); cur.value = fmtShort(a.maxG * 0.7); }
    cur.mode = b.dataset.mode;
    s.sim[b.dataset.name] = cur;
    touch(s); renderSim(); paint();
  });
  $('simRows').addEventListener('input', (e) => {
    const name = e.target.dataset.name;
    if (!name) return;
    const s = subject();
    const cur = s.sim[name] || { mode: 'fix', value: '' };
    const row = e.target.closest('.sim-row');
    if (e.target.type === 'range') {
      cur.value = fmtShort(Number(e.target.value));
      row.querySelector('.num-input').value = cur.value;
    } else {
      cur.value = e.target.value;
      const v = F.parseGrade(cur.value);
      if (isFinite(v) && v !== null) row.querySelector('input[type=range]').value = v;
    }
    s.sim[name] = cur; touch(s); paint();
  });
  $('meta').addEventListener('input', (e) => { const s = subject(); s.meta = e.target.value.trim() ? e.target.value : null; touch(s); paint(); });
  $('metaReset').addEventListener('click', () => { const s = subject(); s.meta = null; $('meta').value = s.pass; touch(s); paint(); });

  /* ---------- pintura dos resultados ---------- */
  function setChip(el, kind, text) { el.className = 'chip ' + (kind || ''); el.textContent = text; el.hidden = !text; }

  function paint() {
    const s = subject();
    const a = analyse(s);
    $('exampleNote').hidden = !s.example;
    $('subjectTitle').textContent = s.name || 'Sem nome';

    // Plano: erros e avaliações encontradas
    const errs = a.plan.errors.map((er) => `<li>Linha ${er.line}: ${esc(er.msg)}</li>`);
    if (a.evalError) errs.push(`<li>${esc(a.evalError)}</li>`);
    if (F.parseGrade(s.pass) === null || !isFinite(F.parseGrade(s.pass))) errs.push('<li>Informe a média para aprovação.</li>');
    $('formulaErrors').innerHTML = errs.join('');
    $('found').innerHTML = a.plan.inputs.length
      ? 'Avaliações: ' + a.plan.inputs.map((i) => `<span class="pill${a.known[i.name] !== undefined ? ' done' : ''}">${esc(i.display)}</span>`).join(' ') + (a.plan.final && a.plan.final.name !== 'MÉDIA FINAL' ? ` · média final: <b>${esc(a.plan.final.display)}</b>` : '')
      : '';

    // Notas
    a.plan.inputs.forEach((inp, i) => {
      const cell = $('imp-' + i);
      const input = $('g-' + i);
      if (input) {
        const bad = a.badGrades.includes(inp.name);
        const over = a.known[inp.name] > a.maxG;
        input.classList.toggle('invalid', bad || over);
        input.title = bad ? 'Use um número, como 7,5' : over ? `Acima da nota máxima (${fmtShort(a.maxG)})` : '';
        $('row-' + i).classList.toggle('done', a.known[inp.name] !== undefined);
      }
      if (cell) cell.textContent = a.impact && isFinite(a.impact[inp.name]) ? '+' + fmt(a.impact[inp.name]) + '/pt' : '';
    });
    groupDefs.forEach((name, gi) => {
      const el = $('gv-' + gi);
      if (el) el.textContent = a.secured && name in a.secured.vars ? fmt(a.secured.vars[name]) + ' até agora' : '';
    });
    const nKnown = Object.keys(a.known).length;
    $('notasCount').textContent = a.plan.inputs.length ? `${nKnown} de ${a.plan.inputs.length} lançadas` : '';

    // Resumo
    const ok = a.plan.ok && !a.evalError && a.secured;
    $('resumoBody').hidden = !ok;
    $('resumoErro').hidden = !!ok;
    const st = statusOf(a);
    setChip($('statusChip'), st.kind, st.text);
    if (!ok) {
      $('resumoErro').textContent = 'A fórmula tem um problema. Abra “Editar fórmula” para ver o aviso.';
    } else {
      const g = a.secured.final, pass = a.pass;
      $('garantido').textContent = fmt(g);
      $('aprovacao').textContent = pass === null ? '–' : fmt(pass);
      $('maximo').textContent = fmt(a.best);
      $('projBox').hidden = a.projection === undefined;
      if (a.projection !== undefined) {
        $('projLabel').textContent = `Mantendo sua média (${fmtShort(a.avg)})`;
        $('projecao').textContent = fmt(a.projection);
      }
      const top = Math.max(a.ceiling, pass || 0, 1e-9);
      $('gSecured').setAttribute('stroke-dasharray', ringLen(80, g / top));
      $('gPossible').setAttribute('stroke-dasharray', ringLen(80, a.best / top));
      $('gMeta').style.display = pass === null ? 'none' : '';
      if (pass !== null) $('gMeta').setAttribute('transform', `rotate(${Math.min(1, pass / top) * 360} 100 100)`);
      $('gauge').classList.toggle('is-good', st.kind === 'good');
      $('gauge').classList.toggle('is-bad', st.kind === 'bad');
    }
    renderTabs();

    // Simulador
    if (document.activeElement !== $('meta')) $('meta').value = s.meta !== null ? s.meta : s.pass;
    paintAnswer(s, a, ok);
  }

  function paintAnswer(s, a, ok) {
    const ans = $('answer'), ladder = $('ladder');
    ladder.innerHTML = '';
    if (!ok) { ans.innerHTML = ''; return; }
    let target = F.parseGrade(s.meta !== null ? s.meta : s.pass);
    if (target === null || !isFinite(target)) { ans.innerHTML = '<p>Diga com quanto quer fechar.</p>'; return; }
    const base = Object.assign({}, a.known);
    const unknowns = [];
    a.pending.forEach((p) => {
      const sim = s.sim[p.name] || { mode: 'x' };
      if (sim.mode === 'fix') { const v = F.parseGrade(sim.value); base[p.name] = isFinite(v) && v !== null ? v : 0; }
      else unknowns.push(p);
    });
    const names = unknowns.map((u) => u.display);
    try {
      if (!unknowns.length) {
        const fin = F.evaluate(a.plan, base).final;
        const good = fin >= target - 1e-9;
        ans.className = 'answer ' + (good ? 'good' : 'bad');
        ans.innerHTML = `<p class="ans-line">Com essas notas, a média final fica <strong class="big">${fmt(fin)}</strong></p>` +
          `<p>${good ? 'Chega' : 'Não chega'} a ${fmt(target)}.${a.pending.length ? ' Marque “descobrir” em alguma avaliação para saber o mínimo.' : ''}</p>`;
        return;
      }
      const r = F.solve(a.plan, base, unknowns.map((u) => u.name), target, a.maxG);
      if (r.status === 'ok') {
        ans.className = 'answer ' + (r.ceil > a.maxG * 0.7 ? 'warn' : 'good');
        ans.innerHTML = `<p class="ans-line">Você precisa de pelo menos <strong class="big">${fmt(r.ceil)}</strong> ${unknowns.length > 1 ? 'em ' + esc(listNames(names)) : 'na ' + esc(names[0])}</p>` +
          `<p>${unknowns.length > 1 ? 'A mesma nota em cada uma. ' : ''}Arredondado para cima, para fechar com ${fmt(target)}.</p>`;
      } else if (r.status === 'garantido') {
        ans.className = 'answer good';
        ans.innerHTML = `<p class="ans-line">Você já chega a ${fmt(target)} mesmo tirando <strong class="big">0</strong> ${unknowns.length > 1 ? 'em ' + esc(listNames(names)) : 'na ' + esc(names[0])}</p>`;
      } else {
        ans.className = 'answer bad';
        ans.innerHTML = `<p class="ans-line">Nem com ${fmtShort(a.maxG)} ${unknowns.length > 1 ? 'em ' + esc(listNames(names)) : 'na ' + esc(names[0])} dá para chegar a ${fmt(target)}</p>` +
          `<p>A média final chegaria no máximo a <strong>${fmt(r.atMax)}</strong>.</p>`;
      }
      // Escada: média final para cada nota possível nas avaliações em aberto
      const steps = 10;
      const cells = [];
      let top = target;
      const vals = [];
      for (let k = 0; k <= steps; k++) {
        const x = (a.maxG * k) / steps;
        const v = Object.assign({}, base); unknowns.forEach((u) => { v[u.name] = x; });
        const fin = F.evaluate(a.plan, v).final;
        vals.push([x, fin]); top = Math.max(top, fin);
      }
      vals.forEach(([x, fin]) => {
        const h = Math.max(2, (Math.max(fin, 0) / (top || 1)) * 100);
        cells.push(`<div class="rung ${fin >= target - 1e-9 ? 'pass' : 'fail'}" title="Tirando ${fmtShort(x)}: média ${fmt(fin)}"><div class="rung-bar" style="height:${h}%"></div><span class="rung-val">${fmtShort(Math.round(fin * 10) / 10)}</span><span class="rung-x">${fmtShort(x)}</span></div>`);
      });
      ladder.innerHTML = `<p class="ladder-title">Média final para cada nota ${unknowns.length > 1 ? 'nas avaliações em aberto' : 'na ' + esc(names[0])}</p>` +
        `<div class="rungs" style="--meta:${Math.min(1, target / (top || 1))}"><div class="rung-meta"><span>${fmt(target)}</span></div>${cells.join('')}</div>`;
    } catch (err) {
      ans.className = 'answer bad';
      ans.innerHTML = `<p>${esc(err.message)}</p>`;
    }
  }

  /* ---------- estrutura ---------- */
  function renderStructure() {
    const s = subject();
    const plan = F.parsePlan(s.formula);
    const sig = plan.inputs.map((i) => i.name).join('|') + '#' + plan.defs.map((d) => d.name).join('|');
    if (sig !== gradeSig) renderGrades();
    renderSim();
    paint();
  }
  function renderAll() {
    simSig = '';
    renderTabs(); renderPlan(); renderGrades(); renderSim(true); paint();
  }

  /* ---------- backup ---------- */
  function footMsg(t) { $('footMsg').textContent = t; }
  $('copyBackup').addEventListener('click', () => {
    const text = JSON.stringify(state);
    const fallback = () => { $('restoreBox').hidden = false; $('restoreText').value = text; $('restoreText').select(); footMsg('Não deu para copiar sozinho. O backup está selecionado acima: copie com Ctrl+C.'); };
    try {
      navigator.clipboard.writeText(text).then(() => footMsg('Backup copiado. Guarde em uma nota ou mande para você mesmo.'), fallback);
    } catch (e) { fallback(); }
  });
  $('openRestore').addEventListener('click', () => { $('restoreBox').hidden = false; $('restoreText').value = ''; $('restoreText').focus(); footMsg(''); });
  $('cancelRestore').addEventListener('click', () => { $('restoreBox').hidden = true; footMsg(''); });
  $('doRestore').addEventListener('click', () => {
    try {
      const s = JSON.parse($('restoreText').value);
      if (!s || !Array.isArray(s.subjects) || !s.subjects.length) throw new Error();
      s.subjects.forEach((m) => { if (typeof m.formula !== 'string' || typeof m.grades !== 'object') throw new Error(); m.sim = m.sim || {}; if (!m.id) m.id = uid(); });
      if (!s.subjects.some((m) => m.id === s.current)) s.current = s.subjects[0].id;
      state = s; save(); renderAll();
      $('restoreBox').hidden = true;
      footMsg(`Backup restaurado: ${s.subjects.length} matéria(s).`);
    } catch (e) {
      footMsg('Esse texto não parece um backup deste acompanhador. Cole exatamente o que o botão “Copiar backup” copiou.');
    }
  });

  renderAll();
})();
