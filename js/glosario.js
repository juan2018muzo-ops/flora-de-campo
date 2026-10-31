/*
 * Catálogo > Glosario: vocabulario de LA_HOJA (y complementario) con su ilustración,
 * definición, categoría, fuente y ejemplo. Se genera desde VOCABULARIO.
 */

const Glosario = (function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => App.escapar(s);
  const FUENTE = { LA_HOJA: "LA_HOJA", guia: "Guía de campo", complementario: "Complementario" };

  let entradas = null;
  let texto = "";
  let categoria = "";

  // Una entrada por término, más los caracteres que solo admiten presente/ausente (lígula, estipelas…).
  function construir() {
    const lista = [];
    VOCABULARIO.categorias.forEach(cat => cat.caracteres.forEach(c => {
      const fuenteC = c.fuente || cat.fuente;
      if (c.soloPresencia) {
        lista.push({ id: c.id, nombre: c.nombre, def: c.ayuda || "", ejemplo: "", sinonimos: [], cat, car: c, fuente: fuenteC, svg: null });
        return;
      }
      c.terminos.forEach(t => lista.push({
        id: t.id, nombre: t.nombre, def: t.def, ejemplo: t.ejemplo, sinonimos: t.sinonimos, nota: t.nota,
        cat, car: c, fuente: t.fuente || fuenteC, svg: Ilustraciones.svg(t.id)
      }));
    }));
    lista.forEach(e => {
      e.busqueda = [e.nombre, e.def, e.ejemplo, e.sinonimos.join(" "), e.car.nombre].join(" ").toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "");
    });
    return lista;
  }

  function mostrar() {
    if (!entradas) entradas = construir();
    const cont = $("#glosario");
    if (cont.dataset.listo) return;
    cont.dataset.listo = "1";
    const conDibujo = entradas.filter(e => e.svg).length;
    cont.innerHTML = `
      <p class="contador">${entradas.length} términos · ${conDibujo} con ilustración</p>
      <details class="lotes">
        <summary>Estado de las ilustraciones por lote</summary>
        <ul>${Ilustraciones.LOTES.map(l => `<li><strong>Lote ${l.id}. ${esc(l.nombre)}</strong>: ${esc(l.estado)}</li>`).join("")}</ul>
      </details>
      <div class="filtros-glosario">
        <input type="search" id="buscar-termino" placeholder="Buscar término" aria-label="Buscar término">
        <select id="categoria-glosario" aria-label="Categoría">
          <option value="">Todas las categorías</option>
          ${VOCABULARIO.categorias.map(c => `<option value="${c.id}">${c.id}. ${esc(c.nombre)}</option>`).join("")}
        </select>
      </div>
      <p class="contador" id="contador-glosario"></p>
      <ul class="glosario-lista" id="glosario-lista"></ul>`;
    $("#buscar-termino").addEventListener("input", ev => { texto = ev.target.value; filtrar(); });
    $("#categoria-glosario").addEventListener("change", ev => { categoria = ev.target.value; filtrar(); });
    filtrar();
  }

  function tarjeta(e) {
    const lote = Ilustraciones.loteDe(e.car.id);
    const dibujo = e.svg
      ? e.svg
      : `<span class="ilus-pendiente">${lote ? `Ilustración: lote ${lote.id}` : "Sin ilustración"}</span>`;
    return `
      <li class="termino" id="termino-${esc(e.id)}">
        <div class="termino-dibujo">${dibujo}</div>
        <div class="termino-texto">
          <h4>${esc(e.nombre)}</h4>
          <p class="termino-cat">${e.cat.id}. ${esc(e.car.nombre)} <span class="insignia ${e.fuente}">${FUENTE[e.fuente]}</span></p>
          ${e.def ? `<p>${esc(e.def)}</p>` : ""}
          ${e.sinonimos.length ? `<p class="termino-extra"><span>Sinónimos:</span> ${esc(e.sinonimos.join(", "))}</p>` : ""}
          ${e.ejemplo ? `<p class="termino-extra"><span>Ejemplo:</span> <em>${esc(e.ejemplo)}</em></p>` : ""}
          ${e.nota ? `<p class="termino-extra"><span>Nota:</span> ${esc(e.nota)}</p>` : ""}
        </div>
      </li>`;
  }

  function filtrar() {
    const q = texto.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const visibles = entradas.filter(e => (!categoria || e.cat.id === categoria) && (!q || e.busqueda.includes(q)));
    $("#contador-glosario").textContent = visibles.length === entradas.length ? "" : `${visibles.length} de ${entradas.length} términos`;
    $("#glosario-lista").innerHTML = visibles.length
      ? visibles.map(tarjeta).join("")
      : `<li class="nota">No hay términos que coincidan.</li>`;
  }

  return { mostrar };
})();
