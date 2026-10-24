'use strict';
/* ============ CONFIGURACIÓN: edita aquí todo ============ */
const CONFIG = {
  locale: 'es',
  to: 'Yesenia',
  from: 'Jaime',
  coverDate: '2026-10-29',      // fecha de portada (AAAA-MM-DD)
  startDate: '2024-01-01',      // CAMBIAR: inicio de la relación (AAAA-MM-DD)
  taps: 12,                      // toques para llenar el corazón
  debug: false,                 // true: muestra en consola/placeholder los archivos que faltan
  intro: { eyebrow: 'Tienes un regalo', message: 'Espero que te guste, mi amor. Lo hice con todo mi corazón, solo para ti.', hint: 'Toca el corazón para descubrir tu regalo.' },
  tapHint: 'Cada toque abre un pedacito del recuerdo.',
  cover: { photo: 'assets/img/g5.jpeg' },
  song: { eyebrow: 'Nuestro Tema', title: 'Para ti', cover: 'assets/img/airbag.png', audio: 'assets/audio/AIRBAG - NUNCA LO OLVIDES.mp3' },
  gallery: {
    eyebrow: 'Galería', title: 'Momentos que no se borran', items: [   // src puede ser imagen o video (.mp4/.webm)
      { src: 'assets/img/g1.png', alt: 'Recuerdo 1' }, { src: 'assets/img/g2.png', alt: 'Recuerdo 2' },
      { src: 'assets/img/g11.jpeg', alt: 'Recuerdo 3' }, { src: 'assets/img/g4.png', alt: 'Recuerdo 4' },
      { src: 'assets/img/g5.png', alt: 'Recuerdo 5' }]
  },
  letter: {
    eyebrow: 'Carta', paragraphs: [   // EDITA: un elemento por párrafo (puedes agregar los que quieras)
      'Hola, mi amor.',
      'Si estás leyendo esto es porque quise regalarte algo diferente. Algo que no se guarda en una caja, sino en el corazón.',
      'Hoy, en el día de tu cumpleaños, quiero celebrar no solo un año más de tu vida, sino de poder compartir la mía a tu lado. gracias por esos tiempos valiosos, cada día tiene un brillo 	diferente, tu sonrisa y de esa calidez única que transforma cualquier momento simple en algo inolvidable.',
	'Feliz cumpleaños amor, mi amor este año de vida te devuelva multiplicada toda la felicidad y con la bendicion de Dios se cumplan tus  sueños y metas que te propusiste.',
      'Feliz cumpleaños amor mio.!!!'],
    closing: 'Con todo mi amor,'
  },
  timeline: {
    eyebrow: 'Recuerdos', title: 'Nuestra línea del tiempo', label: 'días juntos', futureLabel: 'días para empezar', since: 'desde el', events: [   // EDITA fechas, textos y fotos
      { date: '2024-02-23', title: 'Primer recuerdo', text: 'El primer dia que nos conocimos.', photo: 'assets/img/R1.png' },
      { date: '2025-01-20', title: 'Segundo recuerdo', text: 'Nuevas aventuras que pasamos.', photo: 'assets/img/g5.jpeg' },
      { date: '2025-12-23', title: 'Tercer recuerdo', text: 'Cada detalle es un acto de amor.', photo: 'assets/img/R3.png' }]
  },
  voice: { eyebrow: 'Mensaje de voz', from: 'De Jaime', audio: 'assets/audio/audioJaime.ogg' },
  final: { photo: 'assets/img/portada1.jpeg', text: 'Te amo, hoy y siempre' },
  surprise: { title: 'Una última sorpresa', text: 'Pensabas que el regalo había terminado… pero todavía tengo algo preparado para ti.', button: 'Descubrir la sorpresa' },
  quiz: {
    intro: 'Para descubrir mi última sorpresa tendrás que responder unas preguntas sobre nosotros.', label: 'Pregunta', of: 'de',
    right: '¡Sí! ♥', wrong: 'Mmm, esa no es… inténtalo otra vez',
    questions: [   // EDITA / AMPLÍA: answer = posición (empezando en 0) de la opción correcta
      { q: '¿que cancion sientes que define nuestra historia de amor?', options: ['Airbag ', 'Aullagas', 'linda lizbeth'], answer: 1 },
      { q: '¿Quién dijo «te quiero» primero?', options: ['Tú', 'Yo'], answer: 0 },
      { q: '¿Cuál fue el momento en el que supimos que esto iba en serio?', options: ['Nuestro primer viaje juntos', 'Cuando nos quedamos en ollantaytambo', 'El día que nos dimos nuestro primer beso'], answer: 1 }]
  },
  win: { title: '¡Lo lograste!', text: 'Esta era la última sorpresa que tenía preparada para ti.', button: 'Ver mi recompensa' },
  voucher: { eyebrow: 'Vale especial', text: 'Vale por un chocolate de La Ibérica, ¡el que tú elijas, mi amor!', sign: 'Jaime', back: 'Volver al regalo' }
};

