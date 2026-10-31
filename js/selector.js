/*
 * Selectores de características por categoría (botones "chip" con tres estados).
 * Los usan Registrar (para describir una especie) e Identificar (para describir
 * la planta que se tiene delante).
 *
 * Selector.crear(contenedor, registro, alCambiar)
 *   registro:  objeto { idCaracter: { estado, valores } } que se modifica en el sitio
 *   alCambiar: función llamada tras cada cambio
 * Devuelve { actualizar } para redibujar el estado tras cambiar `registro` desde fuera.
 */

const Selector = (function () {
  const esc = s => App.escapar(s);

  function dibujarCaracter(c) {
    const chips = c.soloPresencia
      ? `<button type="button" class="chip" data-presente>Presente</button>`
      : c.terminos.map(t => {
        const dibujo = Ilustraciones.svg(t.id, { compacto: true });
        return `<button type="button" class="chip${dibujo ? " con-ilus" : ""}" data-termino="${t.id}" title="${esc(t.def)}">${dibujo ? `<span class="chip-ilus">${dibujo}</span>` : ""}${esc(t.nombre)}</button>`;
      }).join("");
    const ausente = c.admiteAusente ? `<button type="button" class="chip chip-ausente" data-ausente>Ausente</button>` : "";
    const fuente = c.fuente || Morfologia.categoriaDe[c.id].fuente;
    const ayuda = [
      c.ayuda ? `<p>${esc(c.ayuda)}</p>` : "",
      c.terminos.length ? `<dl>${c.terminos.filter(t => t.def).map(t => `<dt>${esc(t.nombre)}</dt><dd>${esc(t.def)}${t.ejemplo ? ` <em>Ej.: ${esc(t.ejemplo)}</em>` : ""}</dd>`).join("")}</dl>` : "",
      fuente === "complementario" ? `<p class="fuente">Carácter complementario (no está en LA_HOJA).</p>` : ""
    ].join("");
    return `
      <div class="caracter" data-car="${c.id}">
        <div class="car-cabecera">
          <span class="car-nombre">${esc(c.nombre)}${c.multiple ? ` <small>(uno o varios)</small>` : ""}</span>
          ${ayuda ? `<button type="button" class="info" data-info aria-label="Ver definiciones de ${esc(c.nombre)}" aria-expanded="false">?</button>` : ""}
        </div>
        ${ayuda ? `<div class="car-ayuda" hidden>${ayuda}</div>` : ""}
        <div class="chips">${chips}${ausente}</div>
        <p class="car-estado" data-estado></p>
      </div>`;
  }

  function crear(cont, registro, alCambiar) {
    cont.innerHTML = Morfologia.categoriasEspecie.map((cat, i) => `
      <details class="categoria" data-cat="${cat.id}" ${i === 0 ? "open" : ""}>
        <summary><span>${cat.id}. ${esc(cat.nombre)}</span><span class="cuenta" data-cuenta></span></summary>
        ${cat.caracteres.map(dibujarCaracter).join("")}
      </details>`).join("");

    // Refleja el estado en los botones, oculta lo que no aplica y cuenta lo marcado.
    function actualizar() {
      cont.querySelectorAll(".caracter").forEach(el => {
        const c = Morfologia.caracteres[el.dataset.car];
        const v = registro[c.id];
        el.hidden = !Morfologia.aplica(c, registro);
        el.querySelectorAll("[data-termino]").forEach(b => b.setAttribute("aria-pressed", String(!!v && v.estado === "presente" && v.valores.includes(b.dataset.termino))));
        const p = el.querySelector("[data-presente]");
        if (p) p.setAttribute("aria-pressed", String(!!v && v.estado === "presente"));
        const a = el.querySelector("[data-ausente]");
        if (a) a.setAttribute("aria-pressed", String(!!v && v.estado === "ausente"));
        const est = el.querySelector("[data-estado]");
        est.textContent = v ? (v.estado === "ausente" ? "Ausente (comprobado)" : "Presente: " + Morfologia.texto(c, v)) : "No observado";
        est.className = "car-estado " + (v ? v.estado : "no-observado");
      });
      const limpio = Morfologia.limpiar(registro);
      cont.querySelectorAll(".categoria").forEach(d => {
        const cat = VOCABULARIO.categorias.find(x => x.id === d.dataset.cat);
        const n = cat.caracteres.filter(c => limpio[c.id]).length;
        d.querySelector("[data-cuenta]").textContent = n ? `${n} marcado${n > 1 ? "s" : ""}` : "";
      });
    }

    function tocar(boton) {
      const c = Morfologia.caracteres[boton.closest(".caracter").dataset.car];
      const v = registro[c.id];
      if (boton.hasAttribute("data-ausente")) {
        if (v && v.estado === "ausente") delete registro[c.id];
        else registro[c.id] = { estado: "ausente", valores: [] };
      } else if (boton.hasAttribute("data-presente")) {
        if (v && v.estado === "presente") delete registro[c.id];
        else registro[c.id] = { estado: "presente", valores: [] };
      } else {
        const t = boton.dataset.termino;
        let valores = v && v.estado === "presente" ? v.valores.slice() : [];
        if (valores.includes(t)) valores = valores.filter(x => x !== t);
        else valores = c.multiple ? valores.concat(t) : [t];
        if (valores.length) registro[c.id] = { estado: "presente", valores: valores };
        else delete registro[c.id];
      }
      actualizar();
      if (alCambiar) alCambiar();
    }

    cont.addEventListener("click", ev => {
      const chip = ev.target.closest(".chip");
      if (chip) { tocar(chip); return; }
      const info = ev.target.closest("[data-info]");
      if (info) {
        const ayuda = info.closest(".caracter").querySelector(".car-ayuda");
        ayuda.hidden = !ayuda.hidden;
        info.setAttribute("aria-expanded", String(!ayuda.hidden));
      }
    });

    actualizar();
    return { actualizar };
  }

  return { crear };
})();
