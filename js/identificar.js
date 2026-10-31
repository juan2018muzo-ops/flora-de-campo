/*
 * Pestaña Identificar: clave de acceso múltiple.
 *
 * El usuario marca, en cualquier orden, lo que observa en la planta. Cada carácter
 * marcado se compara con cada especie registrada:
 *   coincide       la especie tiene ese valor (o el mismo estado de ausencia)
 *   difiere        la especie lo tiene documentado con otro valor o en el estado contrario
 *   no comparable  la especie lo tiene como "no observado": no suma ni resta
 *
 * Porcentaje = coincidencias / rasgos comparables (coincidencias + discrepancias).
 * Es una coincidencia morfológica orientativa, no una probabilidad ni una identificación.
 */

const Identificar = (function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => App.escapar(s);

  const observado = {};          // lo que el usuario marcó (mismo formato que una especie)
  let ocultarDiscrepancias = false;
  let zona = "";
  let selector = null;
  let urls = [];

  // Pares que describen lo mismo en dos categorías (aclaración 8 del vocabulario):
  // si se marcan ambos, la forma de la lámina no se cuenta aparte.
  const EQUIVALENTES = { acicular: "gim_acicular", escuamiforme: "gim_escuamiforme" };

  // Caracteres marcados que se van a comparar.
  function caracteresMarcados() {
    const limpio = Morfologia.limpiar(observado);
    const forma = limpio.forma, gimno = limpio.b_gimno;
    if (forma && gimno && forma.estado === "presente" &&
        forma.valores.every(v => EQUIVALENTES[v] && gimno.valores.includes(EQUIVALENTES[v]))) {
      delete limpio.forma;
    }
    return limpio;
  }

  function evaluar(especie, marcados) {
    const reg = especie.caracteres || {};
    const r = { especie: especie, coincide: [], difiere: [], noComparable: [] };
    for (const id of Object.keys(marcados)) {
      const res = Morfologia.comparar(marcados[id], reg[id]);
      const item = { id: id, propio: marcados[id], suyo: reg[id] };
      if (res === "coincide") r.coincide.push(item);
      else if (res === "difiere") r.difiere.push(item);
      else r.noComparable.push(item);
    }
    r.comparables = r.coincide.length + r.difiere.length;
    r.porcentaje = r.comparables ? Math.round(100 * r.coincide.length / r.comparables) : null;
    return r;
  }

  function ordenar(a, b) {
    if (a.porcentaje === null && b.porcentaje !== null) return 1;
    if (b.porcentaje === null && a.porcentaje !== null) return -1;
    return (b.porcentaje || 0) - (a.porcentaje || 0) ||
      b.coincide.length - a.coincide.length ||
      a.difiere.length - b.difiere.length ||
      a.especie.nombreCientifico.localeCompare(b.especie.nombreCientifico, "es");
  }

  // --- Interfaz ---------------------------------------------------------------------

  function mostrar() {
    if (!selector) {
      $("#vista-identificar").innerHTML = `
        <h2>Identificar</h2>
        <p class="intro">Marque lo que observa en la planta, en el orden que quiera. Deje sin marcar lo que no pueda ver. La app compara con las especies registradas y las ordena por coincidencia.</p>
        <div class="barra-identificar">
          <label class="campo"><span>Zona climática (opcional)</span>
            <select id="filtro-zona">
              <option value="">Todas las zonas</option>
              ${Morfologia.caracteres.zona.terminos.map(t => `<option value="${t.id}">${esc(t.nombre)}</option>`).join("")}
            </select>
          </label>
          <button type="button" class="boton" id="nueva-identificacion">Nueva identificación</button>
        </div>
        <div id="identificar-caracteres" class="bloque"></div>
        <section id="resultados" class="resultados" aria-live="polite"></section>
        <a href="#resultados" class="resumen-flotante" id="resumen-flotante" hidden></a>`;
      selector = Selector.crear($("#identificar-caracteres"), observado, calcular);
      $("#filtro-zona").addEventListener("change", ev => { zona = ev.target.value; calcular(); });
      $("#nueva-identificacion").addEventListener("click", () => {
        Object.keys(observado).forEach(k => delete observado[k]);
        zona = "";
        $("#filtro-zona").value = "";
        selector.actualizar();
        $("#identificar-caracteres").querySelectorAll("details").forEach((d, i) => { d.open = i === 0; });
        calcular();
        window.scrollTo(0, 0);
        App.aviso("Selección borrada. Puede empezar una nueva identificación.");
      });
      $("#resumen-flotante").addEventListener("click", ev => {
        ev.preventDefault();
        $("#resultados").scrollIntoView({ behavior: "smooth" });
      });
    }
    calcular();
  }

  async function calcular() {
    urls.forEach(u => URL.revokeObjectURL(u));
    urls = [];
    const [especies, estaciones] = await Promise.all([DB.listar("especies"), DB.listar("estaciones")]);
    const zonaDe = new Map(estaciones.map(s => [s.id, s.zona || ""]));
    const marcados = caracteresMarcados();
    const nMarcados = Object.keys(marcados).length;
    const cont = $("#resultados");
    const flotante = $("#resumen-flotante");

    if (!especies.length) {
      cont.innerHTML = `<h3>Resultados</h3><div class="vacio"><p>No hay especies registradas con las cuales comparar.</p><a class="boton primario" href="#registrar">Registrar una especie</a></div>`;
      flotante.hidden = true;
      return;
    }

    const enZona = zona ? especies.filter(e => zonaDe.get(e.estacionId) === zona) : especies;
    const fueraDeZona = especies.length - enZona.length;
    const avisoZona = zona
      ? `<p class="nota">Solo especies de estaciones en zona <strong>${esc(Morfologia.nombreTermino(zona))}</strong>. ${fueraDeZona} especie(s) quedan fuera, incluidas las que no tienen zona registrada.</p>`
      : "";

    if (!nMarcados) {
      cont.innerHTML = `<h3>Resultados</h3>${avisoZona}<p class="nota">Marque al menos una característica para comparar con las ${enZona.length} especies registradas.</p>`;
      flotante.hidden = true;
      return;
    }

    let resultados = enZona.map(e => evaluar(e, marcados)).sort(ordenar);
    const conDiscrepancias = resultados.filter(r => r.difiere.length).length;
    if (ocultarDiscrepancias) resultados = resultados.filter(r => !r.difiere.length);

    const filas = [];
    for (const r of resultados) filas.push(await tarjeta(r, nMarcados));

    cont.innerHTML = `
      <h3>Resultados</h3>
      <div class="advertencia">
        <strong>Coincidencia morfológica orientativa.</strong>
        No es una identificación científica ni una probabilidad: solo indica qué tanto se parecen los rasgos marcados a los registrados en cada especie. Confirme con claves taxonómicas, literatura o un especialista.
      </div>
      ${avisoZona}
      <p class="nota">Rasgos marcados: <strong>${nMarcados}</strong>. Porcentaje = coincidencias ÷ rasgos comparables. Un rasgo es comparable cuando la especie lo tiene registrado (presente o ausente). Lo que la especie tiene como <em>no observado</em> no suma ni resta.</p>
      <label class="interruptor"><input type="checkbox" id="ocultar-discrepancias" ${ocultarDiscrepancias ? "checked" : ""}> Ocultar especies con discrepancias (${conDiscrepancias})</label>
      ${filas.length ? `<ol class="lista-resultados">${filas.join("")}</ol>` : `<p class="nota">Ninguna especie queda sin discrepancias. Desactive el filtro para ver las más parecidas.</p>`}`;

    $("#ocultar-discrepancias").addEventListener("change", ev => { ocultarDiscrepancias = ev.target.checked; calcular(); });

    const mejor = resultados.find(r => r.porcentaje !== null);
    const rasgos = `${nMarcados} rasgo${nMarcados > 1 ? "s" : ""}`;
    flotante.hidden = false;
    flotante.innerHTML = (!mejor
      ? `<span>${rasgos} · Sin datos comparables</span>`
      : mejor.porcentaje === 0
        ? `<span>${rasgos} · Ninguna coincide todavía</span>`
        : `<span>${rasgos} · Más parecida: <em>${esc(mejor.especie.nombreCientifico)}</em> ${mejor.porcentaje} %</span>`) +
      `<span class="ir">Ver ↓</span>`;
  }

  function lineaRasgo(item, clase) {
    const c = Morfologia.caracteres[item.id];
    const suyo = Morfologia.texto(c, item.suyo);
    return `<li class="${clase}"><span class="rasgo-nombre">${esc(c.nombre)}</span>: usted marcó <strong>${esc(Morfologia.texto(c, item.propio))}</strong>; registrado: <strong>${esc(suyo)}</strong></li>`;
  }

  async function tarjeta(r, nMarcados) {
    const e = r.especie;
    let img = "";
    if (e.fotoPrincipalId) {
      const f = await DB.obtener("fotos", e.fotoPrincipalId);
      if (f && f.blob) { const u = URL.createObjectURL(f.blob); urls.push(u); img = `<img src="${u}" alt="" loading="lazy">`; }
    }
    const pct = r.porcentaje === null ? "—" : r.porcentaje + " %";
    const explicacion = r.porcentaje === null
      ? `Ninguno de los ${nMarcados} rasgos marcados está registrado en esta especie: no se puede comparar.`
      : `${r.porcentaje} % = ${r.coincide.length} coincidencia${r.coincide.length === 1 ? "" : "s"} de ${r.comparables} rasgo${r.comparables === 1 ? "" : "s"} comparable${r.comparables === 1 ? "" : "s"}.` +
        (r.noComparable.length ? ` ${r.noComparable.length} rasgo${r.noComparable.length === 1 ? "" : "s"} marcado${r.noComparable.length === 1 ? "" : "s"} no se ${r.noComparable.length === 1 ? "pudo" : "pudieron"} comparar porque la especie no lo${r.noComparable.length === 1 ? "" : "s"} tiene registrado${r.noComparable.length === 1 ? "" : "s"}.` : "");
    return `
      <li class="resultado ${r.difiere.length ? "con-discrepancias" : ""}">
        <div class="resultado-cabecera">
          <div class="miniatura">${img || '<span class="sin-foto">Sin foto</span>'}</div>
          <div class="resultado-texto">
            <a class="cientifico" href="#catalogo/especie/${esc(e.id)}">${esc(e.nombreCientifico)}</a>
            ${e.nombreComun ? `<span>${esc(e.nombreComun)}</span>` : ""}
            <span class="familia">${esc(e.familia || "Familia sin indicar")}</span>
          </div>
          <div class="porcentaje ${r.porcentaje === null ? "nulo" : ""}">${pct}</div>
        </div>
        <div class="barra" aria-hidden="true"><span style="width:${r.porcentaje || 0}%"></span></div>
        <p class="conteos">
          <span>Comparados: <strong>${r.comparables}</strong></span>
          <span class="ok">Coinciden: <strong>${r.coincide.length}</strong></span>
          <span class="mal">Discrepan: <strong>${r.difiere.length}</strong></span>
          <span>No comparables: <strong>${r.noComparable.length}</strong></span>
        </p>
        <details class="detalle-resultado">
          <summary>Ver detalle y cálculo</summary>
          <p class="nota">${explicacion}</p>
          <ul class="rasgos-resultado">
            ${r.difiere.map(i => lineaRasgo(i, "mal")).join("")}
            ${r.coincide.map(i => lineaRasgo(i, "ok")).join("")}
            ${r.noComparable.map(i => `<li class="nc"><span class="rasgo-nombre">${esc(Morfologia.caracteres[i.id].nombre)}</span>: no observado en esta especie</li>`).join("")}
          </ul>
        </details>
      </li>`;
  }

  // Tras importar o borrar datos.
  function refrescar() { if (selector) calcular(); }

  return { mostrar, refrescar, evaluar };
})();
