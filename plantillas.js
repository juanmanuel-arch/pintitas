// Los 20 animalitos. Cada dibujo es un SVG de 500 x 400.
// Para pintar: todo va relleno de blanco y se muestra con "multiply" sobre la pintura.
// En los juegos: la clase .pintado del contenedor les da color (ver estilos.css).
//   - color principal: --c1 (relleno del grupo)
//   - clase "d": color de detalle --c2 (pancitas, manchas, orejas por dentro)
//   - otras clases: colores fijos (pico, rosa, amar, verde, bl = blanco, mj = mejilla)
//   - clase "esc": escenario (agua, ramas, estrellas); se oculta en los juegos
(function () {
  'use strict';

  const T = '#3d2b3d';                          // color de las líneas
  const O = `fill="${T}"`;                      // relleno oscuro (narices, pupilas)
  const N = 'fill="none"';                      // solo línea
  const NF = 'fill="none" stroke-width="4.5"';  // línea fina
  const F = 'stroke-width="4.5" class="d"';     // figura fina con color de detalle
  const K = c => `class="${c}"`;                // figura con color fijo
  const KF = c => `stroke-width="4.5" class="${c}"`;
  const ESC = 'class="esc"';
  const ESCN = 'class="esc" fill="none"';

  const C = (x, y, r, a = '') => `<circle cx="${x}" cy="${y}" r="${r}" ${a}/>`;
  const E = (x, y, rx, ry, a = '', rot = 0) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${rot ? `transform="rotate(${rot} ${x} ${y})"` : ''} ${a}/>`;
  const P = (d, a = '') => `<path d="${d}" ${a}/>`;
  const R = (x, y, w, h, r, a = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${a}/>`;
  const ojo = (x, y, r = 11) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${T}" stroke="none"/>` +
    `<circle cx="${(x + r * 0.38).toFixed(1)}" cy="${(y - r * 0.38).toFixed(1)}" r="${(r * 0.33).toFixed(1)}" fill="#fff" stroke="none"/>`;
  const sonrisa = (x, y, w = 12) => P(`M${x - w} ${y} Q${x} ${y + w} ${x + w} ${y}`, N);
  const mejilla = (x, y, r = 11) => C(x, y, r, KF('mj'));

  // Círculo con bordes ondulados (melena del león)
  function feston(cx, cy, r, n, a = '') {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      pts.push([(cx + r * Math.cos(ang)).toFixed(1), (cy + r * Math.sin(ang)).toFixed(1)]);
    }
    const br = (2 * r * Math.sin(Math.PI / n) * 0.62).toFixed(1);
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i <= n; i++) d += ` A${br} ${br} 0 0 1 ${pts[i][0]} ${pts[i][1]}`;
    return P(d + 'Z', a);
  }

  function estrella(cx, cy, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1) + ' ';
    }
    return P(d + 'Z', 'stroke-width="5.5" class="esc amar"');
  }

  function corazon(x, y, s, a = 'stroke-width="5.5" class="esc rosa"') {
    return P(`M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.7} ${y - s * 1.2} ${x} ${y - s * 0.35} ` +
      `C${x + s * 0.7} ${y - s * 1.2} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9}Z`, a);
  }

  // Brazo ondulado del pulpo (dir: -1 se curva a la izquierda, 1 a la derecha)
  function brazo(x, dir) {
    return P(`M${x - 16} 236 Q${x - 22} 300 ${x - 6 + dir * 10} 340 Q${x + dir * 28} 374 ${x + dir * 42} 350 ` +
      `Q${x + dir * 14} 346 ${x + 14} 300 Q${x + 18} 270 ${x + 16} 236Z`);
  }

  // Estrella de mar con puntas redondas
  function estrellaMar(cx, cy, R, r) {
    const pt = (rad, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      return [(cx + rad * Math.cos(a)).toFixed(1), (cy + rad * Math.sin(a)).toFixed(1)];
    };
    let d = '';
    for (let i = 0; i < 5; i++) {
      const [ix, iy] = pt(r, 2 * i - 1);
      const [ox, oy] = pt(R, 2 * i);
      const [nx, ny] = pt(r, 2 * i + 1);
      d += (i ? '' : `M${ix} ${iy} `) + `Q${ox} ${oy} ${nx} ${ny} `;
    }
    return P(d + 'Z');
  }

  const svg = (inner, mover) =>
    `<svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" stroke="${T}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"${mover ? ` transform="${mover}"` : ''}>${inner}</g></svg>`;

  // [id, nombre, con artículo, qué hace, color principal, color de detalle, partes, mover]
  const lista = [
    ['perro', 'Perrito', 'el perrito', 'El perrito hace guau guau', '#f0c08a', '#fff4e4', [
      P('M332 305 Q392 290 382 232 Q376 220 364 232 Q366 275 328 285Z'),
      E(250, 300, 90, 72),
      E(250, 312, 46, 42, F),
      E(212, 358, 28, 20), E(288, 358, 28, 20),
      E(172, 168, 28, 62, K('d2'), 18), E(328, 168, 28, 62, K('d2'), -18),
      C(250, 150, 80),
      E(282, 128, 25, 23, KF('d2')),
      E(250, 182, 42, 30, K('d')),
      E(250, 166, 15, 10, O),
      P('M250 176 L250 190', N), P('M236 192 Q250 204 264 192', N),
      ojo(218, 132), ojo(282, 132),
      R(208, 222, 84, 18, 9, K('rosa')), C(250, 250, 11, K('amar')),
    ]],
    ['gato', 'Gatito', 'el gatito', 'El gatito hace miau', '#ffb45e', '#fff1dc', [
      P('M318 335 Q402 335 396 258 Q390 244 378 254 Q382 312 318 318Z'),
      E(250, 300, 80, 75),
      E(250, 315, 42, 42, F),
      E(218, 366, 26, 16), E(282, 366, 26, 16),
      P('M178 128 L188 52 L238 92Z'), P('M322 128 L312 52 L262 92Z'),
      P('M195 104 L198 72 L222 92Z', KF('rosado')), P('M305 104 L302 72 L278 92Z', KF('rosado')),
      E(250, 158, 82, 72),
      E(220, 150, 10, 15, `fill="${T}" stroke="none"`), C(224, 144, 3.5, 'fill="#fff" stroke="none"'),
      E(280, 150, 10, 15, `fill="${T}" stroke="none"`), C(284, 144, 3.5, 'fill="#fff" stroke="none"'),
      P('M241 172 L259 172 L250 182Z', O),
      P('M250 182 Q244 196 230 190', N), P('M250 182 Q256 196 270 190', N),
      P('M205 178 L160 170 M205 188 L162 194 M295 178 L340 170 M295 188 L338 194', NF),
      P('M238 94 L240 110 M250 91 L250 110 M262 94 L260 110', NF),
      corazon(250, 318, 14, 'stroke-width="5.5" class="rosa"'),
    ]],
    ['conejo', 'Conejito', 'el conejito', 'El conejito salta, salta', '#f3f1f6', '#ffc2dc', [
      E(222, 85, 24, 66, '', -10), E(278, 85, 24, 66, '', 10),
      E(222, 90, 11, 46, F, -10), E(278, 90, 11, 46, F, 10),
      E(250, 305, 78, 68),
      E(250, 318, 46, 42, KF('bl')),
      E(208, 366, 32, 17), E(292, 366, 32, 17),
      C(250, 178, 68),
      ojo(224, 170), ojo(276, 170),
      R(243, 205, 14, 13, 3, KF('bl')),
      E(250, 196, 10, 7, K('rosa')),
      P('M250 203 Q242 214 232 208', N), P('M250 203 Q258 214 268 208', N),
      mejilla(204, 200), mejilla(296, 200),
    ]],
    ['oso', 'Osito', 'el osito', 'El osito hace grrr', '#c08552', '#f3d2a8', [
      C(185, 98, 28), C(315, 98, 28), C(185, 98, 14, F), C(315, 98, 14, F),
      E(250, 300, 88, 75),
      E(250, 308, 50, 46, F),
      E(170, 285, 22, 42, '', 35), E(330, 285, 22, 42, '', -35),
      C(205, 358, 28), C(295, 358, 28), C(205, 360, 13, F), C(295, 360, 13, F),
      C(250, 152, 78),
      E(250, 184, 36, 27, K('d')),
      E(250, 174, 14, 10, O),
      P('M250 184 L250 194', N), P('M238 196 Q250 206 262 196', N),
      ojo(220, 138), ojo(280, 138),
      mejilla(195, 175), mejilla(305, 175),
    ]],
    ['pollito', 'Pollito', 'el pollito', 'El pollito hace pío pío', '#ffe04a', '#fff', [
      P('M236 132 Q226 102 246 108 Q250 88 264 102 Q278 104 266 132Z'),
      C(250, 228, 103),
      E(150, 250, 22, 40, K('amar2'), 25), E(350, 250, 22, 40, K('amar2'), -25),
      ojo(212, 205, 12), ojo(288, 205, 12),
      P('M234 228 L266 228 L250 250Z', K('pico')),
      mejilla(190, 238), mejilla(310, 238),
      P('M140 282 L168 262 L194 288 L222 262 L250 288 L278 262 L306 288 L332 262 L360 282 Q356 372 250 374 Q144 372 140 282Z', K('bl')),
    ]],
    ['pato', 'Patito', 'el patito', 'El patito hace cuac cuac', '#ffe04a', '#ffd000', [
      P('M60 360 Q85 345 110 360 T160 360 T210 360 T260 360 T310 360 T360 360 T410 360 T460 360', ESCN),
      P('M121 186 Q82 180 66 196 Q84 214 126 206Z', K('pico')),
      P('M140 262 C140 332 220 346 290 340 C360 334 396 300 392 252 L424 224 C394 226 372 236 356 244 C322 256 272 246 232 240 C184 234 140 232 140 262Z'),
      C(178, 178, 58),
      ojo(172, 164),
      mejilla(198, 196),
      P('M240 272 Q300 250 350 276 Q324 312 262 302 Q236 292 240 272Z', K('d')),
    ]],
    ['cerdo', 'Cerdito', 'el cerdito', 'El cerdito hace oinc oinc', '#ffb5cb', '#ff8fb1', [
      P('M188 110 L170 56 L228 88Z'), P('M312 110 L330 56 L272 88Z'),
      P('M196 98 L184 70 L214 88Z', F), P('M304 98 L316 70 L286 88Z', F),
      R(190, 330, 36, 50, 12), R(274, 330, 36, 50, 12),
      E(250, 295, 96, 62),
      P('M344 280 q24 -6 24 -26 q0 -14 -13 -10 q-10 6 2 18 q8 6 20 -2', N),
      C(250, 165, 82),
      E(250, 192, 38, 27, K('d')),
      E(237, 192, 6, 10, O), E(263, 192, 6, 10, O),
      ojo(214, 148), ojo(286, 148),
      mejilla(190, 192), mejilla(310, 192),
      sonrisa(250, 228, 14),
    ]],
    ['vaca', 'Vaquita', 'la vaquita', 'La vaquita hace muuu', '#ffffff', '#6b4a3a', [
      P('M205 100 Q172 66 188 40 Q206 66 226 84Z', K('amar')), P('M295 100 Q328 66 312 40 Q294 66 274 84Z', K('amar')),
      E(166, 128, 36, 16, '', 22), E(334, 128, 36, 16, '', -22),
      R(192, 330, 34, 48, 12), R(274, 330, 34, 48, 12),
      E(250, 300, 100, 58),
      P('M300 280 Q322 266 336 286 Q332 312 306 306Z', F),
      P('M176 306 Q192 292 208 306 Q204 328 182 324Z', F),
      P('M236 238 L264 238 L272 266 L228 266Z', K('amar')), C(250, 270, 5, O),
      E(250, 152, 68, 78),
      P('M206 104 Q226 92 240 112 Q232 134 210 126Z', F),
      ojo(222, 150), ojo(278, 150),
      E(250, 200, 54, 34, K('rosado')),
      E(232, 200, 7, 10, O), E(268, 200, 7, 10, O),
      P('M238 220 Q250 228 262 220', N),
    ]],
    ['oveja', 'Ovejita', 'la ovejita', 'La ovejita hace beee', '#fbf8f2', '#f2c9a4', [
      R(195, 318, 22, 58, 9, K('d')), R(283, 318, 22, 58, 9, K('d')),
      P('M160 260 a35 35 0 0 1 40 -55 a40 40 0 0 1 70 -15 a40 40 0 0 1 70 15 a35 35 0 0 1 40 55 a35 35 0 0 1 -30 60 a40 40 0 0 1 -60 15 a40 40 0 0 1 -65 -5 a35 35 0 0 1 -40 -25 a35 35 0 0 1 -25 -45Z'),
      E(108, 210, 24, 11, K('d'), -25), E(192, 210, 24, 11, K('d'), 25),
      E(150, 228, 40, 50, K('d')),
      C(132, 182, 13), C(152, 176, 14), C(171, 184, 12),
      ojo(136, 222, 9), ojo(164, 222, 9),
      sonrisa(150, 252, 9),
      C(124, 244, 7, KF('mj')), C(176, 244, 7, KF('mj')),
    ], 'translate(-19 -93) scale(1.15)'],
    ['pez', 'Pececito', 'el pececito', 'El pececito hace glu glu', '#ff9a3c', '#ffd28a', [
      C(88, 160, 9, 'stroke-width="4.5" class="esc agua"'), C(72, 128, 13, 'stroke-width="4.5" class="esc agua"'), C(96, 96, 7, 'stroke-width="4.5" class="esc agua"'),
      P('M420 392 Q402 340 420 300 Q434 270 424 236 Q448 270 438 306 Q424 346 444 392Z', 'class="esc verde"'),
      P('M458 392 Q446 360 460 328 Q474 352 470 392Z', 'class="esc verde"'),
      P('M30 392 L480 392', ESCN),
      P('M330 200 L410 145 Q394 200 410 255Z', K('d')),
      P('M192 158 Q225 90 290 170Z', K('d')),
      P('M215 242 Q238 292 270 242Z', K('d')),
      P('M110 200 Q200 100 340 200 Q200 300 110 200Z'),
      ojo(162, 190, 13),
      P('M116 208 Q126 214 134 206', N),
      P('M195 160 Q212 200 195 240', N),
      P('M232 178 Q242 190 252 178 M258 196 Q268 208 278 196 M232 214 Q242 226 252 214 M284 216 Q292 226 300 214 M284 180 Q292 190 300 180', NF),
    ]],
    ['tortuga', 'Tortuguita', 'la tortuguita', 'La tortuguita camina despacito', '#a6dc6a', '#3fa35a', [
      P('M118 280 L86 296 L120 298Z'),
      E(170, 318, 24, 30), E(326, 318, 24, 30),
      R(326, 222, 64, 40, 18),
      E(398, 232, 42, 36),
      ojo(410, 222),
      P('M398 250 Q412 258 426 248', N),
      C(380, 242, 8, KF('mj')),
      P('M110 286 Q118 140 250 140 Q382 140 390 286Z', K('d')),
      P('M98 286 L402 286 Q404 306 384 306 L116 306 Q96 306 98 286Z', K('amar')),
      P('M218 192 L282 192 L304 236 L282 280 L218 280 L196 236Z', KF('d3')),
      P('M218 192 L188 158 M282 192 L312 158 M196 236 L118 236 M304 236 L382 236 M218 280 L206 286 M282 280 L294 286', NF),
    ]],
    ['mariposa', 'Mariposa', 'la mariposa', 'La mariposa vuela, vuela', '#c58cff', '#ffd84a', [
      P('M245 200 C180 80 90 90 100 160 C105 205 180 215 245 210Z'),
      P('M255 200 C320 80 410 90 400 160 C395 205 320 215 255 210Z'),
      P('M245 215 C170 215 120 260 150 300 C180 335 235 290 248 230Z', K('rosa')),
      P('M255 215 C330 215 380 260 350 300 C320 335 265 290 252 230Z', K('rosa')),
      C(160, 155, 22, F), C(340, 155, 22, F), C(185, 270, 15, F), C(315, 270, 15, F),
      E(250, 230, 16, 75, K('morado')),
      P('M243 128 Q225 90 205 80', N), P('M257 128 Q275 90 295 80', N),
      C(203, 78, 7, O), C(297, 78, 7, O),
      C(250, 145, 22, K('morado')),
      C(243, 143, 4, O), C(257, 143, 4, O),
      P('M244 152 Q250 157 256 152', NF),
    ]],
    ['elefante', 'Elefantito', 'el elefantito', 'El elefantito levanta la trompa', '#aeb9d8', '#ffc2dc', [
      E(160, 165, 70, 82), E(340, 165, 70, 82),
      E(166, 168, 44, 56, F), E(334, 168, 44, 56, F),
      R(186, 318, 40, 62, 14), R(274, 318, 40, 62, 14),
      E(250, 300, 96, 56),
      P('M196 374 Q201 366 206 374 M206 374 Q211 366 216 374 M284 374 Q289 366 294 374 M294 374 Q299 366 304 374', NF),
      E(250, 162, 72, 80),
      ojo(220, 148), ojo(280, 148),
      mejilla(200, 188), mejilla(300, 188),
      P('M228 178 Q224 250 238 292 Q248 320 276 320 Q302 318 304 294 Q304 280 290 280 Q284 300 272 298 Q262 296 262 270 Q264 220 272 178Z'),
      R(231, 171, 38, 13, 0, 'stroke="none"'),
      P('M230 232 Q247 240 265 232 M233 256 Q248 264 264 256', NF),
    ]],
    ['leon', 'Leoncito', 'el leoncito', 'El leoncito hace grrr', '#ffcf5a', '#e8892e', [
      P('M322 332 Q396 338 388 266 Q382 256 372 266 Q378 316 320 316Z'), E(386, 252, 14, 18, K('d')),
      E(250, 312, 80, 60),
      E(250, 322, 42, 38, KF('crema')),
      E(216, 366, 26, 15), E(284, 366, 26, 15),
      feston(250, 165, 98, 14, K('d')),
      C(186, 104, 20), C(314, 104, 20), C(186, 104, 10, F), C(314, 104, 10, F),
      C(250, 172, 70),
      ojo(224, 158), ojo(276, 158),
      P('M238 184 L262 184 L250 198Z', O),
      P('M250 198 Q242 212 228 205', N), P('M250 198 Q258 212 272 205', N),
      mejilla(204, 192), mejilla(296, 192),
    ]],
    ['jirafa', 'Jirafita', 'la jirafita', 'La jirafita tiene el cuello muy largo', '#ffd45a', '#c27a2c', [
      R(178, 292, 22, 88, 9), R(214, 292, 22, 88, 9), R(292, 292, 22, 88, 9), R(326, 292, 22, 88, 9),
      P('M296 262 Q306 166 336 80 L370 88 Q348 176 352 262Z'),
      E(262, 282, 108, 50),
      P('M362 268 Q388 290 382 322', N), E(382, 332, 7, 12, O),
      P('M190 262 Q204 248 220 258 Q224 276 206 280 Q188 280 190 262Z', F),
      P('M240 300 Q256 288 270 300 Q270 318 252 316 Q236 314 240 300Z', F),
      P('M292 256 Q308 246 322 258 Q320 276 302 276 Q288 272 292 256Z', F),
      P('M318 150 Q330 142 340 152 Q336 166 324 164Z', F),
      P('M314 200 Q326 194 334 204 Q330 218 318 214Z', F),
      P('M346 50 L342 26', N), C(342, 22, 7, K('d')), P('M372 48 L376 24', N), C(377, 20, 7, K('d')),
      E(326, 62, 17, 8, '', -25), E(410, 60, 17, 8, '', 20),
      E(368, 70, 44, 30, '', 12),
      ojo(358, 62, 9),
      C(398, 82, 3, O),
      P('M380 90 Q390 96 400 90', N),
    ]],
    ['buho', 'Buhito', 'el buhito', 'El buhito hace uh, uh', '#b98a5e', '#f3dcbc', [
      P('M180 122 L170 62 L220 98Z'), P('M320 122 L330 62 L280 98Z'),
      P('M250 80 C342 80 352 200 346 262 C340 332 300 346 250 346 C200 346 160 332 154 262 C148 200 158 80 250 80Z'),
      P('M162 186 Q118 252 166 318 Q190 254 162 186Z', K('cafe')), P('M338 186 Q382 252 334 318 Q310 254 338 186Z', K('cafe')),
      E(250, 282, 56, 48, F),
      P('M226 266 l10 10 l10 -10 M254 266 l10 10 l10 -10 M240 290 l10 10 l10 -10', NF),
      C(208, 165, 44, K('d')), C(292, 165, 44, K('d')),
      C(208, 165, 24, K('bl')), C(292, 165, 24, K('bl')),
      ojo(208, 165, 13), ojo(292, 165, 13),
      P('M236 198 L264 198 L250 222Z', K('pico')),
      P('M50 338 L450 338 Q462 352 450 366 L50 366 Q38 352 50 338Z', 'class="esc cafe"'),
      P('M430 338 Q450 306 478 316 Q464 342 430 338Z', 'class="esc verde"'),
      E(222, 340, 18, 10, K('pico')), E(278, 340, 18, 10, K('pico')),
    ]],
    ['caracol', 'Caracolito', 'el caracolito', 'El caracolito va lento, lento', '#a8d8f5', '#ff9cc8', [
      P('M40 344 L470 344', ESCN),
      P('M430 344 l-8 -24 M438 344 l0 -30 M446 344 l8 -24 M60 344 l-6 -20 M66 344 l0 -26 M72 344 l6 -20', 'class="esc" fill="none" stroke-width="4.5"'),
      P('M128 196 L114 142', N), P('M160 194 L172 142', N),
      P('M106 342 L106 232 Q106 188 144 188 Q182 188 182 232 L182 298 L398 298 Q436 318 404 342Z'),
      C(112, 132, 15, K('bl')), C(174, 132, 15, K('bl')),
      ojo(114, 134, 8), ojo(176, 134, 8),
      sonrisa(144, 240, 13),
      C(122, 222, 8, KF('mj')), C(166, 222, 8, KF('mj')),
      C(282, 218, 86, K('d')),
      P('M292 218 A10 10 0 0 1 272 218 A20 20 0 0 1 312 218 A30 30 0 0 1 252 218 A40 40 0 0 1 332 218 A50 50 0 0 1 232 218 A60 60 0 0 1 352 218', N),
    ]],
    ['rana', 'Ranita', 'la ranita', 'La ranita hace croac croac', '#7fcf5c', '#c9f0a8', [
      E(250, 352, 190, 34, 'class="esc verde2"'),
      E(165, 322, 46, 30), E(335, 322, 46, 30),
      E(250, 280, 92, 70),
      E(250, 298, 52, 42, F),
      E(204, 346, 24, 12), E(296, 346, 24, 12),
      C(192, 148, 36), C(308, 148, 36),
      E(250, 200, 104, 62),
      C(192, 142, 22, K('bl')), C(308, 142, 22, K('bl')),
      ojo(194, 144, 12), ojo(306, 144, 12),
      C(240, 186, 3, O), C(260, 186, 3, O),
      P('M188 214 Q250 258 312 214', N),
      mejilla(172, 214), mejilla(328, 214),
    ]],
    ['unicornio', 'Unicornio', 'el unicornio', 'El unicornio es mágico', '#ffffff', '#c9a0ff', [
      estrella(90, 90, 26), estrella(425, 80, 22), estrella(440, 300, 18), estrella(66, 296, 20),
      corazon(110, 200, 16), corazon(410, 200, 14),
      C(306, 112, 30, K('d')), C(326, 152, 30, K('rosa')), C(330, 198, 30, K('d')), C(322, 244, 28, K('rosa')),
      C(312, 288, 26, K('d')), C(306, 328, 24, K('rosa')), C(204, 102, 24, K('rosa')),
      P('M202 116 L194 58 L236 94Z'), P('M298 116 L306 58 L264 94Z'),
      P('M204 236 Q196 320 182 384 L318 384 Q304 320 296 236Z'),
      E(250, 168, 70, 80),
      P('M236 96 L250 18 L264 96Z', K('amar')),
      P('M240 76 L261 70 M244 56 L257 52', NF),
      E(250, 218, 52, 36, K('rosado')),
      E(234, 220, 5, 7, O), E(266, 220, 5, 7, O),
      P('M238 238 Q250 246 262 238', N),
      ojo(222, 156), ojo(278, 156),
      P('M207 148 L198 141 M211 142 L205 133 M293 148 L302 141 M289 142 L295 133', NF),
      mejilla(200, 190), mejilla(300, 190),
    ]],
    ['raton', 'Ratoncito', 'el ratoncito', 'El ratoncito hace iii iii', '#c4c4d4', '#ffc2dc', [
      P('M50 366 L140 366 L140 316Z', 'class="esc amar"'), C(120, 352, 7, 'stroke-width="4.5" class="esc amar2"'), C(132, 336, 4, 'stroke-width="4.5" class="esc amar2"'),
      C(180, 112, 50), C(320, 112, 50), C(180, 112, 30, F), C(320, 112, 30, F),
      P('M310 336 Q392 360 410 306 Q420 272 448 272', N),
      E(250, 305, 74, 64),
      E(250, 318, 40, 36, F),
      E(214, 368, 24, 13), E(286, 368, 24, 13),
      E(250, 178, 72, 64),
      ojo(224, 170), ojo(276, 170),
      E(250, 202, 11, 9, O),
      P('M214 204 L176 196 M214 214 L178 220 M286 204 L324 196 M286 214 L322 220', NF),
      P('M240 216 Q250 224 260 216', N),
    ]],
    ['pinguino', 'Pingüino', 'el pingüino', 'El pingüino camina así, así', '#3f4a6b', '#fff', [
      E(165, 255, 20, 58, '', 25), E(335, 255, 20, 58, '', -25),
      E(215, 368, 30, 12, K('pico')), E(285, 368, 30, 12, K('pico')),
      P('M250 70 C330 70 345 180 342 260 C340 340 300 368 250 368 C200 368 160 340 158 260 C155 180 170 70 250 70Z'),
      P('M250 130 C300 130 312 200 310 265 C308 330 285 352 250 352 C215 352 192 330 190 265 C188 200 200 130 250 130Z', K('bl')),
      ojo(224, 178), ojo(276, 178),
      P('M234 196 L266 196 L250 216Z', K('pico')),
      mejilla(205, 210), mejilla(295, 210),
    ]],
    ['ballena', 'Ballenita', 'la ballenita', 'La ballenita echa agua por arriba', '#6fb6f0', '#d8efff', [
      P('M200 128 Q185 95 172 72 M200 128 L200 58 M200 128 Q215 95 228 72', N),
      C(170, 64, 10, K('agua')), C(200, 46, 10, K('agua')), C(230, 64, 10, K('agua')),
      P('M370 250 Q420 232 440 172 Q458 200 450 226 Q482 236 488 276 Q440 290 372 276Z'),
      P('M80 250 C80 160 180 120 270 130 C350 140 392 190 392 242 C392 300 330 330 240 330 C140 330 80 310 80 250Z'),
      P('M92 272 C130 300 300 310 384 270 C372 306 320 328 240 330 C150 330 105 308 92 272Z', K('d')),
      P('M170 300 L172 318 M210 306 L211 325 M250 308 L250 327 M290 306 L289 325', NF),
      ojo(152, 212, 12),
      P('M104 252 Q132 270 162 260', N),
      mejilla(178, 244),
    ]],
    ['mono', 'Monito', 'el monito', 'El monito hace u u a a', '#a8714a', '#f5d3ac', [
      P('M318 334 Q402 344 402 282 Q402 240 370 246 Q350 252 362 272', N),
      E(250, 305, 72, 65),
      E(250, 315, 42, 40, F),
      E(186, 300, 20, 45, '', 20), E(314, 300, 20, 45, '', -20),
      E(215, 366, 28, 15), E(285, 366, 28, 15),
      C(160, 160, 32), C(340, 160, 32), C(160, 160, 18, F), C(340, 160, 18, F),
      C(250, 160, 82),
      P('M240 80 Q250 60 262 78', N),
      P('M250 132 C228 108 186 118 190 158 C192 196 220 222 250 222 C280 222 308 196 310 158 C314 118 272 108 250 132Z', K('d')),
      ojo(226, 155), ojo(274, 155),
      C(242, 184, 3, O), C(258, 184, 3, O),
      P('M228 198 Q250 216 272 198', N),
      mejilla(206, 190), mejilla(294, 190),
    ]],
    ['dino', 'Dinosaurio', 'el dinosaurio', 'El dinosaurio hace roar', '#8fd36a', '#ffd84a', [
      P('M150 250 Q90 262 32 232 Q66 300 158 314Z'),
      P('M150 252 L170 198 L190 252Z', K('d')), P('M190 238 L210 182 L230 238Z', K('d')),
      P('M230 236 L250 178 L270 236Z', K('d')), P('M270 244 L290 190 L310 244Z', K('d')),
      P('M300 250 Q330 160 360 110 L405 125 Q370 190 350 280Z'),
      R(165, 300, 32, 72, 14), R(205, 306, 32, 68, 14), R(268, 306, 32, 68, 14), R(306, 300, 32, 72, 14),
      E(240, 280, 105, 62),
      C(205, 272, 12, F), C(250, 258, 9, F), C(282, 296, 11, F),
      E(392, 105, 48, 34, '', -10),
      ojo(392, 94, 10),
      C(428, 100, 3, O),
      P('M404 120 Q418 127 432 116', N),
      mejilla(372, 118, 9),
    ]],
    ['pulpo', 'Pulpito', 'el pulpito', 'El pulpito tiene ocho patitas', '#ff8fb8', '#ffd1e3', [
      brazo(150, -1), brazo(200, -1), brazo(238, -1), brazo(262, 1), brazo(300, 1), brazo(350, 1),
      P('M140 250 C130 140 190 70 250 70 C310 70 370 140 360 250 C330 270 170 270 140 250Z'),
      C(205, 120, 10, F), C(300, 114, 13, F), C(256, 102, 7, F),
      ojo(220, 186, 13), ojo(280, 186, 13),
      sonrisa(250, 214, 14),
      mejilla(194, 214), mejilla(306, 214),
    ]],
    ['cangrejo', 'Cangrejito', 'el cangrejito', 'El cangrejito camina de lado', '#ff6b5b', '#ffb3a8', [
      P('M180 290 L120 300 L105 330 M175 310 L125 330 L118 360 M190 325 L150 352 L150 380', N),
      P('M320 290 L380 300 L395 330 M325 310 L375 330 L382 360 M310 325 L350 352 L350 380', N),
      P('M195 240 Q155 205 142 168', N), P('M305 240 Q345 205 358 168', N),
      P('M140 175 C95 175 85 125 115 100 L128 125 L150 108 C165 130 165 165 140 175Z'),
      P('M360 175 C405 175 415 125 385 100 L372 125 L350 108 C335 130 335 165 360 175Z'),
      P('M228 205 L222 152', N), P('M272 205 L278 152', N),
      E(250, 270, 105, 70),
      C(220, 142, 16, K('bl')), C(280, 142, 16, K('bl')),
      ojo(222, 144, 9), ojo(282, 144, 9),
      P('M222 284 Q250 306 278 284', N),
      mejilla(194, 278), mejilla(306, 278),
      C(250, 236, 7, F), C(214, 250, 5, F), C(286, 250, 5, F),
    ]],
    ['abeja', 'Abejita', 'la abejita', 'La abejita hace bzzz', '#ffd84a', '#4a3346', [
      E(270, 160, 38, 58, K('agua'), 15), E(318, 166, 32, 50, K('agua'), 35),
      P('M395 258 L432 268 L395 282Z', O),
      E(300, 265, 100, 70),
      P('M265 198 Q245 265 265 332 L300 335 Q280 265 300 196Z', K('d')),
      P('M335 202 Q318 265 335 328 L362 318 Q345 265 362 212Z', K('d')),
      P('M170 196 Q160 152 135 140', N), C(132, 138, 8, O),
      P('M200 192 Q205 150 225 135', N), C(228, 133, 8, O),
      C(185, 250, 62),
      ojo(165, 240), ojo(207, 240),
      sonrisa(186, 268, 12),
      mejilla(148, 266), mejilla(224, 266),
    ]],
    ['chinita', 'Chinita', 'la chinita', 'La chinita vuela, vuela', '#ff4d4d', '#3d2b3d', [
      P('M170 220 L118 198 M162 268 L108 270 M176 320 L124 348', N),
      P('M330 220 L382 198 M338 268 L392 270 M324 320 L376 348', N),
      P('M228 112 Q212 78 186 72', N), C(183, 71, 8, O),
      P('M272 112 Q288 78 314 72', N), C(317, 71, 8, O),
      E(250, 140, 62, 45, K('d')),
      C(250, 252, 105),
      P('M250 148 L250 356', N),
      C(206, 214, 20, F), C(294, 214, 20, F), C(196, 286, 16, F), C(304, 286, 16, F),
      C(226, 330, 11, F), C(274, 330, 11, F),
      C(229, 122, 11, K('bl')), C(271, 122, 11, K('bl')),
      ojo(230, 124, 6), ojo(272, 124, 6),
    ]],
    ['caballo', 'Caballito', 'el caballito', 'El caballito hace iiih', '#c98b5e', '#6b4a3a', [
      P('M150 250 Q100 250 92 300 Q90 335 110 345 Q115 300 148 278Z', K('d')),
      P('M300 250 Q305 170 345 100 L390 125 Q362 200 355 262Z'),
      R(160, 290, 26, 86, 10), R(200, 295, 26, 81, 10), R(290, 295, 26, 81, 10), R(330, 290, 26, 86, 10),
      R(160, 362, 26, 16, 5, K('d')), R(200, 362, 26, 16, 5, K('d')), R(290, 362, 26, 16, 5, K('d')), R(330, 362, 26, 16, 5, K('d')),
      E(250, 265, 110, 55),
      P('M342 80 Q298 115 296 175 Q292 215 296 250 L312 250 Q312 200 326 150 Q336 115 360 92Z', K('d')),
      P('M350 85 L352 50 L375 78Z'),
      E(380, 112, 52, 34, '', 28),
      E(422, 140, 28, 22, K('crema')),
      ojo(372, 104, 9),
      C(432, 138, 3.5, O),
      P('M416 152 Q427 158 438 150', N),
    ]],
    ['estrella', 'Estrella de mar', 'la estrellita de mar', 'La estrellita de mar vive en el mar', '#ff9a5c', '#ffd0a8', [
      estrellaMar(250, 215, 190, 78),
      C(250, 100, 9, F), C(355, 178, 9, F), C(316, 302, 9, F), C(184, 302, 9, F), C(145, 178, 9, F),
      ojo(228, 205), ojo(272, 205),
      sonrisa(250, 232, 14),
      mejilla(210, 236, 10), mejilla(290, 236, 10),
    ]],
  ];

  window.ANIMALES = lista.map(([id, nombre, conArticulo, sonido, c1, c2, partes, mover]) =>
    ({ id, nombre, conArticulo, sonido, c1, c2, svg: svg(partes.join(''), mover) }));
  window.PLANTILLAS = window.ANIMALES.map(({ id, nombre, svg }) => ({ id, nombre, svg }));
  window.PLANTILLAS.push({ id: 'blanco', nombre: 'Hoja en blanco', svg: '' });
})();
