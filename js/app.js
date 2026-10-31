/* Navegación, panel de datos y utilidades de interfaz. */

const App = (function () {
  const VISTAS = ["identificar", "catalogo", "registrar", "claves"];
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // --- Utilidades ---------------------------------------------------------------

  function escapar(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  let temporizadorAviso;
  function aviso(texto, tipo) {
    const el = $("#aviso");
    el.textContent = texto;
    el.className = "aviso" + (tipo === "error" ? " error" : "");
    el.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => { el.hidden = true; }, 4000);
  }

  /*
   * Diálogo de confirmación. `botones` es una lista de { valor, texto, clase }.
   * Devuelve el `valor` del botón pulsado, o null si se cierra con Esc.
   */
  function preguntar(titulo, html, botones) {
    const dlg = $("#dialogo");
    $("#dialogo-titulo").textContent = titulo;
    $("#dialogo-texto").innerHTML = html;
    $("#dialogo-acciones").innerHTML = botones
      .map(b => `<button class="boton ${b.clase || ""}" value="${escapar(b.valor)}">${escapar(b.texto)}</button>`)
      .join("");
    // Una pregunta anterior que siga esperando se cancela, para no ejecutar su acción después.
    if (cancelarPregunta) cancelarPregunta();
    dlg.returnValue = "";
    dlg.showModal();
    return new Promise(resolve => {
      const alCerrar = () => { cancelarPregunta = null; resolve(dlg.returnValue || null); };
      dlg.addEventListener("close", alCerrar, { once: true });
      cancelarPregunta = () => { dlg.removeEventListener("close", alCerrar); cancelarPregunta = null; resolve(null); };
    });
  }
  let cancelarPregunta = null;

  function formatoBytes(n) {
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
    if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
    return (n / 1024 / 1024 / 1024).toFixed(1) + " GB";
  }

  // --- Navegación ---------------------------------------------------------------

  // Rutas: #vista o #vista/parametro/...  (p. ej. #catalogo/especie/<id>, #registrar/<id>)
  function mostrarVista() {
    const partes = location.hash.replace("#", "").split("/").map(decodeURIComponent);
    const vista = VISTAS.includes(partes[0]) ? partes[0] : "identificar";
    const params = partes.slice(1);
    $$(".vista").forEach(v => { v.hidden = v.dataset.vista !== vista; });
    $$(".pestana").forEach(p => {
      if (p.dataset.vista === vista) p.setAttribute("aria-current", "page");
      else p.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    if (vista === "identificar") Identificar.mostrar();
    if (vista === "catalogo") {
      if (params.length) mostrarSubvista("especies");
      Catalogo.mostrar(params);
    }
    if (vista === "registrar") Registro.mostrar(params[0]);
    if (vista === "claves") Clave.mostrar();
  }

  function mostrarSubvista(nombre) {
    $$(".segmento").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.sub === nombre)));
    $$(".subvista").forEach(s => { s.hidden = s.dataset.sub !== nombre; });
    if (nombre === "glosario") Glosario.mostrar();
    if (nombre === "album") Album.mostrar();
  }

  // Imprime la vista actual (ficha, álbum o clave). La hoja de estilo print.css
  // oculta la navegación y los controles; `data-imprimir` ajusta el formato.
  function imprimir(tipo) {
    document.body.dataset.imprimir = tipo;
    window.addEventListener("afterprint", () => { delete document.body.dataset.imprimir; }, { once: true });
    window.print();
  }

  // --- Panel de datos -------------------------------------------------------------

  async function actualizarCifras() {
    const c = await DB.contar();
    $("#cifras-datos").innerHTML =
      `<div><dt>Especies</dt><dd>${c.especies}</dd></div>` +
      `<div><dt>Estaciones</dt><dd>${c.estaciones}</dd></div>` +
      `<div><dt>Fotos</dt><dd>${c.fotos}</dd></div>`;
    const e = await DB.espacio();
    $("#nota-espacio").textContent = e && e.quota
      ? `Espacio usado en este navegador: ${formatoBytes(e.usage)} de ${formatoBytes(e.quota)} disponibles.`
      : "";
  }

  // Tras importar o borrar datos: descarta el borrador y vuelve a dibujar la vista actual.
  async function refrescar() {
    await actualizarCifras();
    Registro.descartar();
    Identificar.refrescar();
    mostrarVista();
  }

  async function exportar() {
    const boton = $("#exportar");
    boton.disabled = true;
    try {
      const datos = await DB.exportar();
      const blob = new Blob([JSON.stringify(datos)], { type: "application/json" });
      const fecha = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `flora-de-campo-${fecha}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      aviso(`Copia descargada: ${datos.especies.length} especies, ${datos.fotos.length} fotos.`);
    } catch (err) {
      aviso("No se pudo crear la copia: " + err.message, "error");
    } finally {
      boton.disabled = false;
    }
  }

  async function importarArchivo(archivo) {
    let datos;
    try {
      datos = JSON.parse(await archivo.text());
    } catch (err) {
      aviso("El archivo no es un JSON válido.", "error");
      return;
    }
    const modo = $("input[name=modo-importar]:checked").value;
    try {
      let omitir = [];
      if (modo === "reemplazar") {
        const c = await DB.contar();
        const r = await preguntar(
          "¿Reemplazar todos los datos?",
          `<p>Se borrarán sus <strong>${c.especies} especies, ${c.estaciones} estaciones y ${c.fotos} fotos</strong> y quedará solo lo que trae el archivo ` +
          `(${datos.especies ? datos.especies.length : 0} especies). Esto no se puede deshacer.</p>` +
          `<p>Si no está seguro, descargue antes una copia de seguridad.</p>`,
          [{ valor: "", texto: "Cancelar" }, { valor: "si", texto: "Reemplazar", clase: "peligro lleno" }]
        );
        if (r !== "si") return;
      } else {
        const res = await DB.analizarImportacion(datos);
        const n = res.nuevos, a = res.actualizados;
        let html = `<p>El archivo trae <strong>${n.especies} especies nuevas</strong>, ${n.estaciones} estaciones nuevas y ${n.fotos} fotos nuevas.`;
        if (a.especies || a.estaciones || a.fotos) html += ` Además, actualiza ${a.especies + a.estaciones + a.fotos} registros que ya tenía con una versión más reciente.`;
        html += "</p>";
        if (res.posiblesDuplicados.length) {
          html += `<p><strong>Posibles duplicados</strong>: estas especies tienen el mismo nombre científico y la misma estación que una suya, pero son registros distintos:</p><ul>` +
            res.posiblesDuplicados.map(d => `<li><em>${escapar(d.entrante.nombreCientifico)}</em></li>`).join("") + "</ul>";
        }
        const botones = [{ valor: "", texto: "Cancelar" }];
        if (res.posiblesDuplicados.length) {
          botones.push({ valor: "omitir", texto: "Importar sin los duplicados" });
          botones.push({ valor: "todo", texto: "Importar todo", clase: "primario" });
        } else {
          botones.push({ valor: "todo", texto: "Importar", clase: "primario" });
        }
        const r = await preguntar("Importar registros", html, botones);
        if (!r) return;
        if (r === "omitir") omitir = res.posiblesDuplicados.map(d => d.entrante.id);
      }
      const resultado = await DB.importar(datos, modo, omitir);
      await refrescar();
      aviso(`Importación terminada: ${resultado.escritos} registros guardados.`);
    } catch (err) {
      aviso(err.message, "error");
    }
  }

  async function borrarTodo() {
    const c = await DB.contar();
    const r = await preguntar(
      "¿Borrar todos los datos?",
      `<p>Se borrarán <strong>${c.especies} especies, ${c.estaciones} estaciones y ${c.fotos} fotos</strong> de este navegador. Esto no se puede deshacer.</p>` +
      `<p>Descargue antes una copia de seguridad si quiere conservarlos.</p>`,
      [{ valor: "", texto: "Cancelar" }, { valor: "si", texto: "Borrar todo", clase: "peligro lleno" }]
    );
    if (r !== "si") return;
    await DB.borrarTodo();
    await refrescar();
    aviso("Se borraron todos los datos.");
  }

  // --- Inicio ---------------------------------------------------------------------

  function iniciar() {
    window.addEventListener("hashchange", mostrarVista);

    $$(".segmento").forEach(b => b.addEventListener("click", () => {
      // Desde una ficha o comparación, "Especies" vuelve a la lista.
      if (b.dataset.sub === "especies" && location.hash !== "#catalogo") location.hash = "#catalogo";
      mostrarSubvista(b.dataset.sub);
    }));

    // Cualquier [data-cerrar] cierra el diálogo que lo contiene; un toque fuera también.
    $$("dialog").forEach(d => {
      d.querySelectorAll("[data-cerrar]").forEach(b => b.addEventListener("click", () => d.close("")));
      d.addEventListener("click", e => { if (e.target === d) d.close(""); });
    });

    const panel = $("#panel-datos");
    $("#abrir-datos").addEventListener("click", () => { actualizarCifras(); panel.showModal(); });
    $("#exportar").addEventListener("click", exportar);
    $("#archivo-importar").addEventListener("change", e => {
      const archivo = e.target.files[0];
      e.target.value = "";
      if (archivo) importarArchivo(archivo);
    });
    $("#borrar-todo").addEventListener("click", borrarTodo);

    DB.abrir().then(() => { actualizarCifras(); mostrarVista(); })
      .catch(err => aviso("No se pudo abrir el almacenamiento: " + err.message, "error"));
    DB.pedirPersistencia();

    // Copia de la app para usarla sin conexión (solo en http/https; no al abrir el archivo directamente).
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(err => console.warn("Sin modo sin conexión:", err));
    }
  }

  document.addEventListener("DOMContentLoaded", iniciar);

  return { aviso, preguntar, escapar, actualizarCifras, imprimir };
})();
