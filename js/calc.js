// Калькулятори матеріалів. Норми орієнтовні, остаточно рахує продавець.
(() => {
  const root = document.getElementById('calc');
  if (!root) return;
  const $ = s => root.querySelector(s);
  const num = el => { const v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) && v > 0 ? v : 0; };
  const f = (n, d = 0) => n.toLocaleString('uk-UA', {maximumFractionDigits: d, minimumFractionDigits: d});
  const PHONE = root.dataset.phone;
  // Бетон: на 1 м³ (цемент М500, кг; пісок і щебінь, м³; вода, л)
  const MIX = {
    m150: {c: 230, s: 0.52, g: 0.82, w: 180, n: 'М150 (підбетонка, доріжки)'},
    m200: {c: 285, s: 0.5, g: 0.8, w: 180, n: 'М200 (стяжка, фундамент під паркан)'},
    m300: {c: 380, s: 0.44, g: 0.78, w: 190, n: 'М300 (фундамент будинку, перекриття)'},
  };
  const TILE = {brick: {n: 'Цеглинка 200×100 мм', per: 50}, sq30: {n: 'Квадрат 300×300 мм', per: 11.11}, sq40: {n: 'Квадрат 400×400 мм', per: 6.25}};
  let tab = 'concrete', lastText = '';

  function concrete() {
    const v = num($('#c-l')) * num($('#c-w')) * num($('#c-h')) / 100, m = MIX[$('#c-m').value];
    if (!v) return null;
    const cem = m.c * v, bags = Math.ceil(cem / 25);
    return {title: `Бетон ${m.n.split(' ')[0]}: ${f(v, 2)} м³`, rows: [
      ['Цемент М500', `${bags} ${bags % 10 === 1 && bags % 100 !== 11 ? 'мішок' : bags % 10 >= 2 && bags % 10 <= 4 && (bags % 100 < 10 || bags % 100 >= 20) ? 'мішки' : 'мішків'} по 25 кг`, `${f(cem)} кг`],
      ['Пісок', `${f(m.s * v, 2)} м³`, `≈ ${f(m.s * v * 1.5, 1)} т`],
      ['Щебінь 5–20', `${f(m.g * v, 2)} м³`, `≈ ${f(m.g * v * 1.4, 1)} т`],
      ['Вода', `${f(m.w * v)} л`, ''],
    ]};
  }
  function tiles() {
    const a = num($('#t-a')), t = TILE[$('#t-t').value], k = 1 + (+$('#t-z').value) / 100;
    if (!a) return null;
    const pcs = Math.ceil(a * t.per * k);
    return {title: `Плитка: ${f(a, 1)} м²`, rows: [
      [t.n, `${f(pcs)} шт`, `з запасом ${$('#t-z').value}%`],
      ['Пісок на подушку 5 см', `${f(a * 0.05, 2)} м³`, `≈ ${f(a * 0.05 * 1.5, 1)} т`],
      ['Суха суміш цемент + пісок 1:5, 3 см', `${Math.ceil(a * 0.03 * 1.3 / 6 * 1400 / 25)} мішк. цементу`, 'для фіксації плитки'],
    ]};
  }
  function laminate() {
    const l = num($('#l-l')), w = num($('#l-w')), p = num($('#l-p')) || 2.13, k = $('#l-d').checked ? 1.1 : 1.07;
    if (!l || !w) return null;
    const a = l * w, packs = Math.ceil(a * k / p), perim = 2 * (l + w) - 0.9;
    return {title: `Ламінат: кімната ${f(l, 1)} × ${f(w, 1)} м = ${f(a, 1)} м²`, rows: [
      ['Ламінат', `${packs} упак.`, `${f(packs * p, 2)} м² з запасом ${$('#l-d').checked ? 10 : 7}%`],
      ['Підкладка', `${f(Math.ceil(a))} м²`, ''],
      ['Плінтус 2,5 м', `${Math.ceil(perim / 2.5)} шт`, `периметр без дверей ${f(perim, 1)} м`],
    ]};
  }
  function render() {
    const r = {concrete, tiles, laminate}[tab]();
    const out = $('#c-out');
    if (!r) { out.innerHTML = '<p class="c-empty">Вкажіть розміри, і тут зʼявиться розрахунок.</p>'; lastText = ''; return; }
    out.innerHTML = `<b class="c-t">${r.title}</b><ul>${r.rows.map(x => `<li><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></li>`).join('')}</ul>
      <p class="c-note">Розрахунок орієнтовний. Продавець уточнить під ваші умови й підкаже, що є на складі.</p>
      <div class="btns"><a class="btn" href="tel:${PHONE}">Подзвонити й замовити</a><button class="btn ghost" type="button" id="c-copy">Скопіювати список</button></div>`;
    lastText = `UNI, розрахунок: ${r.title}\n` + r.rows.map(x => `• ${x[0]}: ${x[1]}${x[2] ? ` (${x[2]})` : ''}`).join('\n');
  }
  root.addEventListener('input', render);
  root.addEventListener('click', async e => {
    const t = e.target.closest('[data-tab]');
    if (t) {
      tab = t.dataset.tab;
      root.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', b === t));
      root.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== tab; });
      render();
    }
    if (e.target.id === 'c-copy' && lastText) {
      try {
        if (navigator.share) await navigator.share({text: lastText});
        else { await navigator.clipboard.writeText(lastText); e.target.textContent = 'Скопійовано ✓'; }
      } catch (x) {}
    }
  });
  render();
})();

// Обʼємні картки відділів: нахил за курсором
document.querySelectorAll('.tag:not(.big)').forEach(el => {
  if (matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(700px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateY(-3px)`;
    el.style.setProperty('--gx', `${(x + .5) * 100}%`); el.style.setProperty('--gy', `${(y + .5) * 100}%`);
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});
