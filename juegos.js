// Inicio y juegos: Burbujas, ¿Cómo hace?, Sombras y Escondidas.
// Todo responde a "pointerdown" (al apoyar el dedo): los niños chicos no siempre levantan
// el dedo en el mismo lugar y el primer toque puede mover la pantalla al ponerse completa.
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const azar = n => Math.floor(Math.random() * n);
  const mezclar = lista => {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = azar(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const tomar = n => mezclar(ANIMALES).slice(0, n);
  const buscar = id => ANIMALES.find(a => a.id === id);
  const esa = a => (a.conArticulo.startsWith('la ') ? 'Esa es' : 'Ese es');

  function el(tag, clase, padre) {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (padre) padre.appendChild(e);
    return e;
  }

  // Animalito a color
  function figura(a) {
    const d = el('div', 'pintado');
    d.style.setProperty('--c1', a.c1);
    d.style.setProperty('--c2', a.c2);
    d.innerHTML = a.svg;
    return d;
  }
  // Sombra del animalito
  function sombra(a) {
    const d = el('div', 'sombra');
    d.innerHTML = a.svg;
    return d;
  }

  /* ---------- Sonido encendido o apagado (se recuerda en la tablet) ---------- */
  let silencio = false;
  try { silencio = localStorage.getItem('pintitas.silencio') === '1'; } catch (e) { /* nada */ }

  /* ---------- Sonidos (hechos con el parlante, sin archivos) ---------- */
  let audio = null;
  function contexto() {
    if (!audio) {
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function nota(f0, f1, inicio, dur, tipo, vol) {
    if (silencio) return;
    const a = contexto();
    if (!a) return;
    const t = a.currentTime + inicio;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }
  const sonar = {
    plop() { nota(650 + azar(350), 140, 0, 0.14, 'sine', 0.35); },
    boing() { nota(260, 540, 0, 0.11, 'triangle', 0.25); nota(540, 320, 0.11, 0.12, 'triangle', 0.2); },
    fiesta() { [523, 659, 784, 1047].forEach((f, i) => nota(f, f * 1.01, i * 0.1, 0.25, 'triangle', 0.25)); },
    sorpresa() { nota(400, 900, 0, 0.18, 'sine', 0.25); nota(900, 1200, 0.18, 0.12, 'sine', 0.18); },
    suave() { nota(420, 330, 0, 0.1, 'sine', 0.15); },
  };

  /* ---------- Voz en español de la tablet ---------- */
  const hayVoz = 'speechSynthesis' in window;
  let voz = null;
  function elegirVoz() {
    const es = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
    voz = es.find(v => /CL/i.test(v.lang)) || es.find(v => /419|US|MX/i.test(v.lang)) || es[0] || null;
  }
  if (hayVoz) {
    elegirVoz();
    speechSynthesis.addEventListener('voiceschanged', elegirVoz);
  }
  function decir(texto) {
    if (!hayVoz || silencio) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = voz ? voz.lang : 'es-ES';
    if (voz) u.voice = voz;
    u.rate = 0.9;
    u.pitch = 1.15;
    speechSynthesis.speak(u);
  }
  function callar() { if (hayVoz) speechSynthesis.cancel(); }

  /* ---------- Efectos ---------- */
  const COLORES_FIESTA = ['#ff5fa2', '#ffd84a', '#5cc8f5', '#8fd14f', '#c58cff', '#ff9a3c'];
  function chispas(x, y, cantidad = 14, lejos = 140) {
    for (let i = 0; i < cantidad; i++) {
      const s = el('div', 'chispa' + (i % 3 === 0 ? ' estrellita' : ''), document.body);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.background = COLORES_FIESTA[i % COLORES_FIESTA.length];
      const ang = Math.random() * Math.PI * 2;
      const d = lejos * (0.4 + Math.random() * 0.7);
      s.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * d}px), calc(-50% + ${Math.sin(ang) * d}px)) scale(0.3) rotate(${azar(360)}deg)`, opacity: 0 },
      ], { duration: 650 + azar(450), easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
  }
  function centro(e) {
    const r = e.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }
  function saltar(e) {
    e.animate([
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-12%) scale(1.08, 0.95)' },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: 420, easing: 'ease-out' });
  }
  function negar(e) {
    e.animate([
      { transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' },
      { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' },
    ], { duration: 450 });
  }
  function aparecer(e, demora = 0) {
    e.animate([
      { transform: 'scale(0.5)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 },
    ], { duration: 380, delay: demora, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' });
  }

  /* ---------- Pantallas ---------- */
  const pantallas = {
    inicio: $('#inicio'),
    pintar: $('#app'),
    burbujas: $('#j-burbujas'),
    animales: $('#j-animales'),
    sombras: $('#j-sombras'),
    escondidas: $('#j-escondidas'),
    memorice: $('#j-memorice'),
  };
  const juegos = {};
  let enPantalla = 'inicio';

  function ir(nombre) {
    if (nombre === enPantalla) return;
    if (enPantalla === 'pintar' && window.Pintar) window.Pintar.guardar();
    if (juegos[enPantalla]) juegos[enPantalla].salir();
    callar();
    Object.entries(pantallas).forEach(([k, p]) => { p.hidden = k !== nombre; });
    enPantalla = nombre;
    if (juegos[nombre]) juegos[nombre].entrar();
  }

  const CASA = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7 L43 24 H37 V41 H11 V24 H5 Z"/><rect x="20" y="29" width="8" height="12" rx="2" class="puerta"/></svg>';
  function botonCasa(padre) {
    const b = el('button', 'casita', padre);
    b.setAttribute('aria-label', 'Volver al inicio');
    b.innerHTML = CASA;
    return b;
  }
  // Todas las casitas (también la de pintar) vuelven al inicio
  document.addEventListener('pointerdown', e => {
    if (e.target.closest('.casita')) { e.preventDefault(); sonar.suave(); ir('inicio'); }
  });

  /* ---------- Inicio ---------- */
  const PALETA = '<svg viewBox="0 0 120 100" class="paleta"><g stroke="#3d2b3d" stroke-width="4" stroke-linejoin="round">' +
    '<path d="M60 8 C25 8 6 30 8 55 C10 80 35 92 55 90 C68 89 66 76 74 72 C84 67 100 78 108 62 C118 40 98 8 60 8Z" fill="#fff"/>' +
    '<circle cx="35" cy="36" r="9" fill="#ff3e8f"/><circle cx="60" cy="25" r="9" fill="#ffd83a"/><circle cx="85" cy="36" r="9" fill="#5cc8f5"/>' +
    '<circle cx="31" cy="62" r="9" fill="#8fd14f"/><circle cx="96" cy="58" r="7" fill="#9b51e0"/></g></svg>';
  const ARBUSTO = (c1, c2) => `<svg viewBox="0 0 200 130" preserveAspectRatio="none"><g stroke="#3d2b3d" stroke-width="5" stroke-linejoin="round">` +
    `<path d="M8 128 Q-2 84 34 76 Q36 34 78 40 Q98 6 132 34 Q172 22 174 70 Q206 80 192 128 Z" fill="${c1}"/>` +
    `<path d="M40 100 Q60 88 80 100 M120 92 Q140 80 160 92" fill="none" stroke="${c2}" stroke-width="5" stroke-linecap="round"/>` +
    `<g stroke-width="3"><circle cx="62" cy="62" r="8" fill="#ff9cc8"/><circle cx="62" cy="62" r="3" fill="#ffd84a" stroke="none"/>` +
    `<circle cx="140" cy="58" r="8" fill="#fff"/><circle cx="140" cy="58" r="3" fill="#ffd84a" stroke="none"/>` +
    `<circle cx="104" cy="96" r="8" fill="#c9a0ff"/><circle cx="104" cy="96" r="3" fill="#ffd84a" stroke="none"/></g></g></svg>`;

  const HUELLA = '<svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="37" rx="10" ry="8.5"/>' +
    '<ellipse cx="18" cy="26" rx="4.5" ry="5.5"/><ellipse cx="26" cy="20" rx="4.5" ry="5.5"/>' +
    '<ellipse cx="34" cy="20" rx="4.5" ry="5.5"/><ellipse cx="42" cy="26" rx="4.5" ry="5.5"/></svg>';

  const BOTONES = [
    ['pintar', 'Pintar', '#ff7eb6', () => { const d = el('div', 'arte'); d.innerHTML = PALETA; return d; }],
    ['burbujas', 'Burbujas', '#5cc8f5', () => {
      const d = el('div', 'arte');
      el('div', 'pompa p1', d).appendChild(figura(buscar('pollito')));
      el('div', 'pompa p2', d);
      el('div', 'pompa p3', d);
      return d;
    }],
    ['animales', '¿Cómo hace?', '#ffd84a', () => {
      const d = el('div', 'arte');
      d.appendChild(figura(buscar('vaca')));
      el('div', 'globo', d).textContent = '¡muu!';
      return d;
    }],
    ['sombras', 'Sombras', '#c58cff', () => {
      const d = el('div', 'arte dos');
      d.appendChild(sombra(buscar('gato')));
      d.appendChild(figura(buscar('gato')));
      return d;
    }],
    ['escondidas', 'Escondidas', '#8fd14f', () => {
      const d = el('div', 'arte esconde');
      d.appendChild(figura(buscar('conejo')));
      const a = el('div', 'mata', d);
      a.innerHTML = ARBUSTO('#6cc24a', '#4c9a36');
      return d;
    }],
    ['memorice', 'Memorice', '#ff9a5c', () => {
      const d = el('div', 'arte naipes');
      el('div', 'mini-dorso', d).innerHTML = HUELLA;
      el('div', 'mini-cara', d).appendChild(figura(buscar('perro')));
      return d;
    }],
  ];
  // Botón para sacar o poner el sonido
  const PARLANTE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path class="cuerpo" d="M7 18 H15 L26 9 V39 L15 30 H7 Z"/>' +
    '<path class="ondas" d="M32 17 Q37 24 32 31 M37 12 Q46 24 37 36"/><path class="cruz" d="M33 18 L43 30 M43 18 L33 30"/></svg>';
  const botonSonido = el('button', 'redondo-juego sonido', pantallas.inicio);
  botonSonido.innerHTML = PARLANTE;
  function mostrarSonido() {
    botonSonido.classList.toggle('apagado', silencio);
    botonSonido.setAttribute('aria-label', silencio ? 'Poner el sonido' : 'Sacar el sonido');
  }
  botonSonido.addEventListener('pointerdown', e => {
    e.preventDefault();
    silencio = !silencio;
    try { localStorage.setItem('pintitas.silencio', silencio ? '1' : '0'); } catch (err) { /* nada */ }
    if (silencio) callar(); else sonar.boing();
    saltar(botonSonido);
    mostrarSonido();
  });
  mostrarSonido();

  const cajaInicio = $('#botones-inicio');
  BOTONES.forEach(([id, nombre, color, arte], i) => {
    const b = el('button', 'entrada', cajaInicio);
    b.style.setProperty('--fondo-boton', color);
    b.appendChild(arte());
    el('span', '', b).textContent = nombre;
    b.addEventListener('pointerdown', e => { e.preventDefault(); sonar.boing(); ir(id); });
    aparecer(b, 100 + i * 80);
  });

  /* ---------- 1. Burbujas ---------- */
  juegos.burbujas = (() => {
    const sec = pantallas.burbujas;
    botonCasa(sec);
    const campo = el('div', 'campo', sec);
    let reloj = null;

    function crear() {
      if (campo.children.length >= 9) return;
      const a = ANIMALES[azar(ANIMALES.length)];
      const b = el('div', 'burbuja', campo);
      b.dataset.id = a.id;
      const tam = 17 + Math.random() * 9;
      b.style.width = b.style.height = tam + 'vmin';
      b.style.left = (4 + Math.random() * 78) + '%';
      const dentro = el('div', 'interior', b);
      dentro.appendChild(figura(a));
      const lado = (4 + Math.random() * 7) * (Math.random() < 0.5 ? -1 : 1);
      b.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${lado}vmin, -65vh)`, offset: 0.5 },
        { transform: `translate(0, -${100 + tam + 10}vh)` },
      ], { duration: 7500 + azar(4000), easing: 'linear' }).onfinish = () => b.remove();
    }

    campo.addEventListener('pointerdown', e => {
      const b = e.target.closest('.burbuja');
      if (!b || b.classList.contains('rota')) return;
      b.classList.add('rota');
      const [x, y] = centro(b);
      sonar.plop();
      chispas(x, y, 12, b.offsetWidth * 0.9);
      decir('¡' + buscar(b.dataset.id).nombre + '!');
      b.firstChild.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1.35)', opacity: 0 },
      ], { duration: 200, easing: 'ease-out' }).onfinish = () => b.remove();
    });

    return {
      entrar() {
        campo.innerHTML = '';
        crear();
        setTimeout(crear, 400);
        reloj = setInterval(crear, 900);
      },
      salir() { clearInterval(reloj); campo.innerHTML = ''; },
    };
  })();

  /* ---------- 2. ¿Cómo hace? ---------- */
  juegos.animales = (() => {
    const sec = pantallas.animales;
    botonCasa(sec);
    const barra = el('div', 'barra', sec);
    const pregunta = el('button', 'redondo-juego pregunta', barra);
    pregunta.setAttribute('aria-label', 'Preguntar');
    pregunta.textContent = '?';
    const otros = el('button', 'redondo-juego otros', barra);
    otros.setAttribute('aria-label', 'Otros animales');
    otros.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M38 20 A15 15 0 0 0 11 15 M10 28 A15 15 0 0 0 37 33 M38 9 V20 H27 M10 39 V28 H21"/></svg>';
    const grilla = el('div', 'grilla', sec);

    let grupo = [];
    let objetivo = null;
    let espera = null;

    function nuevos() {
      grupo = tomar(4);
      grilla.innerHTML = '';
      grupo.forEach((a, i) => {
        const c = el('button', 'carta', grilla);
        c.dataset.id = a.id;
        c.appendChild(figura(a));
        aparecer(c, i * 70);
      });
    }
    function preguntar() {
      objetivo = grupo[azar(grupo.length)];
      pregunta.classList.add('activa');
      decir(`¿Dónde está ${objetivo.conArticulo}?`);
    }

    grilla.addEventListener('pointerdown', e => {
      const c = e.target.closest('.carta');
      if (!c || c.classList.contains('bien')) return;
      e.preventDefault();
      const a = buscar(c.dataset.id);
      saltar(c.firstChild);
      if (!objetivo) { sonar.boing(); decir(a.sonido); return; }
      if (a.id === objetivo.id) {
        c.classList.add('bien');
        sonar.fiesta();
        const [x, y] = centro(c);
        chispas(x, y, 22, 220);
        decir(`¡Muy bien! ¡Es ${a.conArticulo}!`);
        objetivo = null;
        pregunta.classList.remove('activa');
        espera = setTimeout(() => { nuevos(); setTimeout(preguntar, 500); }, 2800);
      } else {
        sonar.boing();
        decir(`${esa(a)} ${a.conArticulo}. ¿Dónde está ${objetivo.conArticulo}?`);
      }
    });
    pregunta.addEventListener('pointerdown', e => {
      e.preventDefault();
      saltar(pregunta);
      if (objetivo) decir(`¿Dónde está ${objetivo.conArticulo}?`);
      else preguntar();
    });
    otros.addEventListener('pointerdown', e => {
      e.preventDefault();
      sonar.suave();
      clearTimeout(espera);
      objetivo = null;
      pregunta.classList.remove('activa');
      callar();
      nuevos();
    });

    return {
      entrar() { objetivo = null; pregunta.classList.remove('activa'); nuevos(); },
      salir() { clearTimeout(espera); objetivo = null; },
    };
  })();

  /* ---------- 3. Sombras ---------- */
  juegos.sombras = (() => {
    const sec = pantallas.sombras;
    botonCasa(sec);
    const zona = el('div', 'zona-sombra', sec);
    const opciones = el('div', 'opciones', sec);
    let meta = null;
    let listo = false;
    let arrastre = null;
    let espera = null;

    function ronda() {
      listo = false;
      const tres = tomar(3);
      meta = tres[azar(3)];
      zona.innerHTML = '';
      zona.appendChild(sombra(meta));
      aparecer(zona);
      opciones.innerHTML = '';
      tres.forEach((a, i) => {
        const c = el('div', 'opcion', opciones);
        c.dataset.id = a.id;
        c.appendChild(figura(a));
        aparecer(c, 150 + i * 90);
      });
    }

    function volver(c) {
      c.style.transition = 'transform .35s cubic-bezier(.3,1.4,.5,1)';
      c.style.transform = '';
    }
    function acierto(c) {
      listo = true;
      c.style.transition = 'transform .25s ease, opacity .25s ease';
      c.style.opacity = '0';
      zona.innerHTML = '';
      const f = figura(meta);
      zona.appendChild(f);
      saltar(f);
      const [x, y] = centro(zona);
      chispas(x, y, 26, 260);
      sonar.fiesta();
      decir(`¡Muy bien! ¡Es ${meta.conArticulo}!`);
      espera = setTimeout(ronda, 2800);
    }

    opciones.addEventListener('pointerdown', e => {
      if (listo || arrastre) return;
      const c = e.target.closest('.opcion');
      if (!c) return;
      e.preventDefault();
      try { c.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
      arrastre = { c, id: e.pointerId, x0: e.clientX, y0: e.clientY, movio: false };
      c.classList.add('agarrada');
      c.style.transition = 'none';
    });
    opciones.addEventListener('pointermove', e => {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      const dx = e.clientX - arrastre.x0, dy = e.clientY - arrastre.y0;
      if (Math.hypot(dx, dy) > 14) arrastre.movio = true;
      arrastre.c.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
    });
    function soltar(e) {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      const { c, movio } = arrastre;
      arrastre = null;
      c.classList.remove('agarrada');
      const a = buscar(c.dataset.id);
      const rz = zona.getBoundingClientRect();
      const [cx, cy] = centro(c);
      const encima = cx > rz.left && cx < rz.right && cy > rz.top && cy < rz.bottom;
      if (a.id === meta.id && (encima || !movio)) { acierto(c); return; }
      volver(c);
      if (encima || !movio) {
        sonar.boing();
        negar(c.firstChild);
        decir(`${esa(a)} ${a.conArticulo}`);
      }
    }
    opciones.addEventListener('pointerup', soltar);
    opciones.addEventListener('pointercancel', soltar);

    return {
      entrar() { ronda(); },
      salir() { clearTimeout(espera); arrastre = null; },
    };
  })();

  /* ---------- 4. Escondidas ---------- */
  juegos.escondidas = (() => {
    const sec = pantallas.escondidas;
    botonCasa(sec);
    const prado = el('div', 'prado', sec);
    const VERDES = [['#6cc24a', '#4c9a36'], ['#8fd14f', '#5fa83a'], ['#5bb85d', '#3f8f45']];
    const lugares = [];

    for (let i = 0; i < 6; i++) {
      const l = el('div', 'escondite', prado);
      el('div', 'animal', l);
      const m = el('div', 'mata', l);
      const [c1, c2] = VERDES[i % VERDES.length];
      m.innerHTML = ARBUSTO(c1, c2);
      lugares.push(l);
    }

    function llenar(l) {
      const usados = lugares.map(x => x.dataset.id);
      const libres = ANIMALES.filter(a => !usados.includes(a.id));
      const a = libres[azar(libres.length)];
      l.dataset.id = a.id;
      l.firstChild.replaceChildren(figura(a));
    }

    prado.addEventListener('pointerdown', e => {
      const l = e.target.closest('.escondite');
      if (!l) return;
      e.preventDefault();
      const a = buscar(l.dataset.id);
      if (l.classList.contains('abierto')) {
        saltar(l.firstChild.firstChild);
        sonar.boing();
        decir(a.sonido);
        return;
      }
      l.classList.add('abierto');
      sonar.sorpresa();
      const r = l.getBoundingClientRect();
      chispas(r.left + r.width / 2, r.top + r.height * 0.35, 10, 120);
      decir(`¡Aquí está ${a.conArticulo}!`);
      clearTimeout(l.espera);
      l.espera = setTimeout(() => {
        l.classList.remove('abierto');
        l.espera = setTimeout(() => llenar(l), 600);
      }, 4000);
    });

    return {
      entrar() {
        lugares.forEach(l => { clearTimeout(l.espera); l.classList.remove('abierto'); l.dataset.id = ''; });
        lugares.forEach(llenar);
      },
      salir() { lugares.forEach(l => clearTimeout(l.espera)); },
    };
  })();

  /* ---------- 5. Memorice ---------- */
  juegos.memorice = (() => {
    const sec = pantallas.memorice;
    botonCasa(sec);
    const barra = el('div', 'barra', sec);
    const botonPares = el('button', 'redondo-juego pares', barra);
    botonPares.setAttribute('aria-label', 'Cambiar cantidad de parejas');
    const mesa = el('div', 'mesa', sec);

    const OPCIONES = [2, 3, 4, 6];
    const FORMA = { 2: [4, 1], 3: [3, 2], 4: [4, 2], 6: [4, 3] }; // columnas, filas
    let pares = 3;
    try { pares = +localStorage.getItem('pintitas.parejas') || 3; } catch (e) { /* nada */ }
    if (!OPCIONES.includes(pares)) pares = 3;
    let abiertas = [];
    let hechas = 0;
    let ocupado = false;
    let espera = null;

    function repartir() {
      clearTimeout(espera);
      abiertas = [];
      hechas = 0;
      ocupado = false;
      botonPares.textContent = pares;
      const [cols, filas] = FORMA[pares];
      mesa.style.setProperty('--cols', cols);
      mesa.style.setProperty('--filas', filas);
      mesa.innerHTML = '';
      const elegidos = tomar(pares);
      mezclar(elegidos.concat(elegidos)).forEach((a, i) => {
        const c = el('button', 'naipe', mesa);
        c.dataset.id = a.id;
        const giro = el('div', 'giro', c);
        el('div', 'dorso', giro).innerHTML = HUELLA;
        el('div', 'cara', giro).appendChild(figura(a));
        aparecer(c, i * 60);
      });
    }

    mesa.addEventListener('pointerdown', e => {
      const c = e.target.closest('.naipe');
      if (!c || ocupado || c.classList.contains('abierta')) return;
      e.preventDefault();
      c.classList.add('abierta');
      abiertas.push(c);
      const a = buscar(c.dataset.id);
      if (abiertas.length === 1) { sonar.suave(); decir(a.nombre); return; }

      const [x, y] = abiertas;
      if (x.dataset.id === y.dataset.id) {
        x.classList.add('pareja');
        y.classList.add('pareja');
        abiertas = [];
        hechas++;
        sonar.fiesta();
        [x, y].forEach(n => { const [cx, cy] = centro(n); chispas(cx, cy, 10, 120); });
        if (hechas === pares) {
          decir(`¡Muy bien! ¡${a.nombre}! ¡Las encontraste todas!`);
          espera = setTimeout(() => {
            const [cx, cy] = centro(mesa);
            chispas(cx, cy, 40, 380);
            sonar.fiesta();
            espera = setTimeout(repartir, 2200);
          }, 1300);
        } else {
          decir(`¡Muy bien! ¡${a.nombre}!`);
        }
      } else {
        sonar.suave();
        decir(a.nombre);
        ocupado = true;
        espera = setTimeout(() => {
          x.classList.remove('abierta');
          y.classList.remove('abierta');
          abiertas = [];
          ocupado = false;
        }, 1400);
      }
    });

    botonPares.addEventListener('pointerdown', e => {
      e.preventDefault();
      pares = OPCIONES[(OPCIONES.indexOf(pares) + 1) % OPCIONES.length];
      try { localStorage.setItem('pintitas.parejas', pares); } catch (err) { /* nada */ }
      sonar.boing();
      repartir();
    });

    return {
      entrar() { repartir(); },
      salir() { clearTimeout(espera); },
    };
  })();
})();
