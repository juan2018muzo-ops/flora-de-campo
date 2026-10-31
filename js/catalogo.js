/*
 * Pestaña Catálogo, sección Especies: lista con búsqueda, ficha botánica
 * individual y comparación entre dos especies.
 */

const Catalogo = (function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => App.escapar(s);

  let urls = [];
  let busqueda = "";
  let comparando = null; // null o lista de ids seleccionados para comparar

  function liberarUrls() { urls.forEach(u => URL.revokeObjectURL(u)); urls = []; }
  function url(blob) { const u = URL.createObjectURL(blob); urls.push(u); return u; }

  // --- Estaciones (también se usan en Registrar) -----------------------------------

  function nombreEstacion(s) {
    return [s.nombre, s.fecha].filter(Boolean).join(" · ");
  }

  function textoCampoEstacion(f, s) {
    const v = s[f.id];
    if (v === null || v === undefined || v === "") return "";
    if (f.tipo === "caracter") return Morfologia.nombreTermino(v);
    return String(v);
  }

  function resumenEstacion(s) {
    const partes = [];
    const lugar = [s.vereda, s.localidad, s.municipio].filter(Boolean).join(", ");
    if (lugar) partes.push(esc(lugar));
    if (s.zona) partes.push(esc(Morfologia.nombreTermino(s.zona)));
    if (s.altitud != null && s.altitud !== "") partes.push(`${esc(s.altitud)} m`);
    if (s.temperatura != null && s.temperatura !== "") partes.push(`${esc(s.temperatura)} °C`);
    if (s.humedad != null && s.humedad !== "") partes.push(`${esc(s.humedad)} % HR`);
    return partes.join(" · ") || "Sin datos del sitio";
  }

  // --- Enrutamiento -------------------------------------------------------------------

  // params: [] lista · ["especie", id] ficha · ["comparar", idA, idB] comparación
  async function mostrar(params) {
    liberarUrls();
    if (params[0] === "especie" && params[1]) return ficha(params[1]);
    if (params[0] === "comparar" && params[1] && params[2]) return comparar(params[1], params[2]);
    return lista();
  }

  // --- Lista ----------------------------------------------------------------------------

  async function lista() {
    const [especies, estaciones] = await Promise.all([DB.listar("especies"), DB.listar("estaciones")]);
    const porEstacion = new Map(estaciones.map(s => [s.id, s]));
    especies.sort((a, b) => a.nombreCientifico.localeCompare(b.nombreCientifico, "es"));

    const cont = $("#catalogo-especies");
    if (!especies.length) {
      cont.innerHTML = `
        <div class="vacio">
          <p>Todavía no hay especies registradas.</p>
          <a class="boton primario" href="#registrar">Registrar la primera especie</a>
        </div>`;
      return;
    }

    cont.innerHTML = `
      <div class="barra-lista">
        <input type="search" id="buscar-especie" placeholder="Nombre o familia" value="${esc(busqueda)}" aria-label="Buscar especies">
        <button type="button" class="boton" id="modo-comparar" aria-pressed="${comparando ? "true" : "false"}">${comparando ? "Cancelar" : "Comparar"}</button>
      </div>
      ${comparando ? `<p class="nota destacada">Elija dos especies para compararlas (${comparando.length}/2).</p>` : ""}
      <p class="contador" id="contador-especies"></p>
      <ul class="tarjetas" id="tarjetas"></ul>`;

    const tarjetas = [];
    for (const e of especies) {
      let img = "";
      if (e.fotoPrincipalId) {
        const f = await DB.obtener("fotos", e.fotoPrincipalId);
        if (f && f.blob) img = `<img src="${url(f.blob)}" alt="" loading="lazy">`;
      }
      const s = porEstacion.get(e.estacionId);
      const textoBusqueda = [e.nombreCientifico, e.nombreComun, e.familia].join(" ").toLowerCase();
      const elegida = comparando && comparando.includes(e.id);
      tarjetas.push(`
        <li data-busqueda="${esc(textoBusqueda)}">
          <a class="tarjeta ${elegida ? "elegida" : ""}" href="#catalogo/especie/${esc(e.id)}" data-id="${esc(e.id)}">
            <div class="miniatura">${img || '<span class="sin-foto">Sin foto</span>'}</div>
            <div class="tarjeta-texto">
              <strong class="cientifico">${esc(e.nombreCientifico)}</strong>
              ${e.nombreComun ? `<span>${esc(e.nombreComun)}</span>` : ""}
              <span class="familia">${esc(e.familia || "Familia sin indicar")}</span>
              ${s ? `<span class="lugar">${esc(s.municipio || s.nombre)}</span>` : ""}
            </div>
            ${comparando ? `<span class="marca-comparar" aria-hidden="true">${elegida ? "✓" : ""}</span>` : ""}
          </a>
        </li>`);
    }
    $("#tarjetas").innerHTML = tarjetas.join("");
    filtrar();

    $("#buscar-especie").addEventListener("input", ev => { busqueda = ev.target.value; filtrar(); });
    $("#modo-comparar").addEventListener("click", () => { comparando = comparando ? null : []; lista(); });
    $("#tarjetas").addEventListener("click", ev => {
      if (!comparando) return;
      const a = ev.target.closest(".tarjeta");
      if (!a) return;
      ev.preventDefault();
      const id = a.dataset.id;
      comparando = comparando.includes(id) ? comparando.filter(x => x !== id) : comparando.concat(id);
      if (comparando.length === 2) {
        const [x, y] = comparando;
        comparando = null;
        location.hash = `#catalogo/comparar/${x}/${y}`;
      } else {
        lista();
      }
    });
  }

  function filtrar() {
    const q = busqueda.trim().toLowerCase();
    let visibles = 0;
    document.querySelectorAll("#tarjetas > li").forEach(li => {
      const ok = !q || li.dataset.busqueda.includes(q);
      li.hidden = !ok;
      if (ok) visibles++;
    });
    const total = document.querySelectorAll("#tarjetas > li").length;
    $("#contador-especies").textContent = q ? `${visibles} de ${total} especies` : `${total} especie${total === 1 ? "" : "s"} registrada${total === 1 ? "" : "s"}`;
  }

  // --- Ficha -----------------------------------------------------------------------------

  function filaDato(nombre, valor) {
    return valor ? `<div><dt>${esc(nombre)}</dt><dd>${esc(valor)}</dd></div>` : "";
  }

  function seccionCaracteres(reg) {
    return Morfologia.categoriasEspecie.map(cat => {
      const aplican = cat.caracteres.filter(c => Morfologia.aplica(c, reg));
      const documentados = aplican.filter(c => reg[c.id]);
      const noObservados = aplican.filter(c => !reg[c.id] && !c.opcional);
      if (!documentados.length && cat.caracteres.every(c => c.opcional)) return "";
      return `
        <section class="ficha-categoria">
          <h4>${cat.id}. ${esc(cat.nombre)}</h4>
          ${documentados.length ? `<dl class="rasgos">${documentados.map(c => `
            <div class="${reg[c.id].estado}"><dt>${esc(c.nombre)}</dt><dd>${esc(Morfologia.texto(c, reg[c.id]))}</dd></div>`).join("")}</dl>` : ""}
          ${noObservados.length ? `<p class="no-observados"><span>No observado:</span> ${noObservados.map(c => esc(c.nombre)).join(" · ")}</p>` : ""}
        </section>`;
    }).join("");
  }

  async function ficha(id) {
    const e = await DB.obtener("especies", id);
    const cont = $("#catalogo-especies");
    if (!e) {
      cont.innerHTML = `<p>No se encontró la especie.</p><a class="boton" href="#catalogo">Volver al catálogo</a>`;
      return;
    }
    const s = e.estacionId ? await DB.obtener("estaciones", e.estacionId) : null;
    const fotos = await DB.fotosDeEspecie(id);
    fotos.sort((a, b) => (a.id === e.fotoPrincipalId ? -1 : b.id === e.fotoPrincipalId ? 1 : (a.creado || "").localeCompare(b.creado || "")));
    const tipoFoto = id => (VOCABULARIO.tiposFoto.find(t => t.id === id) || {}).nombre || "";
    const reg = e.caracteres || {};
    const total = Morfologia.contarDocumentados(reg);

    cont.innerHTML = `
      <article class="ficha">
        <a class="enlace volver no-imprimir" href="#catalogo">← Catálogo</a>
        <p class="solo-imprimir ficha-membrete">Ficha botánica · Biología Vegetal II</p>
        <header class="ficha-cabecera">
          <h3 class="cientifico">${esc(e.nombreCientifico)}</h3>
          ${e.nombreComun ? `<p class="comun">${esc(e.nombreComun)}</p>` : ""}
          <p class="familia">${esc(e.familia || "Familia sin indicar")}</p>
        </header>

        ${fotos.length ? `
          <div class="galeria">
            ${fotos.map(f => `
              <figure>
                <button type="button" class="foto-boton" data-foto="${esc(f.id)}" aria-label="Ampliar foto: ${esc(tipoFoto(f.tipo))}">
                  <img src="${url(f.blob)}" alt="${esc(tipoFoto(f.tipo) + (f.descripcion ? ": " + f.descripcion : ""))}">
                </button>
                <figcaption><strong>${esc(tipoFoto(f.tipo))}</strong>${f.descripcion ? ` · ${esc(f.descripcion)}` : ""}</figcaption>
              </figure>`).join("")}
          </div>` : `<p class="nota">Sin fotografías.</p>`}

        <section class="ficha-bloque">
          <h4>Datos de recolección</h4>
          <dl class="datos">
            ${filaDato("Fecha de observación", e.fecha)}
            ${filaDato("Colector", e.colector)}
            ${filaDato("N.º de colección", e.numeroColeccion)}
          </dl>
        </section>

        <section class="ficha-bloque">
          <h4>Estación de muestreo</h4>
          ${s ? `<dl class="datos">${VOCABULARIO.camposEstacion.map(f => filaDato(f.nombre, textoCampoEstacion(f, s))).join("")}</dl>` : `<p class="nota">Sin estación asignada.</p>`}
        </section>

        <section class="ficha-bloque">
          <h4>Características <small>(${total} registradas)</small></h4>
          ${seccionCaracteres(reg)}
        </section>

        ${e.observaciones ? `<section class="ficha-bloque"><h4>Observaciones adicionales</h4><p class="observaciones">${esc(e.observaciones)}</p></section>` : ""}

        <div class="no-imprimir acciones-ficha">
          <button type="button" class="boton primario" id="imprimir-ficha">Imprimir o guardar en PDF</button>
          <div class="fila">
            <a class="boton" href="#registrar/${esc(e.id)}">Editar</a>
            <button type="button" class="boton peligro" id="borrar-especie">Borrar</button>
          </div>
        </div>
      </article>`;

    cont.querySelectorAll(".foto-boton").forEach(b => b.addEventListener("click", () => {
      const f = fotos.find(x => x.id === b.dataset.foto);
      verFoto(b.querySelector("img").src, tipoFoto(f.tipo), f.descripcion);
    }));
    $("#imprimir-ficha").addEventListener("click", () => App.imprimir("ficha"));
    $("#borrar-especie").addEventListener("click", async () => {
      const r = await App.preguntar("¿Borrar esta especie?",
        `<p>Se borrará <em>${esc(e.nombreCientifico)}</em> con sus ${fotos.length} foto(s). La estación de muestreo se conserva. Esto no se puede deshacer.</p>`,
        [{ valor: "", texto: "Cancelar" }, { valor: "si", texto: "Borrar", clase: "peligro lleno" }]);
      if (r !== "si") return;
      await DB.borrarEspecie(e.id);
      App.aviso("Especie borrada.");
      location.hash = "#catalogo";
    });
    window.scrollTo(0, 0);
  }

  function verFoto(src, titulo, descripcion) {
    const dlg = $("#visor-foto");
    dlg.querySelector("img").src = src;
    dlg.querySelector("figcaption").innerHTML = `<strong>${esc(titulo)}</strong>${descripcion ? ` · ${esc(descripcion)}` : ""}`;
    dlg.showModal();
  }

  // --- Comparación ------------------------------------------------------------------------

  async function comparar(idA, idB) {
    const [a, b] = await Promise.all([DB.obtener("especies", idA), DB.obtener("especies", idB)]);
    const cont = $("#catalogo-especies");
    if (!a || !b) {
      cont.innerHTML = `<p>No se encontró alguna de las especies.</p><a class="boton" href="#catalogo">Volver al catálogo</a>`;
      return;
    }
    const ra = a.caracteres || {}, rb = b.caracteres || {};
    const cuenta = { coincide: 0, difiere: 0, no_comparable: 0 };
    const RESULTADO = { coincide: "Igual", difiere: "Diferente", no_comparable: "No comparable" };

    const bloques = Morfologia.categoriasEspecie.map(cat => {
      const filas = cat.caracteres
        .filter(c => (Morfologia.aplica(c, ra) || Morfologia.aplica(c, rb)) && (ra[c.id] || rb[c.id]))
        .map(c => {
          const res = Morfologia.comparar(ra[c.id], rb[c.id]);
          cuenta[res]++;
          return `
            <tr class="${res}">
              <th scope="row">${esc(c.nombre)}</th>
              <td>${esc(Morfologia.texto(c, ra[c.id]))}</td>
              <td>${esc(Morfologia.texto(c, rb[c.id]))}</td>
              <td class="resultado">${RESULTADO[res]}</td>
            </tr>`;
        });
      if (!filas.length) return "";
      return `<tbody><tr class="cat"><th colspan="4">${cat.id}. ${esc(cat.nombre)}</th></tr>${filas.join("")}</tbody>`;
    }).join("");

    const comparables = cuenta.coincide + cuenta.difiere;
    cont.innerHTML = `
      <article class="comparacion">
        <a class="enlace volver" href="#catalogo">← Catálogo</a>
        <h3>Comparación morfológica</h3>
        <p class="nombres-comparados"><a href="#catalogo/especie/${esc(a.id)}"><em>${esc(a.nombreCientifico)}</em></a> y <a href="#catalogo/especie/${esc(b.id)}"><em>${esc(b.nombreCientifico)}</em></a></p>
        <dl class="cifras">
          <div><dt>Iguales</dt><dd>${cuenta.coincide}</dd></div>
          <div><dt>Diferentes</dt><dd>${cuenta.difiere}</dd></div>
          <div><dt>No comparables</dt><dd>${cuenta.no_comparable}</dd></div>
        </dl>
        <p class="nota">Se compararon ${comparables} caracteres registrados en ambas especies. Los ${cuenta.no_comparable} "no comparables" están registrados en una sola especie y en la otra figuran como no observados: no cuentan como diferencia. Si una especie tiene varios valores, basta con compartir uno para que el carácter cuente como igual.</p>
        <label class="interruptor"><input type="checkbox" id="solo-diferencias"> Mostrar solo las diferencias</label>
        ${bloques ? `
          <div class="tabla-desplazable">
            <table class="tabla-comparar" id="tabla-comparar">
              <thead><tr><th>Carácter</th><th><em>${esc(a.nombreCientifico)}</em></th><th><em>${esc(b.nombreCientifico)}</em></th><th>Resultado</th></tr></thead>
              ${bloques}
            </table>
          </div>` : `<p class="nota">Ninguna de las dos especies tiene características registradas.</p>`}
      </article>`;

    const solo = $("#solo-diferencias");
    if (solo) solo.addEventListener("change", () => $("#tabla-comparar").classList.toggle("solo-diferencias", solo.checked));
    window.scrollTo(0, 0);
  }

  return { mostrar, nombreEstacion, resumenEstacion };
})();
