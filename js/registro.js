/*
 * Pestaña Registrar: formulario de especie con estación de muestreo,
 * fotografías etiquetadas y características en tres estados.
 */

const Registro = (function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => App.escapar(s);
  const LADO_MAXIMO = 1600;

  // Estado del formulario en edición. Se conserva al cambiar de pestaña.
  let estado = null;
  let urls = [];
  let cancelarEstacion = null;

  // Fecha local (no UTC), para que de noche no salga el día siguiente.
  const hoy = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  function nuevoEstado() {
    return {
      especie: { id: null, nombreCientifico: "", nombreComun: "", familia: "", estacionId: "", colector: "", numeroColeccion: "", fecha: hoy(), observaciones: "" },
      caracteres: {},
      fotos: [],
      fotosBorradas: [],
      fotoPrincipalId: null
    };
  }

  async function cargarEspecie(id) {
    const e = await DB.obtener("especies", id);
    if (!e) return null;
    const fotos = await DB.fotosDeEspecie(id);
    fotos.sort((a, b) => (a.creado || "").localeCompare(b.creado || ""));
    return {
      especie: Object.assign({}, e),
      caracteres: JSON.parse(JSON.stringify(e.caracteres || {})),
      fotos: fotos.map(f => Object.assign({}, f, { cambiada: false, nueva: false })),
      fotosBorradas: [],
      fotoPrincipalId: e.fotoPrincipalId || null
    };
  }

  // id: especie a editar; sin id: nuevo registro (conserva el borrador si existe).
  async function mostrar(id) {
    if (id) {
      if (!estado || estado.especie.id !== id) {
        const cargado = await cargarEspecie(id);
        if (!cargado) { App.aviso("No se encontró la especie.", "error"); location.hash = "#registrar"; return; }
        estado = cargado;
      }
    } else if (!estado || estado.especie.id) {
      estado = nuevoEstado();
    }
    await dibujar();
  }

  // --- Dibujo ---------------------------------------------------------------------

  async function dibujar() {
    const e = estado.especie;
    const editando = !!e.id;
    const especies = await DB.listar("especies");
    const familias = [...new Set(especies.map(x => (x.familia || "").trim()).filter(Boolean))].sort();

    $("#registro").innerHTML = `
      <form id="form-especie" novalidate>
        <div class="registro-titulo">
          <h2>${editando ? "Editar registro" : "Registrar especie"}</h2>
          ${editando ? `<a class="enlace" href="#catalogo/especie/${esc(e.id)}">Volver a la ficha</a>` : `<button type="button" class="enlace" id="reiniciar">Empezar de nuevo</button>`}
        </div>

        <section class="bloque">
          <h3>1. Identificación</h3>
          <label class="campo">
            <span>Nombre científico o morfoespecie <b class="req">*</b></span>
            <input name="nombreCientifico" value="${esc(e.nombreCientifico)}" placeholder="Ej.: Coffea arabica o Morfoespecie 3" autocomplete="off">
          </label>
          <label class="campo"><span>Nombre común</span>
            <input name="nombreComun" value="${esc(e.nombreComun)}" autocomplete="off"></label>
          <label class="campo"><span>Familia botánica</span>
            <input name="familia" value="${esc(e.familia)}" list="lista-familias" autocomplete="off" placeholder="Ej.: Rubiaceae"></label>
          <datalist id="lista-familias">${familias.map(f => `<option value="${esc(f)}">`).join("")}</datalist>
          <div class="fila">
            <label class="campo"><span>Colector</span><input name="colector" value="${esc(e.colector)}"></label>
            <label class="campo"><span>N.º de colección</span><input name="numeroColeccion" value="${esc(e.numeroColeccion)}"></label>
          </div>
          <label class="campo"><span>Fecha de observación</span><input type="date" name="fecha" value="${esc(e.fecha)}"></label>
        </section>

        <section class="bloque">
          <h3>2. Estación de muestreo</h3>
          <p class="nota">Los datos del sitio se escriben una vez y se comparten entre todas las especies registradas allí.</p>
          <div id="estacion-selector"></div>
        </section>

        <section class="bloque">
          <h3>3. Fotografías</h3>
          <div class="fila botones-foto">
            <label class="boton" for="foto-camara">Tomar foto</label>
            <label class="boton" for="foto-galeria">Elegir de la galería</label>
          </div>
          <input type="file" id="foto-camara" accept="image/*" capture="environment" hidden>
          <input type="file" id="foto-galeria" accept="image/*" multiple hidden>
          <div id="lista-fotos" class="lista-fotos"></div>
        </section>

        <section class="bloque">
          <h3>4. Características</h3>
          <p class="nota">Toque los términos que observa. Sin marcar = <strong>no observado</strong>. Use <strong>Ausente</strong> solo si comprobó que la estructura no existe. Toque de nuevo para desmarcar.</p>
          <div id="caracteres-form"></div>
        </section>

        <section class="bloque">
          <h3>5. Observaciones adicionales</h3>
          <label class="campo"><span class="oculto">Observaciones</span>
            <textarea name="observaciones" rows="4" placeholder="Olor, color del látex, tamaño de la hoja, abundancia…">${esc(e.observaciones)}</textarea></label>
        </section>

        <div class="barra-guardar">
          <button type="submit" class="boton primario">${editando ? "Guardar cambios" : "Guardar especie"}</button>
        </div>
      </form>`;

    await dibujarEstaciones();
    dibujarFotos();
    dibujarCaracteres();
    conectar();
  }

  async function dibujarEstaciones() {
    const estaciones = await DB.listar("estaciones");
    estaciones.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "") || (a.nombre || "").localeCompare(b.nombre || ""));
    const actual = estaciones.find(x => x.id === estado.especie.estacionId);
    if (estado.especie.estacionId && !actual) estado.especie.estacionId = "";
    $("#estacion-selector").innerHTML = `
      <label class="campo"><span>Estación</span>
        <select id="estacion-select">
          <option value="">Sin estación</option>
          ${estaciones.map(s => `<option value="${esc(s.id)}" ${s.id === estado.especie.estacionId ? "selected" : ""}>${esc(Catalogo.nombreEstacion(s))}</option>`).join("")}
        </select>
      </label>
      ${actual ? `<div class="resumen-estacion">${Catalogo.resumenEstacion(actual)}</div>` : ""}
      <div class="fila">
        <button type="button" class="boton" id="nueva-estacion">Nueva estación</button>
        ${actual ? `<button type="button" class="boton" id="editar-estacion">Editar estación</button>` : ""}
      </div>`;
    $("#estacion-select").addEventListener("change", ev => { estado.especie.estacionId = ev.target.value; dibujarEstaciones(); });
    $("#nueva-estacion").addEventListener("click", () => editarEstacion(null));
    if (actual) $("#editar-estacion").addEventListener("click", () => editarEstacion(actual));
  }

  function dibujarFotos() {
    urls.forEach(u => URL.revokeObjectURL(u));
    urls = [];
    if (estado.fotos.length && !estado.fotos.some(f => f.id === estado.fotoPrincipalId)) estado.fotoPrincipalId = estado.fotos[0].id;
    $("#lista-fotos").innerHTML = estado.fotos.length ? estado.fotos.map(f => {
      const u = URL.createObjectURL(f.blob); urls.push(u);
      return `
        <div class="foto-item" data-foto="${esc(f.id)}">
          <img src="${u}" alt="">
          <div class="foto-campos">
            <select data-campo="tipo" aria-label="Tipo de foto">
              ${VOCABULARIO.tiposFoto.map(t => `<option value="${t.id}" ${t.id === f.tipo ? "selected" : ""}>${esc(t.nombre)}</option>`).join("")}
            </select>
            <input data-campo="descripcion" value="${esc(f.descripcion)}" placeholder="Descripción" aria-label="Descripción de la foto">
            <div class="foto-acciones">
              <label><input type="radio" name="principal" value="${esc(f.id)}" ${f.id === estado.fotoPrincipalId ? "checked" : ""}> Principal</label>
              <button type="button" class="enlace peligro" data-quitar>Quitar</button>
            </div>
          </div>
        </div>`;
    }).join("") : `<p class="nota">Aún no hay fotos. Puede tomarlas con la cámara o elegirlas de la galería.</p>`;
  }

  function dibujarCaracteres() {
    Selector.crear($("#caracteres-form"), estado.caracteres);
  }

  // --- Eventos ---------------------------------------------------------------------

  function conectar() {
    const form = $("#form-especie");
    form.addEventListener("input", ev => {
      const n = ev.target.name;
      if (n && n in estado.especie) estado.especie[n] = ev.target.value;
      const item = ev.target.closest(".foto-item");
      if (item && ev.target.dataset.campo) {
        const f = estado.fotos.find(x => x.id === item.dataset.foto);
        f[ev.target.dataset.campo] = ev.target.value;
        f.cambiada = true;
      }
      if (n === "principal") estado.fotoPrincipalId = ev.target.value;
    });
    form.addEventListener("change", ev => {
      if (ev.target.name === "principal") estado.fotoPrincipalId = ev.target.value;
    });
    form.addEventListener("click", ev => {
      if (ev.target.closest("[data-quitar]")) {
        const id = ev.target.closest(".foto-item").dataset.foto;
        const f = estado.fotos.find(x => x.id === id);
        if (!f.nueva) estado.fotosBorradas.push(id);
        estado.fotos = estado.fotos.filter(x => x.id !== id);
        dibujarFotos();
      }
    });
    form.addEventListener("submit", ev => { ev.preventDefault(); guardar(); });
    ["#foto-camara", "#foto-galeria"].forEach(sel => $(sel).addEventListener("change", async ev => {
      const archivos = Array.from(ev.target.files);
      ev.target.value = "";
      await agregarFotos(archivos);
    }));
    const reiniciar = $("#reiniciar");
    if (reiniciar) reiniciar.addEventListener("click", async () => {
      const r = await App.preguntar("¿Empezar de nuevo?", "<p>Se descartará lo que ha escrito en este formulario.</p>",
        [{ valor: "", texto: "Cancelar" }, { valor: "si", texto: "Descartar", clase: "peligro lleno" }]);
      if (r === "si") { estado = nuevoEstado(); dibujar(); }
    });
  }

  // --- Fotos ------------------------------------------------------------------------

  function cargarImagen(archivo) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(archivo);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen " + archivo.name)); };
      img.src = url;
    });
  }

  // Reduce la foto a LADO_MAXIMO px en su lado mayor y la guarda como JPEG.
  async function reducir(archivo) {
    const img = await cargarImagen(archivo);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * escala);
    canvas.height = Math.round(img.naturalHeight * escala);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
  }

  async function agregarFotos(archivos) {
    for (const archivo of archivos) {
      try {
        const blob = await reducir(archivo);
        const tipoSugerido = estado.fotos.length === 0 ? "planta" : "hoja";
        estado.fotos.push({ id: DB.nuevoId(), tipo: tipoSugerido, descripcion: "", blob: blob, nueva: true, cambiada: true });
      } catch (err) {
        App.aviso(err.message, "error");
      }
    }
    dibujarFotos();
  }

  // --- Estaciones -------------------------------------------------------------------

  async function editarEstacion(existente) {
    const dlg = $("#dialogo-estacion");
    const s = existente || { fecha: estado.especie.fecha || hoy() };
    const zona = Morfologia.caracteres.zona;
    $("#dialogo-estacion-titulo").textContent = existente ? "Editar estación" : "Nueva estación de muestreo";
    $("#campos-estacion").innerHTML = VOCABULARIO.camposEstacion.map(f => {
      const v = s[f.id] == null ? "" : s[f.id];
      const etiqueta = `<span>${esc(f.nombre)}${f.id === "nombre" ? ' <b class="req">*</b>' : ""}</span>`;
      if (f.tipo === "caracter") return `<label class="campo">${etiqueta}<select name="${f.id}"><option value="">Sin indicar</option>${zona.terminos.map(t => `<option value="${t.id}" ${t.id === v ? "selected" : ""}>${esc(t.nombre)}</option>`).join("")}</select></label>`;
      if (f.tipo === "textoLargo") return `<label class="campo">${etiqueta}<textarea name="${f.id}" rows="3">${esc(v)}</textarea></label>`;
      const tipo = f.tipo === "numero" ? 'type="number" inputmode="decimal" step="any"' : f.tipo === "fecha" ? 'type="date"' : 'type="text"';
      const lista = f.sugerencias ? `list="sug-${f.id}"` : "";
      const datalist = f.sugerencias ? `<datalist id="sug-${f.id}">${f.sugerencias.map(x => `<option value="${esc(x)}">`).join("")}</datalist>` : "";
      return `<label class="campo">${etiqueta}<input name="${f.id}" ${tipo} ${lista} value="${esc(v)}" autocomplete="off">${datalist}</label>`;
    }).join("");
    // Si quedó una apertura anterior esperando, se cancela para no guardar dos veces.
    if (cancelarEstacion) cancelarEstacion();
    dlg.returnValue = "";
    dlg.showModal();
    const r = await new Promise(resolve => {
      const alCerrar = () => { cancelarEstacion = null; resolve(dlg.returnValue); };
      dlg.addEventListener("close", alCerrar, { once: true });
      cancelarEstacion = () => { dlg.removeEventListener("close", alCerrar); cancelarEstacion = null; resolve(""); };
    });
    if (r !== "guardar") return;
    const datos = Object.assign({}, existente || {});
    VOCABULARIO.camposEstacion.forEach(f => {
      const v = dlg.querySelector(`[name="${f.id}"]`).value.trim();
      datos[f.id] = f.tipo === "numero" ? (v === "" ? null : Number(v)) : v;
    });
    if (!datos.nombre) datos.nombre = [datos.municipio, datos.localidad || datos.vereda].filter(Boolean).join(", ") || "Estación sin nombre";
    const guardada = await DB.guardar("estaciones", datos);
    estado.especie.estacionId = guardada.id;
    await dibujarEstaciones();
    App.aviso(existente ? "Estación actualizada." : "Estación creada.");
  }

  // --- Guardar ----------------------------------------------------------------------

  async function guardar() {
    const e = estado.especie;
    if (!e.nombreCientifico.trim()) {
      App.aviso("Escriba el nombre científico o un nombre de morfoespecie.", "error");
      $("[name=nombreCientifico]").focus();
      return;
    }
    try {
      const id = e.id || DB.nuevoId();
      for (const fid of estado.fotosBorradas) await DB.borrar("fotos", fid);
      for (const f of estado.fotos) {
        if (!f.cambiada) continue;
        await DB.guardar("fotos", { id: f.id, especieId: id, tipo: f.tipo, descripcion: f.descripcion.trim(), blob: f.blob, creado: f.creado });
      }
      const registro = Object.assign({}, e, {
        id: id,
        nombreCientifico: e.nombreCientifico.trim(),
        nombreComun: e.nombreComun.trim(),
        familia: e.familia.trim(),
        caracteres: Morfologia.limpiar(estado.caracteres),
        fotoPrincipalId: estado.fotos.length ? estado.fotoPrincipalId : null
      });
      await DB.guardar("especies", registro);
      estado = null;
      App.aviso("Especie guardada.");
      location.hash = "#catalogo/especie/" + id;
    } catch (err) {
      App.aviso("No se pudo guardar: " + err.message, "error");
    }
  }

  // Descarta el borrador (por ejemplo, tras borrar o reemplazar todos los datos).
  function descartar() { estado = null; }

  return { mostrar, descartar };
})();
