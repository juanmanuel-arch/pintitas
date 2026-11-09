(function () {
  'use strict';

  const W = 1250, H = 1000;
  const COLORES = [
    '#ff3e8f', '#ffa3cd',
    '#e8322e', '#ff8a1f',
    '#ffd83a', '#ffcf9e',
    '#8fd14f', '#2a9d55',
    '#5cc8f5', '#2f5fd8',
    '#9b51e0', '#8a5634',
    '#2b2230', '#ffffff',
  ];
  const TAMANOS = [14, 30, 55, 90];
  const PUNTO = [12, 22, 34, 50];       // tamaño del punto que se ve en cada botón
  const CLAVE_PLANTILLA = 'pintitas.plantilla';
  const MAX_DESHACER = 10;

  const $ = s => document.querySelector(s);
  const lienzo = $('#lienzo');
  const ctx = lienzo.getContext('2d');

  let color = COLORES[0];
  let tamano = TAMANOS[1];
  let actual = leer(CLAVE_PLANTILLA) || 'perro';
  if (!PLANTILLAS.some(p => p.id === actual)) actual = 'perro';

  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function escribir(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin guardado */ } }

  /* ---------- Colores y tamaños ---------- */
  const cajaColores = $('#colores');
  COLORES.forEach(c => {
    const b = document.createElement('button');
    b.className = 'color' + (c === '#ffffff' ? ' blanco' : '');
    b.style.setProperty('--c', c);
    b.setAttribute('aria-label', c === '#ffffff' ? 'Goma' : 'Color');
    b.addEventListener('pointerdown', () => elegirColor(c));
    b.dataset.c = c;
    cajaColores.appendChild(b);
  });

  const cajaTamanos = $('#tamanos');
  TAMANOS.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'tamano';
    b.dataset.t = t;
    b.setAttribute('aria-label', 'Tamaño ' + (i + 1));
    const s = document.createElement('span');
    s.style.width = s.style.height = `calc(var(--b) * ${PUNTO[i] / 80})`;
    b.appendChild(s);
    b.addEventListener('pointerdown', () => elegirTamano(t));
    cajaTamanos.appendChild(b);
  });

  function elegirColor(c) {
    color = c;
    cajaColores.querySelectorAll('.color').forEach(b => b.classList.toggle('activo', b.dataset.c === c));
    // El punto de los tamaños muestra el color elegido (la goma se ve rosada clarita)
    cajaTamanos.style.setProperty('--c', c === '#ffffff' ? '#ffd0e4' : c);
  }
  function elegirTamano(t) {
    tamano = t;
    cajaTamanos.querySelectorAll('.tamano').forEach(b => b.classList.toggle('activo', +b.dataset.t === t));
  }
  elegirColor(color);
  elegirTamano(tamano);

  /* ---------- Hoja ---------- */
  function limpiar() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
  }

  function mostrarLinea() {
    const p = PLANTILLAS.find(p => p.id === actual);
    $('#linea').innerHTML = p ? p.svg : '';
  }

  /* ---------- Deshacer ---------- */
  const pila = [];
  const botonDeshacer = $('#deshacer');
  function recordar() {
    const c = pila.length >= MAX_DESHACER ? pila.shift() : document.createElement('canvas');
    c.width = W; c.height = H;
    c.getContext('2d').drawImage(lienzo, 0, 0);
    pila.push(c);
    botonDeshacer.disabled = false;
  }
  function deshacer() {
    const c = pila.pop();
    if (c) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(c, 0, 0);
      guardarPronto();
    }
    botonDeshacer.disabled = pila.length === 0;
  }
  botonDeshacer.addEventListener('pointerdown', deshacer);
  botonDeshacer.disabled = true;

  /* ---------- Pintar ---------- */
  let trazo = null;
  let ultimoLapiz = 0;

  function punto(e) {
    const r = lienzo.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  }

  lienzo.addEventListener('pointerdown', e => {
    e.preventDefault();
    const esLapiz = e.pointerType === 'pen';
    if (esLapiz) ultimoLapiz = Date.now();
    // Si está usando el lápiz, la mano apoyada no pinta
    else if (e.pointerType === 'touch' && Date.now() - ultimoLapiz < 3000) return;

    if (trazo) {
      if (esLapiz && trazo.tipo !== 'pen') {
        // Venía pintando la palma: se borra ese trazo y manda el lápiz
        deshacer();
        trazo = null;
      } else {
        return;
      }
    }

    recordar();
    try { lienzo.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    const [x, y] = punto(e);
    trazo = { id: e.pointerId, tipo: e.pointerType, x, y, mx: x, my: y };
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, tamano / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  function seguir(ev) {
    const [x, y] = punto(ev);
    const mx = (trazo.x + x) / 2, my = (trazo.y + y) / 2;
    ctx.beginPath();
    ctx.moveTo(trazo.mx, trazo.my);
    ctx.quadraticCurveTo(trazo.x, trazo.y, mx, my);
    ctx.stroke();
    trazo.x = x; trazo.y = y; trazo.mx = mx; trazo.my = my;
  }

  lienzo.addEventListener('pointermove', e => {
    if (!trazo || e.pointerId !== trazo.id) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = tamano;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const lista = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    (lista.length ? lista : [e]).forEach(seguir);
  });

  function terminar(e) {
    if (!trazo || e.pointerId !== trazo.id) return;
    ctx.beginPath();
    ctx.moveTo(trazo.mx, trazo.my);
    ctx.lineTo(trazo.x, trazo.y);
    ctx.stroke();
    trazo = null;
    guardarPronto();
  }
  lienzo.addEventListener('pointerup', terminar);
  lienzo.addEventListener('pointercancel', terminar);

  /* ---------- Guardado (cada dibujo queda guardado en la tablet) ---------- */
  const db = (function () {
    let abierta;
    function abrir() {
      if (!abierta) {
        abierta = new Promise((ok, mal) => {
          const r = indexedDB.open('pintitas', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('dibujos');
          r.onsuccess = () => ok(r.result);
          r.onerror = () => mal(r.error);
        });
      }
      return abierta;
    }
    function hacer(modo, fn) {
      return abrir().then(d => new Promise((ok, mal) => {
        const tx = d.transaction('dibujos', modo);
        const r = fn(tx.objectStore('dibujos'));
        tx.oncomplete = () => ok(r && r.result);
        tx.onerror = () => mal(tx.error);
      }));
    }
    return {
      get: k => hacer('readonly', s => s.get(k)),
      set: (k, v) => hacer('readwrite', s => s.put(v, k)),
      del: k => hacer('readwrite', s => s.delete(k)),
    };
  })();

  let temporizador = null;
  let sucio = false;
  function guardarPronto() {
    sucio = true;
    clearTimeout(temporizador);
    temporizador = setTimeout(guardarAhora, 1200);
  }
  function guardarAhora() {
    clearTimeout(temporizador);
    if (!sucio) return Promise.resolve();
    sucio = false;
    const id = actual;
    return new Promise(ok => lienzo.toBlob(ok, 'image/png'))
      .then(blob => blob && db.set(id, blob))
      .catch(() => {});
  }

  async function abrirPlantilla(id) {
    await guardarAhora();
    actual = id;
    escribir(CLAVE_PLANTILLA, id);
    mostrarLinea();
    limpiar();
    pila.length = 0;
    botonDeshacer.disabled = true;
    try {
      const blob = await db.get(id);
      if (blob && actual === id) {
        const img = await createImageBitmap(blob);
        ctx.drawImage(img, 0, 0, W, H);
      }
    } catch (e) { /* hoja en blanco */ }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') guardarAhora();
    else mantenerDespierta();
  });
  addEventListener('pagehide', guardarAhora);

  /* ---------- Botón escondido: mantener apretada la huellita 3 segundos ---------- */
  const secreto = $('#secreto');
  let espera = null;
  function soltarSecreto() {
    clearTimeout(espera);
    espera = null;
    secreto.classList.remove('cargando');
  }
  secreto.addEventListener('pointerdown', e => {
    e.preventDefault();
    try { secreto.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    secreto.classList.add('cargando');
    espera = setTimeout(() => { soltarSecreto(); abrirClave(); }, 3000);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => secreto.addEventListener(t, soltarSecreto));

  /* ---------- Pregunta de papá: una suma ---------- */
  const velClave = $('#clave');
  const caja = $('#respuesta');
  let solucion = '';
  let escrito = '';

  const teclado = $('#teclado');
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'salir', '0', 'borrar'].forEach(k => {
    const b = document.createElement('button');
    b.textContent = k === 'salir' ? 'Cerrar' : k === 'borrar' ? 'Borrar' : k;
    if (k.length > 1) b.className = 'chico';
    b.addEventListener('click', () => tecla(k));
    teclado.appendChild(b);
  });

  function abrirClave() {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 5 + Math.floor(Math.random() * 5);
    solucion = String(a + b);
    escrito = '';
    caja.textContent = '';
    caja.classList.remove('mal');
    $('#pregunta').textContent = `¿${a} + ${b}?`;
    velClave.hidden = false;
  }
  function tecla(k) {
    if (k === 'salir') { velClave.hidden = true; return; }
    if (k === 'borrar') { escrito = escrito.slice(0, -1); caja.textContent = escrito; return; }
    if (escrito.length >= 2) return;
    escrito += k;
    caja.textContent = escrito;
    if (escrito.length === solucion.length) {
      if (escrito === solucion) {
        velClave.hidden = true;
        abrirMenu();
      } else {
        caja.classList.add('mal');
        setTimeout(() => { velClave.hidden = true; }, 600);
      }
    }
  }

  /* ---------- Menú de papá ---------- */
  const menu = $('#menu');
  const galeria = $('#galeria');
  const botonBorrar = $('#borrar');
  let confirmarBorrar = false;

  PLANTILLAS.forEach(p => {
    const b = document.createElement('button');
    b.className = 'ficha';
    b.dataset.id = p.id;
    b.innerHTML = `<div class="mini">${p.svg}</div><span>${p.nombre}</span>`;
    // Se usa "click" para que deslizar la lista no elija un dibujo sin querer
    b.addEventListener('click', async () => {
      if (p.id !== actual) await abrirPlantilla(p.id);
      cerrarMenu();
    });
    galeria.appendChild(b);
  });

  // paraNina = true: la galería que abre ella, con fichas grandes y sin botones de papá
  function abrirMenu(paraNina) {
    menu.classList.toggle('nina', !!paraNina);
    $('#titulo-menu').textContent = paraNina ? '¿Qué quieres pintar?' : 'Elige el dibujo';
    galeria.querySelectorAll('.ficha').forEach(f => f.classList.toggle('activa', f.dataset.id === actual));
    galeria.scrollTop = 0;
    reiniciarBorrar();
    menu.hidden = false;
  }
  // Responde al apoyar el dedo: si el toque activa la pantalla completa, todo se mueve y un "click" se perdería
  $('#dibujos').addEventListener('pointerdown', e => { e.preventDefault(); abrirMenu(true); });
  $('#cerrar-nina').addEventListener('click', cerrarMenu);
  function cerrarMenu() { menu.hidden = true; }
  function reiniciarBorrar() {
    confirmarBorrar = false;
    botonBorrar.textContent = 'Borrar este dibujo';
    botonBorrar.classList.remove('alerta');
  }

  $('#listo').addEventListener('click', cerrarMenu);
  botonBorrar.addEventListener('click', () => {
    if (!confirmarBorrar) {
      confirmarBorrar = true;
      botonBorrar.textContent = '¿Seguro? Toca otra vez';
      botonBorrar.classList.add('alerta');
      return;
    }
    recordar();
    limpiar();
    sucio = true;
    guardarAhora();
    reiniciarBorrar();
    cerrarMenu();
  });
  $('#completa').addEventListener('click', () => { pedirPantallaCompleta(); cerrarMenu(); });

  /* ---------- Que no se salga ---------- */
  // Nada de menú al mantener apretado, zoom, ni deslizar la página.
  document.addEventListener('contextmenu', e => e.preventDefault());
  ['gesturestart', 'gesturechange', 'dblclick', 'selectstart', 'dragstart'].forEach(t =>
    document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => {
    if (!e.target.closest('.desplazable')) e.preventDefault();
  }, { passive: false });

  // Botón "atrás" de Android: se queda en la app.
  let trampa = false;
  function ponerTrampa() {
    if (trampa) return;
    try { history.pushState({ pintitas: 1 }, ''); trampa = true; } catch (e) { /* nada */ }
  }
  addEventListener('popstate', () => {
    trampa = false;
    ponerTrampa();
    trampa = false; // al próximo toque se vuelve a poner con un gesto real
  });

  function enApp() {
    return matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
  }
  function pedirPantallaCompleta() {
    const el = document.documentElement;
    if (document.fullscreenElement || !el.requestFullscreen) return;
    el.requestFullscreen({ navigationUI: 'hide' })
      .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'))
      .catch(() => {});
  }

  // Pantalla siempre encendida mientras pinta
  let candado = null;
  async function mantenerDespierta() {
    try {
      if (!candado && 'wakeLock' in navigator && document.visibilityState === 'visible') {
        candado = await navigator.wakeLock.request('screen');
        candado.addEventListener('release', () => { candado = null; });
      }
    } catch (e) { /* no se pudo */ }
  }

  // Con cada toque: vuelve a pantalla completa (si la abrieron desde el navegador),
  // deja puesta la trampa del botón atrás y mantiene la pantalla encendida.
  document.addEventListener('pointerdown', () => {
    ponerTrampa();
    if (!enApp()) pedirPantallaCompleta();
    mantenerDespierta();
  }, true);

  /* ---------- Inicio ---------- */
  abrirPlantilla(actual);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
