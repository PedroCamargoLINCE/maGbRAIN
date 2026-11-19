"""Placar do README: um SVG gerado no build a partir de ideas/, projects/ e contributions/."""
from html import escape

STATES = {'inbox': ('Capturada', '#f39e89'), 'exploring': ('Em exploração', '#b49be9'),
          'ready': ('Pronta para avançar', '#d6b936'), 'building': ('Em execução', '#72b9e5'),
          'trying': ('Em teste', '#e5a55f'), 'done': ('Entrega concluída', '#78bfa1'),
          'parked': ('Em pausa', '#a8aeba')}
NAVY, CREAM, PAPER, YELLOW, MUTED = '#172850', '#fff8e9', '#fffdf6', '#ffe276', '#4e5870'
W = 840


def stats(ideas, people, contributions, projects):
    """Números do placar. Crédito por pessoa conta fichas, como no mapa."""
    per_person = {p['id']: 0 for p in people}
    for c in contributions:
        for ident in c['participants']:
            per_person[ident] += 1
    names = {p['id']: p['name'] for p in people}
    ranking = sorted(((names[i], n) for i, n in per_person.items() if n), key=lambda x: (-x[1], x[0]))
    states = [(s, sum(i['status'] == s for i in ideas)) for s in STATES]
    return dict(ideas=len(ideas), projects=projects, contributions=len(contributions),
                people=len(ranking), ranking=ranking, states=[(s, n) for s, n in states if n],
                pending=sum(c['attribution'] == 'pending' for c in contributions))


def render(s):
    rows = s['ranking'][:8]
    legend = s['states']
    body_h = max(len(rows) * 34, 46 + 24 * ((len(legend) + 1) // 2))
    height = 232 + body_h
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{height}" viewBox="0 0 {W} {height}" role="img" '
         f'aria-label="Placar do maGbRAIN: {s["ideas"]} ideias, {s["projects"]} projetos, '
         f'{s["contributions"]} contribuições, {s["people"]} pessoas">',
         '<style>text{font-family:ui-rounded,"Trebuchet MS",Verdana,sans-serif;fill:%s}'
         '.n{font-size:40px;font-weight:800}.l{font-size:14px;fill:%s}.h{font-size:15px;font-weight:700}'
         '.s{font-size:13px}</style>' % (NAVY, MUTED),
         f'<rect x="2" y="2" width="{W-4}" height="{height-4}" rx="18" fill="{CREAM}" stroke="{NAVY}" stroke-width="3"/>',
         f'<text x="30" y="42" style="font-size:20px;font-weight:800">Placar do maGbRAIN</text>',
         f'<text x="{W-30}" y="42" text-anchor="end" class="l">contado sozinho a cada merge na main</text>']
    tiles = [('ideias', s['ideas'], '#ffd0c3'), ('projetos', s['projects'], '#e1d2fa'),
             ('contribuições', s['contributions'], YELLOW), ('pessoas', s['people'], '#b9e6d0')]
    tw = (W - 60 - 3 * 16) / 4
    for k, (label, n, color) in enumerate(tiles):
        x = 30 + k * (tw + 16)
        o += [f'<rect x="{x:.0f}" y="62" width="{tw:.0f}" height="96" rx="14" fill="{color}" stroke="{NAVY}" stroke-width="2.5"/>',
              f'<text x="{x+tw/2:.0f}" y="112" text-anchor="middle" class="n">{n}</text>',
              f'<text x="{x+tw/2:.0f}" y="140" text-anchor="middle" class="l" style="fill:{NAVY}">{label}</text>']
    # Quem contribuiu
    y0 = 196
    o.append(f'<text x="30" y="{y0}" class="h">Quem contribuiu</text>')
    top = max((n for _, n in rows), default=1)
    for k, (name, n) in enumerate(rows):
        y = y0 + 16 + k * 34
        bar = max(8, 190 * n / top)
        o += [f'<text x="30" y="{y+16}" class="s">{escape(name[:22])}</text>',
              f'<rect x="190" y="{y}" width="{bar:.0f}" height="22" rx="7" fill="{YELLOW}" stroke="{NAVY}" stroke-width="2"/>',
              f'<text x="{190+bar+10:.0f}" y="{y+16}" class="s" style="font-weight:700">{n}</text>']
    if not rows:
        o.append(f'<text x="30" y="{y0+32}" class="l">Ainda sem fichas de crédito.</text>')
    # Ideias por estado
    x0, bw = 450, W - 30 - 450
    o.append(f'<text x="{x0}" y="{y0}" class="h">Ideias por estado</text>')
    total = sum(n for _, n in legend) or 1
    o.append(f'<clipPath id="c"><rect x="{x0}" y="{y0+16}" width="{bw}" height="22" rx="7"/></clipPath><g clip-path="url(#c)">')
    x = x0
    for state, n in legend:
        w = bw * n / total
        o.append(f'<rect x="{x:.1f}" y="{y0+16}" width="{w:.1f}" height="22" fill="{STATES[state][1]}"/>')
        x += w
    o.append('</g>')
    o.append(f'<rect x="{x0}" y="{y0+16}" width="{bw}" height="22" rx="7" fill="none" stroke="{NAVY}" stroke-width="2"/>')
    for k, (state, n) in enumerate(legend):
        lx, ly = x0 + (k % 2) * (bw / 2), y0 + 62 + (k // 2) * 24
        o += [f'<rect x="{lx:.0f}" y="{ly-11}" width="12" height="12" rx="3" fill="{STATES[state][1]}" stroke="{NAVY}" stroke-width="1.5"/>',
              f'<text x="{lx+19:.0f}" y="{ly}" class="s">{STATES[state][0]}: {n}</text>']
    if s['pending']:
        o.append(f'<text x="{W-30}" y="{height-16}" text-anchor="end" class="l">{s["pending"]} com autoria a confirmar</text>')
    o.append('</svg>')
    return '\n'.join(o)
