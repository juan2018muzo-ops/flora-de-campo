/*
 * Ilustraciones SVG de los términos morfológicos, generadas por código para que
 * todas compartan el mismo estilo: trazo negro uniforme, sin rellenos de color.
 *
 * Una hoja se arma con tres piezas por cada mitad (la izquierda es el reflejo):
 *   base   curva desde la inserción del pecíolo hasta el hombro (parte más ancha)
 *   cuerpo tramo recto (u opcionalmente estrechado) entre dos hombros
 *   ápice  curva desde el hombro hasta la punta
 * Las curvas de BASES y APICES se escriben en coordenadas normalizadas:
 *   u = 0 en el nervio medio, 1 en el hombro;  v = 0 al inicio del tramo, 1 al final.
 *
 * Ilustraciones.svg(idTermino) devuelve el SVG o null si aún no tiene dibujo.
 */

const Ilustraciones = (function () {
  const CX = 50;
  const r = n => Math.round(n * 100) / 100;

  // --- Piezas ---------------------------------------------------------------------

  const BASES = {
    cuneada:    { segs: [["L", [0.5, 0.55]], ["C", [0.75, 0.82], [1, 0.9], [1, 1]]] },
    aguda:      { segs: [["C", [0.35, 0.3], [1, 0.5], [1, 1]]] },
    redondeada: { segs: [["C", [0.55, 0], [1, 0.45], [1, 1]]] },
    truncada:   { segs: [["L", [0.72, 0]], ["C", [1, 0], [1, 0.3], [1, 1]]] },
    cordada:    { inicio: [0, 0.2], segs: [["C", [0.1, 0.02], [0.3, -0.1], [0.55, -0.08]], ["C", [0.95, -0.05], [1, 0.5], [1, 1]]] },
    reniforme:  { inicio: [0, 0.55], segs: [["C", [0.1, 0.05], [0.3, -0.15], [0.55, -0.12]], ["C", [0.9, -0.1], [1, 0.4], [1, 1]]] },
    hastada:    { inicio: [0, 0.3], segs: [["L", [1.75, 0.16]], ["L", [0.85, 0.5]], ["C", [0.97, 0.65], [1, 0.85], [1, 1]]] },
    sagitada:   { inicio: [0, 0.32], segs: [["L", [1.05, -0.38]], ["C", [1.15, 0.15], [1, 0.55], [1, 1]]] },
    linea:      { segs: [["L", [1, 1]]] },
    plana:      { segs: [["L", [1, 0]]] }
  };

  const APICES = {
    aguda:      { segs: [["C", [1, 0.45], [0.4, 0.75], [0, 1]]] },
    acuminada:  { segs: [["C", [1, 0.35], [0.5, 0.5], [0.28, 0.62]], ["C", [0.12, 0.7], [0.04, 0.85], [0, 1.12]]] },
    redondeada: { segs: [["C", [1, 0.55], [0.55, 1], [0, 1]]] },
    obtusa:     { segs: [["C", [1, 0.4], [0.72, 0.65], [0.45, 0.82]], ["L", [0, 1]]] },
    retusa:     { segs: [["C", [1, 0.55], [0.6, 0.98], [0.14, 0.98]], ["Q", [0.04, 0.98], [0, 0.92]]] },
    obcordada:  { segs: [["C", [1, 0.6], [0.85, 1.02], [0.5, 1.02]], ["C", [0.2, 1.02], [0.04, 0.9], [0, 0.76]]] },
    emarginada: { segs: [["C", [1, 0.55], [0.6, 1], [0.24, 1]], ["Q", [0.06, 1], [0, 0.84]]] },
    cuspidada:  { segs: [["C", [1, 0.55], [0.55, 0.85], [0.14, 0.88]], ["L", [0, 1.14]]] },
    mucronada:  { segs: [["C", [1, 0.55], [0.6, 0.97], [0.06, 0.97]], ["L", [0, 1.07]]] },
    truncada:   { segs: [["C", [1, 0.5], [1, 1], [0.72, 1]], ["L", [0, 1]]] },
    atenuada:   { segs: [["C", [1, 0.3], [0.35, 0.5], [0, 1.1]]] },
    linea:      { segs: [["L", [0, 1]]] },
    plana:      { segs: [["L", [0, 0]]] }
  };

  /*
   * Dibuja una hoja simple. Opciones:
   *   W ancho de media hoja; yB inserción; yS1, yS2 hombros inferior y superior; yT punta
   *   base, apice: claves de BASES y APICES; cintura: estrecha el cuerpo (0..1)
   *   peciolo (largo, 0 = sin pecíolo), nervio (true/false)
   * Devuelve { trazos, inicio, punta } (trazos = SVG interno).
   */
  function hoja(o) {
    const op = Object.assign({ yB: 92, yT: 8, peciolo: 7, nervio: true }, o);
    const { W, yB, yS1, yS2, yT } = op;
    const hB = yB - yS1, hA = yS2 - yT;
    const B = BASES[op.base], A = APICES[op.apice];
    const pb = p => [W * p[0], yB - p[1] * hB];
    const pa = p => [W * p[0], yS2 - p[1] * hA];

    const inicio = pb(B.inicio || [0, 0]);
    const segs = B.segs.map(s => [s[0]].concat(s.slice(1).map(pb)));
    if (yS1 !== yS2) {
      if (op.cintura) {
        const d = (yS1 - yS2) * 0.25;
        segs.push(["C", [W * op.cintura, yS1 - d], [W * op.cintura, yS2 + d], [W, yS2]]);
      } else {
        segs.push(["L", [W, yS2]]);
      }
    }
    A.segs.forEach(s => segs.push([s[0]].concat(s.slice(1).map(pa))));
    const ultimo = segs[segs.length - 1];
    const punta = ultimo[ultimo.length - 1];

    const mitad = signo => `M${r(CX + signo * inicio[0])} ${r(inicio[1])} ` +
      segs.map(s => s[0] + s.slice(1).map(p => `${r(CX + signo * p[0])} ${r(p[1])}`).join(" ")).join(" ");

    let trazos = `<path class="contorno" d="${mitad(1)}"/><path class="contorno" d="${mitad(-1)}"/>`;
    if (op.nervio) trazos += `<path class="nervio" d="M${CX} ${r(inicio[1])} L${CX} ${r(punta[1])}"/>`;
    if (op.peciolo) trazos += `<path class="contorno" d="M${CX} ${r(inicio[1])} L${CX} ${r(Math.max(yB, inicio[1]) + op.peciolo)}"/>`;
    return { trazos, inicio, punta };
  }

  // El recorte evita que, en un recuadro de otra proporción, se vea lo que queda fuera del encuadre.
  function lienzo(viewBox, contenido) {
    const [x, y, w, h] = viewBox.split(" ");
    const id = "vb-" + viewBox.replace(/[^0-9]+/g, "-");
    return `<svg class="ilus" viewBox="${viewBox}" aria-hidden="true">` +
      `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>` +
      `<g clip-path="url(#${id})">${contenido}</g></svg>`;
  }

  // --- Dibujos especiales -------------------------------------------------------------

  function acicular() {
    // Dos acículas saliendo de una vaina basal (como en Pinus).
    const aguja = (x2, y2) => `<path class="contorno" d="M50 84 Q${r((50 + x2) / 2 + (x2 > 50 ? -3 : 3))} ${r((84 + y2) / 2)} ${x2} ${y2}"/>` +
      `<path class="contorno" d="M52 84 Q${r((52 + x2) / 2 + (x2 > 50 ? -2 : 4))} ${r((84 + y2) / 2)} ${x2} ${y2}"/>`;
    return lienzo("0 0 100 100",
      aguja(36, 6) + aguja(66, 8) +
      `<path class="contorno" d="M47 84 L47 94 Q51 97 55 94 L55 84 Z"/>`);
  }

  function escuamiforme() {
    // Ramita cubierta por hojitas en escama, imbricadas y pegadas al tallo.
    let d = "";
    for (let i = 0; i < 6; i++) {
      const y = 90 - i * 14;
      d += `<path class="contorno" d="M50 ${y} Q38 ${y - 4} 41 ${y - 15} Q46 ${y - 9} 50 ${y - 6} Q54 ${y - 9} 59 ${y - 15} Q62 ${y - 4} 50 ${y} Z"/>`;
      d += `<path class="nervio" d="M50 ${y} L50 ${y - 10}"/>`;
    }
    return lienzo("0 0 100 100", d);
  }

  function peltada(vista) {
    const h = hoja({ W: 40, yB: 90, yS1: 50, yS2: 50, yT: 10, base: "redondeada", apice: "redondeada", peciolo: 0, nervio: false });
    let rayos = "";
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + Math.PI / 8;
      rayos += `<path class="nervio" d="M50 50 L${r(50 + 33 * Math.cos(a))} ${r(50 + 33 * Math.sin(a))}"/>`;
    }
    const peciolo = `<path class="nervio discontinuo" d="M50 50 L50 90"/><path class="contorno" d="M50 90 L50 99"/><circle class="punto" cx="50" cy="50" r="2.2"/>`;
    return lienzo(vista || "0 0 100 100", h.trazos + rayos + peciolo);
  }

  // --- Márgenes (lote 4) -----------------------------------------------------------------
  // Hoja elíptica cuyo borde se desplaza según un patrón de dientes a lo largo del
  // contorno (s = distancia recorrida desde la base hacia el ápice). Se muestra
  // ampliada la mitad derecha para que los dientes se distingan.

  const MARGEN = { W: 28, alto: 42, cy: 50 };
  const VISTA_MARGEN = "47 18 46 64";
  const VISTA_MARGEN_COMPACTA = "65 31 24 24"; // solo un tramo del borde, para botones pequeños

  // Puntos del borde derecho con su distancia acumulada y normal hacia afuera.
  function bordeDerecho(n) {
    const { W, alto, cy } = MARGEN;
    const pts = [];
    let s = 0;
    for (let i = 0; i <= n; i++) {
      const t = Math.PI * i / n;
      const x = W * Math.sin(t), y = cy + alto * Math.cos(t);
      if (i) s += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y);
      const nx = alto * Math.sin(t), ny = W * Math.cos(t), m = Math.hypot(nx, ny) || 1;
      pts.push({ x, y, s, nx: nx / m, ny: ny / m });
    }
    return pts;
  }

  const diente = (fase, a, subida) => fase < subida ? a * fase / subida : a * (1 - fase) / (1 - subida);
  const fase = (s, p) => (s % p) / p;

  // Desplazamiento del borde (positivo hacia afuera) según el tipo de margen.
  const PATRON_MARGEN = {
    margen_entero:         () => 0,
    margen_serrulado:      s => diente(fase(s, 2.6), 1.1, 0.8),
    margen_aserrado:       s => diente(fase(s, 6), 2.6, 0.8),
    margen_doble_aserrado: s => diente(fase(s, 10), 3.4, 0.82) + (fase(s, 10) < 0.82 ? diente(fase(s, 10 * 0.82 / 3), 1.1, 0.75) : 0),
    margen_crenado:        s => 2.4 * Math.sin(Math.PI * fase(s, 6)),
    margen_dentado:        s => diente(fase(s, 6), 2.6, 0.5),
    margen_lobado:         (s, L) => 7 * Math.pow(Math.sin(Math.PI * fase(s, L / 4.2)), 0.6) - 7,
    margen_sinuado:        (s, L) => 2.6 * Math.sin(2 * Math.PI * s / (L / 4.5)),
    margen_inciso:         s => {
      const prof = [6.5, 3.5, 5.5, 2.5, 7, 4, 6, 3];
      const i = Math.floor(s / 9) % prof.length;
      return -prof[i] * Math.pow(1 - diente(fase(s, 9), 1, 0.65), 1.6);
    },
    margen_eroso:          s => {
      // Mellas irregulares de distinto ancho y profundidad, como roído.
      const ancho = [2.2, 3.8, 1.6, 4.4, 2.8, 1.9, 3.3];
      const prof = [1.6, 0.7, 2.1, 1.0, 1.8, 0.6, 1.3];
      let pos = s % 19.9, i = 0;
      while (pos > ancho[i]) { pos -= ancho[i]; i++; }
      return -prof[i] * Math.sin(Math.PI * pos / ancho[i]);
    },
    margen_ondulado:       () => 0
  };

  function margen(id, compacto) {
    const pts = bordeDerecho(500);
    const L = pts[pts.length - 1].s;
    const f = PATRON_MARGEN[id];
    // Los dientes se desvanecen cerca de la base y del ápice.
    const ventana = s => Math.min(1, s / (0.12 * L), (L - s) / (0.12 * L));
    const borde = pts.map(p => {
      const d = f(p.s, L) * ventana(p.s);
      return [p.x + p.nx * d, p.y + p.ny * d];
    });
    // Solo la mitad derecha: es la que se ve ampliada.
    let trazos = `<path class="contorno" d="M${borde.map(([x, y]) => `${r(CX + x)} ${r(y)}`).join(" L")}"/>` +
      `<path class="nervio" d="M${CX} ${MARGEN.cy + MARGEN.alto} L${CX} ${MARGEN.cy - MARGEN.alto}"/>`;
    if (id === "margen_ondulado") {
      // Borde que sube y baja fuera del plano: una línea fina que cruza el contorno.
      const onda = pts.filter(p => p.s > 0.12 * L && p.s < 0.88 * L)
        .map(p => { const d = 1.8 * Math.sin(2 * Math.PI * p.s / 7); return `${r(CX + p.x + p.nx * d)} ${r(p.y + p.ny * d)}`; });
      trazos += `<path class="nervio" d="M${onda.join(" L")}"/>`;
    }
    return lienzo(compacto ? VISTA_MARGEN_COMPACTA : VISTA_MARGEN, trazos);
  }

  // Curvatura del borde vista en corte transversal (haz arriba, envés abajo).
  function curvatura(tipo) {
    const extremos = {
      margen_plano: ["M8 30 L44 30", "M56 30 L92 30"],
      margen_revoluto: ["M44 30 L22 30 C10 30 7 40 13 44 C18 47 23 42 19 38", "M56 30 L78 30 C90 30 93 40 87 44 C82 47 77 42 81 38"],
      margen_involuto: ["M44 30 L22 30 C10 30 7 20 13 16 C18 13 23 18 19 22", "M56 30 L78 30 C90 30 93 20 87 16 C82 13 77 18 81 22"]
    }[tipo];
    return lienzo("0 4 100 52",
      `<path class="contorno" d="${extremos[0]}"/><path class="contorno" d="${extremos[1]}"/>` +
      `<path class="contorno" d="M44 30 Q50 39 56 30"/>` +
      `<text x="50" y="12">haz</text><text x="50" y="54">envés</text>`);
  }

  // --- Nervaduras (lote 5) -----------------------------------------------------------------
  // Cada dibujo combina un contorno y el recorrido de las venas que define el tipo.

  // Media anchura de una hoja elíptica (W, cy, alto) a la altura y.
  const anchoEn = (W, cy, alto, y) => W * Math.sqrt(Math.max(0, 1 - Math.pow((y - cy) / alto, 2)));
  const vena = (d, clase) => `<path class="${clase || "nervio"}" d="${d}"/>`;
  const espejo = (fn) => fn(1) + fn(-1);

  function nervadura(id) {
    const W = 26, cy = 50, alto = 42;
    const eliptica = o => hoja(Object.assign({ W, yS1: cy, yS2: cy, base: "redondeada", apice: "redondeada", nervio: false }, o)).trazos;
    const e = y => anchoEn(W, cy, alto, y);
    const medio = vena(`M50 92 L50 8`, "nervio grueso");
    let v = "";

    switch (id) {
      case "craspedodroma": // secundarias rectas que llegan al margen
        for (let i = 0; i < 7; i++) {
          const y0 = 82 - i * 10.5, y1 = y0 - 9;
          v += espejo(s => vena(`M50 ${r(y0)} Q${r(50 + s * e(y1) * 0.5)} ${r(y0 - 5)} ${r(50 + s * e(y1))} ${r(y1)}`));
        }
        return lienzo("0 0 100 100", eliptica() + medio + v);

      case "camptodroma": // secundarias que se arquean y terminan antes del margen
        for (let i = 0; i < 7; i++) {
          const y0 = 82 - i * 10.5;
          v += espejo(s => vena(`M50 ${r(y0)} C${r(50 + s * e(y0) * 0.5)} ${r(y0 - 2)} ${r(50 + s * e(y0 - 6) * 0.86)} ${r(y0 - 6)} ${r(50 + s * e(y0 - 15) * 0.8)} ${r(y0 - 15)}`));
        }
        return lienzo("0 0 100 100", eliptica() + medio + v);

      case "hifodroma": // solo la vena media
        return lienzo("0 0 100 100", eliptica() + vena("M50 92 L50 8", "nervio muy-grueso"));

      case "paralelodroma": { // varias primarias paralelas desde la base, convergen en el ápice
        const contorno = hoja({ W: 17, yS1: 50, yS2: 50, base: "aguda", apice: "aguda", nervio: false }).trazos;
        [1, 2].forEach(k => { v += espejo(s => vena(`M50 92 C${50 + s * k * 6} 72 ${50 + s * k * 6} 30 50 8`)); });
        return lienzo("0 0 100 100", contorno + medio + v);
      }

      case "campilodroma": { // arcos recurvos que nacen en un punto y convergen en el ápice
        const contorno = hoja({ W: 32, yS1: 58, yS2: 58, base: "redondeada", apice: "aguda", nervio: false }).trazos;
        [1, 2, 3].forEach(k => { v += espejo(s => vena(`M50 92 C${50 + s * k * 10} 92 ${50 + s * k * 9.5} 30 50 8`)); });
        return lienzo("0 0 100 100", contorno + medio + v);
      }

      case "acrodroma": // pocas primarias en arcos no recurvos hacia el ápice
        v += espejo(s => vena(`M50 90 C${50 + s * 12} 72 ${50 + s * 22} 40 50 10`, "nervio medio-grueso"));
        return lienzo("0 0 100 100", eliptica() + medio + v);

      case "actinodroma": { // tres o más venas que salen radialmente de un punto
        const contorno = hoja({ W: 38, yB: 88, yS1: 56, yS2: 56, yT: 14, base: "cordada", apice: "aguda", nervio: false });
        const [, yi] = contorno.inicio;
        [[0, 16], [24, 26], [36, 50], [34, 74]].forEach(([dx, y], i) => {
          v += i === 0 ? vena(`M50 ${r(yi)} L50 ${y}`, "nervio grueso")
            : espejo(s => vena(`M50 ${r(yi)} L${50 + s * dx} ${y}`, "nervio grueso"));
        });
        return lienzo("0 0 100 100", contorno.trazos + v);
      }

      case "palinactinodroma": { // primarias que se ramifican dicotómicamente; las basales muy abiertas
        const contorno = hoja({ W: 38, yB: 88, yS1: 56, yS2: 56, yT: 14, base: "truncada", apice: "aguda", nervio: false });
        const yi = 88;
        v += vena(`M50 ${yi} L50 16`, "nervio grueso");
        v += espejo(s => vena(`M50 ${yi} L${50 + s * 22} 40`, "nervio grueso") +
          vena(`M${50 + s * 11} 64 L${50 + s * 33} 54`) + vena(`M${50 + s * 22} 40 L${50 + s * 20} 25`) + vena(`M${50 + s * 22} 40 L${50 + s * 33} 37`) +
          vena(`M${50 + s * 5} 82 L${50 + s * 34} 80`, "nervio grueso") + vena(`M${50 + s * 22} 81 L${50 + s * 36} 70`));
        return lienzo("0 0 100 100", contorno.trazos + v);
      }

      case "dicotomica_abierta": { // abanico (Ginkgo): venas que se bifurcan y terminan libres
        const base = [50, 94], R = 84, ang = 58 * Math.PI / 180;
        const punto = (a, rad) => [base[0] + rad * Math.sin(a), base[1] - rad * Math.cos(a)];
        const borde = `M${r(punto(-ang, R)[0])} ${r(punto(-ang, R)[1])} A${R} ${R} 0 0 1 ${r(punto(ang, R)[0])} ${r(punto(ang, R)[1])}`;
        const contorno = `<path class="contorno" d="M50 94 L${r(punto(-ang, R)[0])} ${r(punto(-ang, R)[1])}"/><path class="contorno" d="M50 94 L${r(punto(ang, R)[0])} ${r(punto(ang, R)[1])}"/><path class="contorno" d="${borde}"/>`;
        const radios = [6, 26, 46, 64, R - 1];
        const rama = (a1, a2, nivel) => {
          if (nivel === 4) return "";
          const am = (a1 + a2) / 2;
          const desde = punto(am, radios[nivel]);
          return [[a1, am], [am, a2]].map(([b1, b2]) => {
            const hasta = punto((b1 + b2) / 2, radios[nivel + 1]);
            return vena(`M${r(desde[0])} ${r(desde[1])} L${r(hasta[0])} ${r(hasta[1])}`) + rama(b1, b2, nivel + 1);
          }).join("");
        };
        return lienzo("0 0 100 100", contorno + vena("M50 94 L50 100", "contorno") + rama(-ang * 0.92, ang * 0.92, 0));
      }

      case "pinnati_paralelinervada": { // nervio medio grueso y muchas secundarias paralelas casi perpendiculares
        const contorno = hoja({ W: 20, yB: 94, yS1: 76, yS2: 24, yT: 6, base: "redondeada", apice: "redondeada", nervio: false }).trazos;
        for (let y = 80; y >= 20; y -= 3.4) {
          v += espejo(s => vena(`M${50 + s * 1.5} ${r(y)} Q${50 + s * 10} ${r(y - 0.5)} ${50 + s * 19} ${r(y - 2.5)}`, "nervio fino"));
        }
        return lienzo("0 0 100 100", contorno + vena("M48.5 94 L48.5 6 M51.5 94 L51.5 6", "nervio") + v);
      }
    }
    return null;
  }

  // --- Piezas para estructuras (lotes 6 a 8) -------------------------------------------

  const P = (d, clase) => `<path class="${clase || "contorno"}" d="${d}"/>`;
  const rad = a => a * Math.PI / 180;
  // Punto a `largo` unidades de (x, y) en la dirección `ang` (grados desde la vertical, horario).
  const dir = (x, y, ang, largo) => [r(x + Math.sin(rad(ang)) * largo), r(y - Math.cos(rad(ang)) * largo)];

  // Folíolo o lámina pequeña cuya base queda en (x, y), orientada según `ang`.
  function folio(x, y, ang, esc, o) {
    const forma = Object.assign({ W: 14, yS1: 55, yS2: 55, base: "aguda", apice: "aguda", peciolo: 0 }, o);
    return `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(ang)}) scale(${esc}) translate(-50 -92)">${hoja(forma).trazos}</g>`;
  }

  // Hoja compuesta pinnada: raquis desde (x, y) y `pares` de folíolos (+ terminal).
  function pinnada(x, y, ang, largo, pares, o) {
    const op = Object.assign({ terminal: true, esc: 0.22, abrir: 58, peciolo: 0.22 }, o);
    // Folíolos muy pequeños se dibujan como un trazo, para que no se vuelvan manchas.
    const fol = (fx, fy, fa) => op.esc < 0.1
      ? (([ex, ey]) => P(`M${fx} ${fy} L${ex} ${ey}`, "nervio"))(dir(fx, fy, fa, 84 * op.esc * 0.8))
      : folio(fx, fy, fa, op.esc);
    const fin = dir(x, y, ang, largo);
    let s = P(`M${x} ${y} L${fin[0]} ${fin[1]}`, op.esc < 0.1 ? "nervio" : "contorno");
    for (let i = 0; i < pares; i++) {
      const t = op.peciolo + (1 - op.peciolo - 0.08) * (i + 0.5) / pares;
      const [px, py] = dir(x, y, ang, largo * t);
      s += fol(px, py, ang + op.abrir) + fol(px, py, ang - op.abrir);
    }
    if (op.terminal) s += fol(fin[0], fin[1], ang);
    return s;
  }

  // Hoja pinnada de grado n (1 = una vez pinnada, 2 = bipinnada…), en esquema.
  function pinnadaGrado(x, y, ang, largo, grado, esc) {
    // Menos pinnas cuanto más pequeñas, para que el esquema se siga leyendo.
    if (grado === 1) return pinnada(x, y, ang, largo, esc < 0.1 ? 2 : 3, { esc, peciolo: 0.1 });
    const pares = grado >= 3 || esc < 0.15 ? 2 : 3;
    const fin = dir(x, y, ang, largo * 0.72);
    let s = P(`M${x} ${y} L${fin[0]} ${fin[1]}`);
    for (let i = 0; i < pares; i++) {
      const [px, py] = dir(x, y, ang, largo * (0.16 + 0.56 * i / pares));
      [1, -1].forEach(lado => { s += pinnadaGrado(px, py, ang + lado * 62, largo * 0.4, grado - 1, esc * 0.62); });
    }
    return s + pinnadaGrado(fin[0], fin[1], ang, largo * 0.34, grado - 1, esc * 0.62);
  }

  // Lámina simple dividida en lóbulos. prof: fracción de la distancia borde-nervio que corta la incisión.
  function lobulada(prof, disposicion) {
    let trazos = "", guia = "";
    if (disposicion === "palmada") {
      const cx = 50, cy = 60, R = 36, n = 5;
      const radio = th => {
        const u = (th + 150) / 300;
        return R * ((1 - prof) + prof * Math.pow(Math.abs(Math.sin(Math.PI * n * u)), 0.7));
      };
      const pts = [];
      for (let th = -150; th <= 150; th += 1) pts.push(dir(cx, cy, th, radio(th)));
      trazos = P(`M${cx} ${cy + 6} L${pts.map(p => p.join(" ")).join(" L")} Z`);
      [-120, -60, 0, 60, 120].forEach(th => { const p = dir(cx, cy, th, R * 0.95); trazos += P(`M${cx} ${cy} L${p[0]} ${p[1]}`, "nervio"); });
      guia = `<circle class="nervio discontinuo" cx="${cx}" cy="${cy}" r="${R / 2}"/>`;
      return lienzo("0 0 100 100", trazos + guia + P(`M${cx} ${cy + 6} L${cx} 99`));
    }
    const der = [], izq = [], g1 = [], g2 = [];
    for (let i = 0; i <= 300; i++) {
      const t = i / 300, y = 92 - 84 * t;
      const env = 30 * Math.pow(Math.sin(Math.PI * t), 0.75);
      const sv = Math.abs(Math.sin(Math.PI * 4 * t));
      const w = env * ((1 - prof) + prof * Math.pow(sv, 0.7));
      der.push(`${r(50 + w)} ${r(y)}`); izq.push(`${r(50 - w)} ${r(y)}`);
      g1.push(`${r(50 + env / 2)} ${r(y)}`); g2.push(`${r(50 - env / 2)} ${r(y)}`);
    }
    trazos = P("M" + der.join(" L")) + P("M" + izq.join(" L")) + P("M50 92 L50 8", "nervio");
    if (prof > 0) guia = P("M" + g1.join(" L"), "nervio discontinuo") + P("M" + g2.join(" L"), "nervio discontinuo");
    return lienzo("0 0 100 100", trazos + guia + P("M50 92 L50 99"));
  }

  // Tallo vertical con un nudo; yema axilar opcional.
  const yema = (x, y, ang) => `<ellipse class="contorno" cx="${x}" cy="${y}" rx="2" ry="3.4" transform="rotate(${ang} ${x} ${y})"/>`;

  // --- Organización de la hoja (lote 6) ---------------------------------------------------

  function organizacion(id) {
    const tallo = P("M20 100 L20 2");
    switch (id) {
      case "simple": // una lámina; la yema axilar está en la base del pecíolo
        return lienzo("0 0 100 100", tallo + P("M20 66 L34 52") + folio(34, 52, 45, 0.62, { W: 22, base: "redondeada" }) + yema(26, 58, 30));
      case "compuesta": // varios folíolos; la yema axilar solo en la base del pecíolo común
        return lienzo("0 0 100 100", tallo + P("M20 74 L28 66") + pinnada(28, 66, 45, 62, 3, { esc: 0.2, peciolo: 0.12 }) + yema(25, 63, 30));
      case "entera": return lobulada(0);
      case "fida": return lobulada(0.32);
      case "partida": return lobulada(0.68);
      case "secta": return lobulada(0.93);
      case "pinnada": return lobulada(0.68);
      case "palmada": return lobulada(0.68, "palmada");
      case "unifoliolada": // un folíolo articulado con el pecíolo (la articulación se marca)
        return lienzo("0 0 100 100", P("M50 99 L50 64") + P("M46 66 L54 66", "nervio") + folio(50, 64, 0, 0.66, { W: 22 }));
      case "bifoliolada":
        return lienzo("0 0 100 100", P("M50 99 L50 58") + folio(50, 58, -32, 0.6, { W: 18 }) + folio(50, 58, 32, 0.6, { W: 18 }));
      case "trifoliolada":
        return lienzo("0 0 100 100", P("M50 99 L50 56") + folio(50, 56, 0, 0.52, { W: 20 }) + folio(50, 60, -62, 0.46, { W: 20 }) + folio(50, 60, 62, 0.46, { W: 20 }));
      case "pinnada_comp":
        return lienzo("0 0 100 100", pinnada(50, 99, 0, 82, 3, { esc: 0.27 }));
      case "palmaticompuesta":
        return lienzo("0 0 100 100", P("M50 99 L50 60") + [-84, -42, 0, 42, 84].map(a => folio(50, 60, a, 0.42, { W: 14 })).join(""));
      case "unipinnada":
        return lienzo("0 0 100 100", pinnadaGrado(50, 99, 0, 92, 1, 0.24));
      case "bipinnada":
        return lienzo("0 0 100 100", pinnadaGrado(50, 99, 0, 96, 2, 0.2));
      case "tripinnada":
        return lienzo("0 0 100 100", pinnadaGrado(50, 99, 0, 94, 3, 0.2));
      case "cuadripinnada":
        return lienzo("0 0 100 100", pinnadaGrado(50, 99, 0, 96, 4, 0.2));
      case "paripinnada": // termina sin folíolo terminal
        return lienzo("0 0 100 100", pinnada(50, 99, 0, 86, 4, { terminal: false, esc: 0.24 }));
      case "imparipinnada": // termina en un folíolo
        return lienzo("0 0 100 100", pinnada(50, 99, 0, 74, 3, { esc: 0.24 }));
    }
    return null;
  }

  // --- Filotaxis (lote 7) ------------------------------------------------------------------
  // Tallo visto de lado. Hoja de perfil: pecíolo + lámina hacia un lado.
  // Hoja hacia el observador: lámina acortada y opaca sobre el tallo.
  // Hoja hacia atrás: contorno discontinuo detrás del tallo.

  const hojaLado = (y, lado) => {
    const [px, py] = dir(50, y, lado * 62, 7);
    return P(`M50 ${y} L${px} ${py}`) + folio(px, py, lado * 62, 0.3, { W: 18 });
  };
  const hojaFrente = y => `<ellipse class="contorno tapa" cx="50" cy="${y + 9}" rx="6.5" ry="9"/>` + P(`M50 ${y + 1} L50 ${y + 17}`, "nervio");
  const hojaAtras = y => `<ellipse class="contorno discontinuo" cx="50" cy="${y - 8}" rx="5.5" ry="8"/>`;
  const nudo = y => P(`M47 ${y} L53 ${y}`, "nervio");

  function filotaxis(id) {
    const tallo = P("M50 100 L50 2");
    let s = "";
    switch (id) {
      case "alterna_disticha": // una hoja por nudo, alternando en un mismo plano
        [84, 64, 44, 24].forEach((y, i) => { s += hojaLado(y, i % 2 ? -1 : 1) + nudo(y); });
        return lienzo("0 0 100 100", tallo + s);
      case "alterna_helicoidal": { // una hoja por nudo, girando en espiral
        const ys = [88, 72, 56, 40, 24];
        ys.forEach((y, i) => {
          const k = i % 4;
          s += k === 0 ? hojaLado(y, 1) : k === 2 ? hojaLado(y, -1) : k === 3 ? hojaAtras(y) : "";
          s += nudo(y);
        });
        let espiral = "M50 88";
        for (let y = 88; y >= 24; y -= 2) espiral += ` L${r(50 + 5 * Math.sin(Math.PI * (88 - y) / 32))} ${y}`;
        s = P(espiral, "nervio discontinuo") + s;
        return lienzo("0 0 100 100", tallo + s + hojaFrente(72));
      }
      case "opuesta_decusada": // dos hojas por nudo; cada par en cruz con el siguiente
        s = hojaLado(80, 1) + hojaLado(80, -1) + hojaAtras(52) + hojaLado(24, 1) + hojaLado(24, -1);
        return lienzo("0 0 100 100", tallo + s + hojaFrente(52) + nudo(80) + nudo(52) + nudo(24));
      case "verticilada": // tres o más hojas por nudo
        s = hojaLado(74, 1) + hojaLado(74, -1) + hojaAtras(74) + hojaLado(34, 1) + hojaLado(34, -1) + hojaAtras(34);
        return lienzo("0 0 100 100", tallo + s + hojaFrente(74) + hojaFrente(34));
      case "caulinar": // hojas a lo largo del tallo aéreo
        [80, 62, 44, 26].forEach((y, i) => { s += hojaLado(y, i % 2 ? -1 : 1); });
        return lienzo("0 0 100 100", P("M50 92 L50 6") + s + P("M12 92 L88 92", "nervio"));
      case "radical": { // hojas agrupadas en la base; tallo floral sin hojas
        [-70, -40, -14, 14, 40, 70].forEach(a => { s += folio(50, 90, a, 0.42, { W: 16, base: "cuneada" }); });
        return lienzo("0 0 100 100", P("M50 90 L50 10") + `<circle class="contorno" cx="50" cy="8" r="4"/>` + s + P("M12 92 L88 92", "nervio"));
      }
    }
    return null;
  }

  // --- Pecíolo, vaina, lígula y estípulas (lote 8) ----------------------------------------

  // Vista acercada al nudo, para que las estípulas se distingan.
  const VISTA_NUDO = "6 38 54 54";
  const estipula = (x, y, ang, esc) => folio(x, y, ang, esc || 0.14, { W: 22, base: "redondeada", apice: "aguda" });

  function peciolo(id) {
    const tallo = P("M30 100 L30 2");
    const nodo = 70;
    const conPeciolo = (extra) => {
      const [px, py] = dir(30, nodo, 50, 20);
      return tallo + P(`M30 ${nodo} L${px} ${py}`) + folio(px, py, 50, 0.5, { W: 22 }) + (extra || "");
    };
    switch (id) {
      case "peciolada":
        return lienzo("0 0 100 100", conPeciolo());
      case "sesil":
      case "sesil_simple":
        return lienzo("0 0 100 100", tallo + folio(30, nodo, 55, 0.62, { W: 20, base: "cuneada" }));
      case "abrazadora": // la base del limbo rodea el tallo (un lóbulo por delante, otro por detrás)
        return lienzo("0 0 100 100", tallo +
          P(`M30 ${nodo + 6} C22 ${nodo + 8} 20 ${nodo - 2} 30 ${nodo - 6}`, "contorno discontinuo") +
          folio(30, nodo, 62, 0.62, { W: 22, base: "cordada" }) +
          P(`M30 ${nodo + 6} C38 ${nodo + 10} 42 ${nodo + 2} 38 ${nodo - 4}`, "contorno tapa"));
      case "connada": // dos hojas opuestas soldadas por la base alrededor del tallo
        return lienzo("0 0 100 100", P("M50 100 L50 2") +
          folio(50, 60, 68, 0.58, { W: 20, base: "redondeada" }) + folio(50, 60, -68, 0.58, { W: 20, base: "redondeada" }) +
          `<path class="contorno tapa" d="M38 56 C42 66 58 66 62 56 C58 62 42 62 38 56 Z"/>`);
      case "perfoliada": // el tallo atraviesa la lámina
        return lienzo("0 0 100 100", `<g>${hoja({ W: 34, yB: 84, yS1: 58, yS2: 58, yT: 14, base: "redondeada", apice: "aguda", peciolo: 0, nervio: false }).trazos}</g>` +
          P("M50 100 L50 84") + P("M50 36 L50 2") + `<ellipse class="contorno" cx="50" cy="58" rx="3.2" ry="2"/>` + P("M50 60 L50 82", "nervio discontinuo"));
      case "decurrente": // la base de la hoja se prolonga por el tallo en forma de alas
        return lienzo("0 0 100 100", tallo + folio(30, 58, 52, 0.6, { W: 20, base: "cuneada" }) +
          P("M31.5 58 C34 66 34 76 31.5 92") + P("M28.5 58 C26 66 26 76 28.5 92"));
      case "peciolo_cilindrico":
        return lienzo("0 0 100 100", `<circle class="contorno" cx="50" cy="48" r="16"/>` + `<text x="50" y="16">haz</text><text x="50" y="86">corte del pecíolo</text>`);
      case "peciolo_acanalado":
        return lienzo("0 0 100 100", P("M38 36 A16 16 0 1 0 62 36 Q56 34 54 40 Q50 46 46 40 Q44 34 38 36 Z") + `<text x="50" y="16">haz</text><text x="50" y="86">corte del pecíolo</text>`);
      case "peciolo_alado": // pecíolo ensanchado en un ala (Citrus), articulado con la lámina
        return lienzo("0 0 100 100", tallo + folio(30, nodo, 37, 0.35, { W: 18, base: "aguda", apice: "redondeada" }) +
          P("M44.5 48.5 L52 54", "nervio") + folio(48, 51, 37, 0.5, { W: 22 }));
      case "peciolo_inflado": // pecíolo hinchado (camalote)
        return lienzo("0 0 100 100", P("M50 100 L50 92") + P("M50 92 C38 84 38 62 48 54 L48 48") + P("M50 92 C62 84 62 62 52 54 L52 48") +
          folio(50, 48, 0, 0.45, { W: 34, base: "redondeada", apice: "redondeada" }));
      case "pulvino_t": // engrosamiento en la base del pecíolo
        return lienzo("0 0 100 100", tallo + `<ellipse class="contorno" cx="35.5" cy="${nodo - 4}" rx="4.5" ry="7.5" transform="rotate(50 35.5 ${nodo - 4})"/>` +
          P(`M33 ${nodo - 7} L38 ${nodo - 3} M34 ${nodo - 3} L37 ${nodo - 1}`, "nervio") +
          P(`M39 ${nodo - 9} L52 ${nodo - 24}`) + folio(52, nodo - 24, 50, 0.48, { W: 22 }));
      case "pulvinulo": // engrosamiento en la base de cada folíolo
        return lienzo("0 0 100 100", P("M50 99 L50 56") +
          [[0, 56], [-62, 60], [62, 60]].map(([a, y]) => {
            const [bx, by] = dir(50, y, a, 5);
            return `<ellipse class="contorno" cx="${r((50 + bx) / 2)}" cy="${r((y + by) / 2)}" rx="2.2" ry="3.6" transform="rotate(${a} ${r((50 + bx) / 2)} ${r((y + by) / 2)})"/>` + folio(bx, by, a, 0.44, { W: 20 });
          }).join(""));
      case "vaina_abierta":
      case "vaina_cerrada": { // la base de la hoja envuelve el tallo; abierta deja ver el borde que se superpone
        const abierta = id === "vaina_abierta";
        return lienzo("0 0 100 100",
          P("M46 100 L46 92 M54 100 L54 92") + P("M46 40 L46 2 M54 40 L54 2") +
          P("M42 92 L42 44 Q50 36 58 44 L58 92") + P("M42 92 Q50 96 58 92", "nervio") +
          (abierta ? P("M52 92 L52 46 Q55 42 58 44", "contorno") : `<ellipse class="contorno" cx="50" cy="42" rx="8" ry="3"/>`) +
          folio(57, 42, 38, 0.5, { W: 9, base: "aguda", apice: "aguda" }));
      }
      case "ligula": // apéndice membranoso entre la lámina y la vaina
        return lienzo("0 0 100 100",
          P("M44 100 L44 56 M56 100 L56 56") + P("M46 56 L46 2 M54 56 L54 2", "nervio") +
          P("M44 56 C47 46 53 46 56 56", "contorno") + P("M47 52 C48 44 52 44 53 52", "nervio") +
          P("M56 56 C64 44 76 30 90 20") + P("M56 62 C66 50 80 36 94 28") +
          `<text x="30" y="40">lígula</text>` + P("M36 42 L46 47", "nervio"));
      case "estipelas": // pequeñas estípulas en la base de los folíolos
        return lienzo("0 0 100 100", P("M50 99 L50 52") +
          folio(50, 52, 0, 0.5, { W: 20 }) + folio(50, 64, -64, 0.44, { W: 20 }) + folio(50, 64, 64, 0.44, { W: 20 }) +
          estipula(50, 52, -24, 0.07) + estipula(50, 52, 24, 0.07) + estipula(50, 64, -18, 0.06) + estipula(50, 64, 18, 0.06));
      // Disposición de las estípulas (nudo visto de lado; hoja hacia la derecha)
      case "estipulas_libres":
        return lienzo(VISTA_NUDO, conPeciolo(estipula(31, nodo, 20, 0.16) + estipula(31, nodo, 95, 0.16)));
      case "estipulas_adnatas":
        return lienzo(VISTA_NUDO, conPeciolo(P(`M31 ${nodo + 2} L40 ${nodo - 6} L38 ${nodo - 13}`) + P(`M30 ${nodo - 3} L33 ${nodo - 13} L36 ${nodo - 12}`)));
      case "estipulas_intrapeciolares":
        return lienzo(VISTA_NUDO, conPeciolo(P(`M31 ${nodo - 1} C31 ${nodo - 10} 33 ${nodo - 18} 35 ${nodo - 22} C37 ${nodo - 16} 37 ${nodo - 10} 36 ${nodo - 4}`)));
      case "estipulas_opositifolias":
        return lienzo(VISTA_NUDO, conPeciolo(P(`M30 ${nodo + 3} C22 ${nodo} 18 ${nodo - 8} 20 ${nodo - 16} C24 ${nodo - 10} 28 ${nodo - 6} 30 ${nodo - 5}`)));
      case "ocrea": // tubo que envuelve el tallo por encima del nudo
        return lienzo(VISTA_NUDO, conPeciolo(P(`M25 ${nodo} L25 ${nodo - 22} M35 ${nodo} L35 ${nodo - 22}`) +
          P(`M25 ${nodo - 22} L27 ${nodo - 25} L29 ${nodo - 22} L31 ${nodo - 25} L33 ${nodo - 22} L35 ${nodo - 25}`, "nervio")));
      case "estipulas_interpeciolares": { // hojas opuestas; estípulas entre los pecíolos
        const lado = l => { const [px, py] = dir(50, 64, l * 60, 12); return P(`M50 64 L${px} ${py}`) + folio(px, py, l * 60, 0.42, { W: 22 }); };
        return lienzo("22 34 56 56", P("M50 100 L50 2") + lado(1) + lado(-1) +
          `<path class="contorno tapa" d="M44 66 L50 50 L56 66 Z"/>`);
      }
      case "estipulas_capuchon": // capuchón que cubre la yema apical
        return lienzo("0 0 100 100", P("M50 100 L50 40") + P("M50 72 L64 60") + folio(64, 60, 50, 0.44, { W: 22 }) +
          P("M46 40 C46 24 49 12 50 6 C51 12 54 24 54 40 Z") + P("M46 76 L54 74", "nervio"));
      case "estipulas_pequenas":
        return lienzo(VISTA_NUDO, conPeciolo(estipula(31, nodo, 25, 0.08) + estipula(31, nodo, 95, 0.08)));
      case "estipulas_foliaceas": // estípulas grandes como hojas (arveja)
        return lienzo("0 0 100 100", P("M50 100 L50 2") + folio(50, 66, -70, 0.5, { W: 32, base: "redondeada" }) + folio(50, 66, 70, 0.5, { W: 32, base: "redondeada" }) +
          pinnada(50, 66, 25, 34, 1, { esc: 0.2, terminal: false }) + P("M58 34 C62 28 58 22 62 18", "nervio"));
      case "estipulas_compuestas":
        return lienzo(VISTA_NUDO, conPeciolo(pinnada(31, nodo, 120, 22, 2, { esc: 0.09, peciolo: 0.1 }) + pinnada(30, nodo, -15, 22, 2, { esc: 0.09, peciolo: 0.1 })));
      case "caducas": // la hoja sigue, pero sus estípulas ya cayeron: solo quedan cicatrices
        return lienzo(VISTA_NUDO, conPeciolo(
          `<g class="caido">${estipula(31, nodo, 20, 0.16)}${estipula(31, nodo, 95, 0.16)}</g>` +
          P(`M27 ${nodo - 1} L34 ${nodo - 1}`, "nervio")));
      case "persistentes": { // la hoja ya cayó (queda su cicatriz), pero las estípulas siguen
        const [px, py] = dir(30, 30, 50, 14);
        return lienzo("0 0 100 100", tallo + `<ellipse class="contorno" cx="33" cy="${nodo - 2}" rx="3" ry="1.6"/>` +
          estipula(31, nodo, 20, 0.16) + estipula(31, nodo, 95, 0.16) +
          P(`M30 30 L${px} ${py}`) + folio(px, py, 50, 0.32, { W: 22 }) + estipula(31, 30, 20, 0.12) + estipula(31, 30, 95, 0.12));
      }
    }
    return null;
  }

  // --- Formas de la lámina (lote 1) ---------------------------------------------------

  const FORMAS = {
    lanceolada:   { W: 11, yS1: 62, yS2: 62, base: "aguda", apice: "aguda" },
    hastada:      { W: 13, yB: 84, yS1: 56, yS2: 56, base: "hastada", apice: "aguda" },
    romboidal:    { W: 28, yS1: 50, yS2: 50, base: "linea", apice: "linea" },
    obromboidal:  { W: 28, yS1: 34, yS2: 34, base: "linea", apice: "linea" },
    eliptica:     { W: 24, yS1: 50, yS2: 50, base: "redondeada", apice: "redondeada" },
    oblonga:      { W: 17, yS1: 76, yS2: 24, base: "redondeada", apice: "redondeada" },
    triangular:   { W: 30, yB: 86, yS1: 86, yS2: 86, base: "plana", apice: "linea" },
    obtriangular: { W: 30, yS1: 12, yS2: 12, yT: 12, base: "linea", apice: "plana" },
    cordada:      { W: 30, yS1: 64, yS2: 64, base: "cordada", apice: "aguda" },
    obcordada:    { W: 28, yS1: 36, yS2: 36, base: "aguda", apice: "obcordada" },
    ovada:        { W: 28, yS1: 62, yS2: 62, base: "redondeada", apice: "aguda" },
    obovada:      { W: 28, yS1: 38, yS2: 38, base: "aguda", apice: "redondeada" },
    reniforme:    { W: 42, yB: 72, yS1: 56, yS2: 56, yT: 24, base: "reniforme", apice: "redondeada" },
    linear:       { W: 5, yB: 95, yS1: 80, yS2: 20, yT: 4, base: "aguda", apice: "aguda", peciolo: 3 },
    orbicular:    { W: 40, yB: 90, yS1: 50, yS2: 50, yT: 10, base: "redondeada", apice: "redondeada" },
    panduriforme: { W: 26, yS1: 70, yS2: 30, cintura: 0.74, base: "redondeada", apice: "redondeada" },
    cuneiforme:   { W: 30, yS1: 24, yS2: 24, base: "linea", apice: "redondeada" }
  };

  // --- Bases (lote 2): se muestra solo la mitad inferior de una hoja --------------------

  const VISTA_BASE = "0 38 100 70";
  const BASE_HOJA = { W: 28, yS1: 50, yS2: 50, apice: "aguda", peciolo: 10 };
  const DIBUJO_BASE = {
    base_cuneada: "cuneada", base_aguda: "aguda", base_redondeada: "redondeada", base_cordada: "cordada",
    base_truncada: "truncada", base_hastada: "hastada", base_sagitada: "sagitada"
  };

  // --- Ápices (lote 3): se muestra solo la mitad superior de una hoja -------------------

  const VISTA_APICE = "0 -2 100 62";
  const APICE_HOJA = { W: 28, yS1: 58, yS2: 58, base: "redondeada" };
  const DIBUJO_APICE = {
    apice_acuminado: "acuminada", apice_agudo: "aguda", apice_redondeado: "redondeada", apice_obtuso: "obtusa",
    apice_retuso: "retusa", apice_obcordado: "obcordada", apice_cuspidado: "cuspidada", apice_mucronado: "mucronada",
    apice_truncado: "truncada", apice_emarginado: "emarginada", apice_atenuado: "atenuada"
  };

  // Lotes de revisión (sección 7 del plan).
  const LOTES = [
    { id: 1, nombre: "Formas de la lámina", caracteres: ["forma"], estado: "aprobado" },
    { id: 2, nombre: "Bases", caracteres: ["base"], estado: "aprobado" },
    { id: 3, nombre: "Ápices", caracteres: ["apice"], estado: "aprobado" },
    { id: 4, nombre: "Márgenes", caracteres: ["margen", "margen_curvatura"], estado: "aprobado" },
    { id: 5, nombre: "Nervaduras", caracteres: ["nervadura"], estado: "aprobado" },
    { id: 6, nombre: "Organización de la hoja", caracteres: ["b_tipo", "b_division", "b_division_disposicion", "b_compuesta", "b_pinnada_grado", "b_pinnada_terminal"], estado: "en revisión" },
    { id: 7, nombre: "Filotaxis", caracteres: ["filotaxis", "posicion"], estado: "en revisión" },
    { id: 8, nombre: "Pecíolo y estípulas", caracteres: ["peciolo", "sesil_tipo", "peciolo_forma", "pulvino", "vaina", "ligula", "estipulas", "estipulas_forma", "estipulas_duracion", "estipelas"], estado: "en revisión" }
  ];

  // opciones.compacto: versión para botones pequeños (por ahora solo cambia en los márgenes).
  function svg(idTermino, opciones) {
    const compacto = !!(opciones && opciones.compacto);
    if (idTermino === "acicular") return acicular();
    if (idTermino === "escuamiforme") return escuamiforme();
    if (idTermino === "base_peltada") return peltada();
    if (PATRON_MARGEN[idTermino]) return margen(idTermino, compacto);
    if (["margen_plano", "margen_revoluto", "margen_involuto"].includes(idTermino)) return curvatura(idTermino);
    if (Morfologia.terminos[idTermino] && Morfologia.terminos[idTermino].caracter === "nervadura") return nervadura(idTermino);
    // Lotes 6 a 8: se elige por el carácter del término (o por el propio id en lígula y estipelas).
    const lote = loteDe(Morfologia.terminos[idTermino] ? Morfologia.terminos[idTermino].caracter : idTermino);
    if (lote && lote.id === 6) return organizacion(idTermino);
    if (lote && lote.id === 7) return filotaxis(idTermino);
    if (lote && lote.id === 8) return peciolo(idTermino);
    if (FORMAS[idTermino]) return lienzo("0 0 100 100", hoja(FORMAS[idTermino]).trazos);
    if (DIBUJO_BASE[idTermino]) {
      const b = DIBUJO_BASE[idTermino];
      const ancho = b === "hastada" || b === "sagitada" ? { W: 18 } : {};
      return lienzo(VISTA_BASE, hoja(Object.assign({}, BASE_HOJA, ancho, { base: b })).trazos);
    }
    if (DIBUJO_APICE[idTermino]) {
      return lienzo(VISTA_APICE, hoja(Object.assign({}, APICE_HOJA, { apice: DIBUJO_APICE[idTermino] })).trazos);
    }
    return null;
  }

  function loteDe(idCaracter) {
    return LOTES.find(l => l.caracteres.includes(idCaracter)) || null;
  }

  return { svg, loteDe, LOTES };
})();