/* ============ LÓGICA ============ */
(() => {
  const C = CONFIG;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const H = '<svg class="ic" aria-hidden="true"><use href="#h"/></svg>';
  const parse = d => { const [y, m, x] = d.split('-').map(Number); return new Date(y, m - 1, x); };
  const fmt = d => new Intl.DateTimeFormat(C.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(parse(d));
  const isVid = s => /\.(mp4|webm|mov)$/i.test(s);
  const img = (s, a = '') => `<span class="ph"><img src="${esc(s)}" alt="${esc(a)}" loading="lazy" decoding="async"></span>`;
  const media = (s, a) => isVid(s) ? `<span class="ph"><video src="${esc(s)}" controls playsinline preload="metadata" aria-label="${esc(a)}"></video></span>` : img(s, a);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const io = (cb, opt) => 'IntersectionObserver' in window ? new IntersectionObserver(cb, opt) : null;
  const audios = [];
  const stopOthers = m => [...audios, ...$$('video')].forEach(x => x !== m && x.pause());

  // Recursos que faltan: placeholder suave, sin romper el diseño
  document.addEventListener('error', e => {
    const t = e.target; if (!t || !t.tagName) return;
    if (t.tagName === 'IMG' || t.tagName === 'VIDEO') { t.closest('.ph')?.classList.add('miss'); if (C.debug) console.warn('Falta:', t.getAttribute('src')); }
  }, true);
  document.addEventListener('play', e => { if (e.target.tagName === 'VIDEO') stopOthers(e.target); }, true);

  /* ---- Etapas 1 y 2: tarjeta y corazón ---- */
  $('#in-eye').textContent = C.intro.eyebrow; $('#in-to').textContent = C.to;
  $('#in-from').innerHTML = `De ${esc(C.from)} ${H}`; $('#in-msg').textContent = '«' + C.intro.message + '»';
  $('#in-hint').textContent = C.intro.hint; $('#tap-hint').textContent = C.tapHint;
  document.title = `Para ${C.to}, de ${C.from}`;
  new Image().src = C.cover.photo;

  const intro = $('#intro'), tap = $('#tap'), heart = $('#heart');
  $('#go').addEventListener('click', async () => {
    intro.classList.add('out'); await wait(600); intro.hidden = true; tap.hidden = false; tap.classList.add('out');
    requestAnimationFrame(() => requestAnimationFrame(() => tap.classList.remove('out'))); heart.focus({ preventScroll: true });
  }, { once: true });

  let taps = 0, opened = false;
  tap.addEventListener('click', e => {
    if (opened) return; taps++;
    $('#fill').style.clipPath = `inset(${Math.max(0, 100 - taps / C.taps * 100)}% 0 0 0)`;
    heart.classList.remove('pulse'); void heart.offsetWidth; heart.classList.add('pulse');
    const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
    for (let i = 0; i < 2; i++) { const m = document.createElement('span'); m.className = 'mini'; m.innerHTML = H; m.style.left = x + (Math.random() * 60 - 30) + 'px'; m.style.top = y + 'px'; document.body.appendChild(m); setTimeout(() => m.remove(), 1250); }
    if (taps >= C.taps) { opened = true; openGift(); }
  });
  async function openGift() {
    await wait(900); tap.classList.add('out'); await wait(600); tap.hidden = true;
    const app = $('#app'); app.hidden = false; document.body.classList.remove('locked'); scrollTo(0, 0);
    requestAnimationFrame(() => app.classList.add('show'));
  }

  /* ---- Contenido principal ---- */
  const wave = Array.from({ length: 42 }, (_, i) => `<i style="height:${22 + Math.abs(Math.sin(i * 1.3) * Math.cos(i * .4)) * 70}%"></i>`).join('');
  const g = C.gallery, t = C.timeline, v = C.voice, q = C.quiz;
  $('#app').innerHTML = `
  <header class="cover" id="cover"><div class="ct"><p class="eye">Para</p><h2>${esc(C.to)}</h2><p class="names"></p><p class="eye">${esc(fmt(C.coverDate))}</p></div></header>
  <section class="sec reveal"><p class="eye">${esc(C.song.eyebrow)}</p>
    <div class="pl" id="p1"><div class="disc">${img(C.song.cover)}<button class="play" aria-label="Reproducir"></button></div>
    <h3>${esc(C.song.title)}</h3><div class="thin seek"><i></i></div><p class="tm">0:00</p></div></section>
  <section class="sec gal reveal"><p class="eye">${esc(g.eyebrow)}</p><h3>${esc(g.title)}</h3>
    <div class="cw"><div class="track" id="track" tabindex="0" aria-label="${esc(g.title)}">${g.items.map((m, i) => `<div class="slide" aria-label="${i + 1} / ${g.items.length}">${media(m.src, m.alt)}</div>`).join('')}</div>
    <div class="ctl"><button id="gp" aria-label="Anterior">‹</button><span id="gc">1 / ${g.items.length}</span><button id="gn" aria-label="Siguiente">›</button></div></div></section>
  <section class="sec letter reveal"><p class="eye">${esc(C.letter.eyebrow)}</p><div style="height:20px"></div>
    ${C.letter.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}<p>${esc(C.letter.closing)}</p><p class="sg">${esc(C.from)} ${H}</p></section>
  <section class="sec reveal" id="tl"><p class="eye">${esc(t.eyebrow)}</p><h3>${esc(t.title)}</h3>
    <div class="days"><b id="days">0</b><small id="dl"></small><span>${esc(t.since)} ${esc(fmt(C.startDate))}</span></div>
    <ul class="tl">${t.events.map(e => `<li class="ev reveal${e.photo ? '' : ' np'}"><div class="ev-c"><div class="ev-m">${e.photo ? img(e.photo, e.title) : '<span class="ph empty"></span>'}</div><div class="ev-b"><time>${esc(fmt(e.date))}</time><h4>${esc(e.title)}</h4><p>${esc(e.text)}</p></div></div></li>`).join('')}</ul></section>
  <section class="sec reveal"><div class="pl vp" id="p2"><div class="vh">${H}<small>${esc(v.eyebrow)}</small><b>${esc(v.from)}</b></div>
    <div class="row"><button class="play" aria-label="Reproducir"></button><div class="wave seek"><div class="b">${wave}</div><div class="b on">${wave}</div></div></div><p class="tm">0:00</p></div></section>
  <section class="final" id="final"><div class="fh" id="fh"></div><div class="ct"><h2>${esc(C.to)} y ${esc(C.from)}</h2><p>${esc(C.final.text)} ${H}</p></div></section>
  <section class="sec reveal"><div class="card sur">${H}<h3>${esc(C.surprise.title)}</h3><p>${esc(C.surprise.text)}</p><button class="btn" id="oq">${esc(C.surprise.button)} ${H}</button></div></section>`;
  $('#cover').style.backgroundImage = `url("${C.cover.photo}"),linear-gradient(160deg,#c9506b,#6d1427)`;
  $('#final').style.backgroundImage = `url("${C.final.photo}"),linear-gradient(160deg,#c9506b,#6d1427)`;

  // Revelado al hacer scroll
  const rv = io(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => rv ? rv.observe(el) : el.classList.add('in'));

  // Corazones flotantes (12, pausados fuera de pantalla)
  const hearts = (box, n) => { box.innerHTML = Array.from({ length: n }, () => `<svg class="ic" style="--l:${Math.random() * 92}%;--s:${12 + Math.random() * 12}px;--d:${10 + Math.random() * 6}s;--w:-${Math.random() * 8}s"><use href="#h"/></svg>`).join(''); };
  hearts($('#fh'), 8);
  const fio = io(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting))); fio && fio.observe($('#fh'));

  /* ---- Audios ---- */
  const fmtT = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
  function player(sel, src, autoplay = false) {
    const el = $(sel), a = new Audio(), btn = $('.play', el), tm = $('.tm', el), bar = $('.seek', el);
    a.preload = 'none'; a.src = src; audios.push(a);
    let started = false;
    const removeGestureListeners = () => {
      document.removeEventListener('pointerdown', startOnGesture);
      document.removeEventListener('keydown', startOnGesture);
    };
    const start = () => {
      stopOthers(a);
      a.play().then(() => {
        started = true;
        removeGestureListeners();
      }).catch(error => {
        if (error.name !== 'NotAllowedError') el.classList.add('miss');
      });
    };
    function startOnGesture(e) {
      if (started || e.target.closest?.(`#${el.id} .play`)) return;
      start();
    }
    if (autoplay) {
      document.addEventListener('pointerdown', startOnGesture);
      document.addEventListener('keydown', startOnGesture);
      start();
    }
    btn.onclick = () => a.paused ? start() : a.pause();
    a.onplay = () => { el.classList.add('on'); btn.setAttribute('aria-label', 'Pausar'); };
    a.onpause = () => { el.classList.remove('on'); btn.setAttribute('aria-label', 'Continuar'); };
    a.ontimeupdate = () => { el.style.setProperty('--p', (a.currentTime / (a.duration || 1) * 100) + '%'); tm.textContent = fmtT(a.currentTime) + ' / ' + fmtT(a.duration); };
    a.onended = () => { a.currentTime = 0; el.classList.remove('on'); btn.setAttribute('aria-label', 'Reproducir'); el.style.setProperty('--p', '0%'); };
    a.onerror = () => el.classList.add('miss');
    bar.onclick = e => { if (a.duration) { const r = bar.getBoundingClientRect(); a.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * a.duration; } };
  }
  player('#p1', C.song.audio, true); player('#p2', v.audio);

  /* ---- Carrusel: scroll-snap táctil + arrastre con ratón + flechas ---- */
  const tr = $('#track'), sl = $$('.slide', tr), N = sl.length, gc = $('#gc');
  const step = () => N > 1 ? sl[1].offsetLeft - sl[0].offsetLeft : tr.clientWidth;
  const cur = () => Math.min(N - 1, Math.max(0, Math.round(tr.scrollLeft / step())));
  const go = i => tr.scrollTo({ left: Math.min(N - 1, Math.max(0, i)) * step(), behavior: 'smooth' });
  let raf; tr.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => gc.textContent = `${cur() + 1} / ${N}`); }, { passive: true });
  $('#gp').onclick = () => go(cur() - 1); $('#gn').onclick = () => go(cur() + 1);
  tr.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur() + 1); if (e.key === 'ArrowLeft') go(cur() - 1); });
  let dx = null, sx = 0, moved = false;
  tr.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && !e.target.closest('video')) { dx = e.clientX; sx = tr.scrollLeft; moved = false; } });
  addEventListener('pointermove', e => { if (dx === null) return; if (Math.abs(e.clientX - dx) > 4) { moved = true; tr.classList.add('drag'); } tr.scrollLeft = sx - (e.clientX - dx); });
  addEventListener('pointerup', () => { if (dx === null) return; dx = null; tr.classList.remove('drag'); if (moved) go(cur()); });

  /* ---- Contador de días ---- */
  const days = () => { const n = new Date(), s = parse(C.startDate); return Math.round((Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())) / 864e5); };
  const setDays = n => { $('#days').textContent = Math.abs(n).toLocaleString(C.locale); $('#dl').textContent = n < 0 ? t.futureLabel : t.label; };
  let counted = false;
  const count = () => { const n = days(), t0 = performance.now(); counted = true; const f = now => { const p = Math.min(1, (now - t0) / 1400); setDays(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  setDays(days());
  const dio = io(es => es.forEach(e => { if (e.isIntersecting && !counted) { count(); dio.disconnect(); } }), { threshold: .4 }); dio ? dio.observe($('#tl')) : counted = true;
  setInterval(() => { if (counted) setDays(days()); }, 60000);

  /* ---- Cuestionario ---- */
  const ov = $('#quiz'), qv = $('#qv'); let qi = 0, done = false, opener = null;
  const show = html => { qv.innerHTML = `<div class="scr">${html}</div>`; ov.scrollTop = 0; };
  function question() {
    const Q = q.questions[qi];
    show(`<p class="hint">${esc(q.intro)}</p><div class="dots">${q.questions.map((_, i) => `<i class="${i <= qi ? 'on' : ''}"></i>`).join('')}</div>
    <div class="qc"><p class="eye">${esc(q.label)} ${qi + 1} ${esc(q.of)} ${q.questions.length}</p><h3>${esc(Q.q)}</h3>
    ${Q.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div><p class="fb" aria-live="polite"></p>`);
    const fb = $('.fb', qv), opts = $$('.opt', qv); let lock = false;
    opts.forEach(b => b.onclick = async () => {
      if (lock) return; const i = +b.dataset.i;
      if (i !== Q.answer) { b.classList.add('bad'); b.disabled = true; fb.textContent = q.wrong; return; }
      lock = true; b.classList.add('ok'); opts.forEach(o => o.disabled = true); fb.textContent = q.right;
      await wait(1100); qi++; if (qi >= q.questions.length) done = true;
      if (ov.hidden) return; done ? win() : question();
    });
  }
  function win() {
    show(`<div class="wh" id="wh"></div><div class="win" style="display:grid;gap:14px;justify-items:center;position:relative"><h2>${esc(C.win.title)} ${H}</h2><p>${esc(C.win.text)}</p><button class="btn" id="vb">${esc(C.win.button)}</button></div>`);
    hearts($('#wh'), 14); $('#vb').onclick = voucher;
  }
  function voucher() {
    const k = C.voucher;
    show(`<div class="vale"><p class="eye">✂ ${esc(k.eyebrow)}</p><p class="t">${H} ${esc(k.text)}</p><p class="sg">— ${esc(k.sign)}</p></div><button class="btn soft" id="bk">${esc(k.back)}</button>`);
    $('#bk').onclick = close;
  }
  function open() { opener = document.activeElement; stopOthers(); ov.hidden = false; $('#app').inert = true; document.body.classList.add('noscroll'); done ? win() : (qi = Math.min(qi, q.questions.length - 1), question()); $('#qx').focus(); }
  function close() { ov.hidden = true; $('#app').inert = false; document.body.classList.remove('noscroll'); opener && opener.focus && opener.focus({ preventScroll: true }); }
  $('#oq').onclick = open; $('#qx').onclick = close;
  addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.hidden) close(); });
})();
