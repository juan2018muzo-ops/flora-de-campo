/*
 * Catálogo > Álbum de hojas: una entrada por especie con foto de hoja, con sus
 * caracteres foliares principales. Se ordena por nombre, familia o un carácter, y se
 * imprime con dos entradas por página.
 */

const Album = (function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => App.escapar(s);

  // Fotos que sirven para el álbum, en orden de preferencia.
  const TIPOS_HOJA = ["hoja", "haz", "enves"];
  const CAMPOS = [
    { id: "tipo", nombre: "Tipo de hoja" },
    { id: "forma", nombre: "Forma de la lámina" },
    { id: "margen", nombre: "Margen" },
    { id: "apice", nombre: "Ápice" },
    { id: "base", nombre: "Base" },
    { id: "nervadura", nombre: "Nervadura" },
    { id: "filotaxis", nombre: "Filotaxis" }
  ];
  const ORDENES = [
    { id: "nombre", nombre: "Nombre científico" },
    { id: "familia", nombre: "Familia" },
    ...CAMPOS.map(c => ({ id: c.id, nombre: c.nombre }))
  ];

  let orden = "nombre";
  let urls = [];

  // "Tipo de hoja" reúne varios caracteres de la categoría B: simple entera, compuesta imparipinnada…
  function tipoDeHoja(reg) {
    const partes = ["b_tipo", "b_division", "b_division_disposicion", "b_compuesta", "b_pinnada_grado", "b_pinnada_terminal", "b_monocot", "b_gimno", "b_pterido", "b_fronde"]
      .filter(id => reg[id] && Morfologia.aplica(Morfologia.caracteres[id], reg))
      .map(id => Morfologia.texto(Morfologia.caracteres[id], reg[id]).toLowerCase());
    return partes.length ? partes.join(", ").replace(/^./, m => m.toUpperCase()) : "";
  }

  function valor(e, campo) {
    const reg = e.caracteres || {};
    if (campo === "tipo") return tipoDeHoja(reg);
    const c = Morfologia.caracteres[campo];
    return reg[campo] && Morfologia.aplica(c, reg) ? Morfologia.texto(c, reg[campo]) : "";
  }

  async function mostrar() {
    urls.forEach(u => URL.revokeObjectURL(u));
    urls = [];
    const especies = await DB.listar("especies");
    const entradas = [], sinFoto = [];
    for (const e of especies) {
      const fotos = await DB.fotosDeEspecie(e.id);
      let foto = null;
      for (const t of TIPOS_HOJA) { foto = fotos.find(f => f.tipo === t); if (foto) break; }
      if (foto) entradas.push({ e, foto }); else sinFoto.push(e);
    }

    const clave = x => orden === "nombre" ? x.e.nombreCientifico : orden === "familia" ? (x.e.familia || "~") : (valor(x.e, orden) || "~");
    entradas.sort((a, b) => clave(a).localeCompare(clave(b), "es") || a.e.nombreCientifico.localeCompare(b.e.nombreCientifico, "es"));

    const agrupar = orden !== "nombre";
    const nombreGrupo = x => orden === "familia" ? (x.e.familia || "Familia sin indicar") : (valor(x.e, orden) || "No observado");
    let grupoActual = null;
    const html = entradas.map(x => {
      let cab = "";
      if (agrupar && nombreGrupo(x) !== grupoActual) {
        grupoActual = nombreGrupo(x);
        cab = `<h4 class="album-grupo">${esc(grupoActual)}</h4>`;
      }
      const u = URL.createObjectURL(x.foto.blob); urls.push(u);
      return cab + `
        <article class="album-entrada">
          <img src="${u}" alt="Hoja de ${esc(x.e.nombreCientifico)}">
          <div class="album-datos">
            <h4 class="cientifico">${esc(x.e.nombreCientifico)}</h4>
            ${x.e.nombreComun ? `<p class="comun">${esc(x.e.nombreComun)}</p>` : ""}
            <p class="familia">${esc(x.e.familia || "Familia sin indicar")}</p>
            <dl>${CAMPOS.map(c => { const v = valor(x.e, c.id); return `<div><dt>${esc(c.nombre)}</dt><dd class="${v ? "" : "no-observado"}">${esc(v || "No observado")}</dd></div>`; }).join("")}</dl>
            ${x.foto.descripcion ? `<p class="nota">${esc(x.foto.descripcion)}</p>` : ""}
          </div>
        </article>`;
    }).join("");

    $("#album").innerHTML = `
      <div class="no-imprimir">
        <p class="nota">Una entrada por especie con foto de tipo <em>Hoja</em>, <em>Haz</em> o <em>Envés</em>. Se imprime con dos entradas por página.</p>
        <div class="barra-album">
          <label class="campo"><span>Ordenar por</span>
            <select id="album-orden">${ORDENES.map(o => `<option value="${o.id}" ${o.id === orden ? "selected" : ""}>${esc(o.nombre)}</option>`).join("")}</select>
          </label>
          <button type="button" class="boton primario" id="imprimir-album" ${entradas.length ? "" : "disabled"}>Imprimir o PDF</button>
        </div>
        ${sinFoto.length ? `<p class="nota">Sin foto de hoja (no aparecen en el álbum): ${sinFoto.map(e => `<a href="#registrar/${esc(e.id)}"><em>${esc(e.nombreCientifico)}</em></a>`).join(", ")}.</p>` : ""}
      </div>
      <h3 class="solo-imprimir album-titulo">Álbum de hojas</h3>
      ${entradas.length ? `<div class="album">${html}</div>` : `<div class="vacio"><p>Ninguna especie tiene todavía una foto de hoja.</p></div>`}`;

    $("#album-orden").addEventListener("change", ev => { orden = ev.target.value; mostrar(); });
    $("#imprimir-album").addEventListener("click", () => App.imprimir("album"));
  }

  return { mostrar };
})();
