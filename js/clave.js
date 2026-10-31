/*
 * Pestaña Claves botánicas: genera una clave dicotómica a partir de las especies
 * registradas, la muestra en formato tradicional (1a / 1b) y permite editar los textos.
 *
 * Reglas (sección 4 del plan):
 *   - En cada paso solo se usan caracteres documentados (presente con valores, o ausente)
 *     en TODAS las especies del grupo. "No observado" nunca se usa ni se toma como ausente.
 *   - Cada división separa los valores en dos conjuntos mutuamente excluyentes: ninguna
 *     especie puede caer en ambos lados (por ejemplo, si una tiene margen entero y aserrado,
 *     esos dos valores quedan del mismo lado).
 *   - Se prefiere la división más equilibrada; a igualdad, la de alternativas más simples
 *     (menos valores por lado) y luego el carácter de la categoría más general (A, B, C…).
 *   - Si ningún carácter separa un grupo, no se inventa una división: se avisa.
 */

const Clave = (function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => App.escapar(s);
  const CLAVE_TEXTOS = "flora-clave-textos";
  const CLAVE_TITULO = "flora-clave-titulo";

  const AUSENTE = "__ausente", PRESENTE = "__presente";

  // Orden de los caracteres según el vocabulario (los más generales primero).
  const orden = {};
  let n = 0;
  Morfologia.categoriasEspecie.forEach(cat => cat.caracteres.forEach(c => { if (!c.opcional) orden[c.id] = n++; }));

  // Valores documentados de un carácter en una especie, o null si no se puede usar.
  function documentado(c, reg) {
    if (!Morfologia.aplica(c, reg)) return null;
    const v = reg[c.id];
    if (!v) return null;
    if (v.estado === "ausente") return [AUSENTE];
    if (c.soloPresencia) return [PRESENTE];
    return v.valores.length ? v.valores : null;
  }

  // Mejor división de `grupo` usando el carácter `c`, o null si no lo separa.
  function dividir(c, grupo) {
    const conjuntos = grupo.map(e => documentado(c, e.caracteres || {}));
    if (conjuntos.some(x => !x)) return null;

    // Valores que aparecen juntos en una misma especie deben quedar del mismo lado.
    const padre = {};
    const raiz = v => (padre[v] === v ? v : (padre[v] = raiz(padre[v])));
    conjuntos.forEach(cj => cj.forEach(v => { if (!(v in padre)) padre[v] = v; }));
    conjuntos.forEach(cj => cj.slice(1).forEach(v => { padre[raiz(v)] = raiz(cj[0]); }));
    const componentes = {};
    conjuntos.forEach((cj, i) => {
      const k = raiz(cj[0]);
      (componentes[k] = componentes[k] || { valores: new Set(), especies: [] }).especies.push(grupo[i]);
      cj.forEach(v => componentes[k].valores.add(v));
    });
    const comps = Object.values(componentes);
    if (comps.length < 2) return null;

    // Reparto en dos lados lo más equilibrado posible.
    let mejor = null;
    if (comps.length <= 14) {
      for (let m = 1; m < 1 << (comps.length - 1); m++) {
        let a = 0;
        comps.forEach((cp, i) => { if (m & (1 << i)) a += cp.especies.length; });
        const dif = Math.abs(grupo.length - 2 * a);
        if (!mejor || dif < mejor.dif) mejor = { dif, m };
      }
    } else {
      // Muchos valores: reparto voraz, de mayor a menor.
      const idx = comps.map((cp, i) => i).sort((x, y) => comps[y].especies.length - comps[x].especies.length);
      let a = 0, b = 0, m = 0;
      idx.forEach(i => { if (a <= b) { a += comps[i].especies.length; m |= 1 << i; } else b += comps[i].especies.length; });
      mejor = { dif: Math.abs(a - b), m };
    }
    const lados = [{ valores: [], especies: [] }, { valores: [], especies: [] }];
    comps.forEach((cp, i) => {
      const l = lados[mejor.m & (1 << i) ? 0 : 1];
      l.valores.push(...cp.valores);
      l.especies.push(...cp.especies);
    });
    // Orden estable: primero el lado con el término que aparece antes en el vocabulario.
    const posicion = v => v === PRESENTE ? -2 : v === AUSENTE ? 1e6 : c.terminos.findIndex(t => t.id === v);
    lados.forEach(l => l.valores.sort((x, y) => posicion(x) - posicion(y)));
    lados.sort((x, y) => posicion(x.valores[0]) - posicion(y.valores[0]));
    return {
      c, lados,
      menor: Math.min(lados[0].especies.length, lados[1].especies.length),
      valores: lados[0].valores.length + lados[1].valores.length
    };
  }

  function construir(grupo) {
    if (grupo.length === 1) return { tipo: "especie", especie: grupo[0] };
    let mejor = null;
    for (const c of Object.values(Morfologia.caracteres)) {
      if (!(c.id in orden)) continue;
      const d = dividir(c, grupo);
      if (!d) continue;
      // 1) más equilibrada; 2) alternativas más simples (menos valores); 3) carácter más general.
      if (!mejor || d.menor > mejor.menor ||
          (d.menor === mejor.menor && (d.valores < mejor.valores ||
            (d.valores === mejor.valores && orden[c.id] < orden[mejor.c.id])))) mejor = d;
    }
    if (!mejor) return { tipo: "indistinguible", especies: grupo };
    return {
      tipo: "par", c: mejor.c,
      ramas: mejor.lados.map(l => ({ valores: l.valores, hijo: construir(l.especies) }))
    };
  }

  // --- Textos ---------------------------------------------------------------------------

  let textos = {};
  try { textos = JSON.parse(localStorage.getItem(CLAVE_TEXTOS) || "{}"); } catch (e) { textos = {}; }
  function guardarTextos() { try { localStorage.setItem(CLAVE_TEXTOS, JSON.stringify(textos)); } catch (e) { /* sin almacenamiento */ } }

  const claveTexto = (c, valores) => c.id + "=" + valores.slice().sort().join("+");

  function textoAutomatico(c, valores) {
    if (valores[0] === AUSENTE) return `${c.nombre}: ausente`;
    if (valores[0] === PRESENTE) return `${c.nombre}: presente`;
    return `${c.nombre}: ${valores.map(v => Morfologia.nombreTermino(v).toLowerCase()).join(" o ")}`;
  }
  const texto = (c, valores) => textos[claveTexto(c, valores)] || textoAutomatico(c, valores);

  // Numera los pares en preorden y devuelve la lista plana para mostrarla.
  function aplanar(raiz) {
    const pares = [];
    let siguiente = 1;
    (function visitar(nodo) {
      if (nodo.tipo !== "par") return;
      nodo.numero = siguiente++;
      pares.push(nodo);
      nodo.ramas.forEach(r => visitar(r.hijo));
    })(raiz);
    return pares;
  }

  function destino(hijo) {
    if (hijo.tipo === "par") return { texto: String(hijo.numero), html: `<span class="destino-num">${hijo.numero}</span>` };
    if (hijo.tipo === "especie") return { texto: hijo.especie.nombreCientifico, html: `<em>${esc(hijo.especie.nombreCientifico)}</em>` };
    const nombres = hijo.especies.map(e => e.nombreCientifico).join(", ");
    return { texto: `[no separables: ${nombres}]`, html: `<span class="indistinguible">No separables con los datos: ${hijo.especies.map(e => `<em>${esc(e.nombreCientifico)}</em>`).join(", ")}</span>` };
  }

  function indistinguibles(raiz) {
    const lista = [];
    (function visitar(nodo) {
      if (nodo.tipo === "indistinguible") lista.push(nodo.especies);
      if (nodo.tipo === "par") nodo.ramas.forEach(r => visitar(r.hijo));
    })(raiz);
    return lista;
  }

  // --- Pantalla ---------------------------------------------------------------------------

  let seleccion = null; // ids de especies incluidas (null = todas)
  let editando = false;
  let titulo = "";
  try { titulo = localStorage.getItem(CLAVE_TITULO) || ""; } catch (e) { titulo = ""; }

  async function mostrar() {
    const [especies, estaciones] = await Promise.all([DB.listar("especies"), DB.listar("estaciones")]);
    especies.sort((a, b) => a.nombreCientifico.localeCompare(b.nombreCientifico, "es"));
    const cont = $("#vista-claves");
    if (seleccion) seleccion = seleccion.filter(id => especies.some(e => e.id === id));
    const elegidas = especies.filter(e => !seleccion || seleccion.includes(e.id));
    const porEstacion = new Map(estaciones.map(s => [s.id, s]));

    cont.innerHTML = `
      <div class="no-imprimir">
        <h2>Claves botánicas</h2>
        <p class="intro">Clave dicotómica generada a partir de las características registradas. Revísela y corrija los textos antes de imprimirla.</p>
      </div>
      ${especies.length < 2 ? `<div class="vacio"><p>Se necesitan al menos dos especies registradas para construir una clave.</p><a class="boton primario" href="#registrar">Registrar especies</a></div>` : `
      <details class="bloque no-imprimir" id="elegir-especies">
        <summary><strong>Especies incluidas: ${elegidas.length} de ${especies.length}</strong></summary>
        <div class="fila">
          <button type="button" class="boton" data-todas>Todas</button>
          <button type="button" class="boton" data-ninguna>Ninguna</button>
        </div>
        ${estaciones.length > 1 ? `<label class="campo"><span>Solo una estación</span><select id="clave-estacion"><option value="">Elegir…</option>${estaciones.map(s => `<option value="${esc(s.id)}">${esc(Catalogo.nombreEstacion(s))}</option>`).join("")}</select></label>` : ""}
        <ul class="lista-elegir">
          ${especies.map(e => `<li><label><input type="checkbox" value="${esc(e.id)}" ${elegidas.includes(e) ? "checked" : ""}> <em>${esc(e.nombreCientifico)}</em> <span class="nota">${esc(e.familia || "")}${porEstacion.get(e.estacionId) ? " · " + esc(porEstacion.get(e.estacionId).nombre) : ""}</span></label></li>`).join("")}
        </ul>
      </details>
      <div id="clave-resultado"></div>`}`;

    if (especies.length < 2) return;
    conectarSeleccion(especies);
    dibujarClave(elegidas);
  }

  function conectarSeleccion(especies) {
    const det = $("#elegir-especies");
    det.addEventListener("change", ev => {
      if (ev.target.id === "clave-estacion") {
        const id = ev.target.value;
        if (id) seleccion = especies.filter(e => e.estacionId === id).map(e => e.id);
      } else if (ev.target.type === "checkbox") {
        seleccion = Array.from(det.querySelectorAll("input[type=checkbox]:checked")).map(x => x.value);
      }
      mostrar().then(() => { $("#elegir-especies").open = true; });
    });
    det.querySelector("[data-todas]").addEventListener("click", () => { seleccion = null; mostrar().then(() => { $("#elegir-especies").open = true; }); });
    det.querySelector("[data-ninguna]").addEventListener("click", () => { seleccion = []; mostrar().then(() => { $("#elegir-especies").open = true; }); });
  }

  function dibujarClave(elegidas) {
    const cont = $("#clave-resultado");
    if (elegidas.length < 2) {
      cont.innerHTML = `<p class="nota">Elija al menos dos especies.</p>`;
      return;
    }
    const raiz = construir(elegidas);
    const pares = aplanar(raiz);
    const sinSeparar = indistinguibles(raiz);
    const pocosDatos = elegidas.filter(e => Morfologia.contarDocumentados(e.caracteres || {}) < 3);
    const tituloAuto = `Clave para ${elegidas.length} especies registradas en la salida de campo`;

    const avisos = [];
    if (raiz.tipo === "indistinguible") {
      avisos.push(`<strong>No se puede construir la clave.</strong> Ningún carácter está documentado en todas las especies elegidas de forma que las separe. Registre más características (o márquelas como ausentes cuando corresponda).`);
    } else if (sinSeparar.length) {
      avisos.push(`<strong>Clave incompleta.</strong> ${sinSeparar.length === 1 ? "Un grupo de especies no se puede" : sinSeparar.length + " grupos de especies no se pueden"} separar con los caracteres documentados en todas ellas: ` +
        sinSeparar.map(g => g.map(e => `<em>${esc(e.nombreCientifico)}</em>`).join(" y ")).join("; ") +
        `. Registre algún carácter que las diferencie en todas (los "no observados" no se usan).`);
    }
    if (pocosDatos.length) {
      avisos.push(`Tienen menos de 3 caracteres registrados: ${pocosDatos.map(e => `<em>${esc(e.nombreCientifico)}</em>`).join(", ")}. La clave puede quedar pobre.`);
    }

    cont.innerHTML = `
      ${avisos.map(a => `<div class="advertencia no-imprimir">${a}</div>`).join("")}
      ${raiz.tipo === "par" ? `
      <div class="barra-clave no-imprimir">
        <button type="button" class="boton" id="editar-clave" aria-pressed="${editando}">${editando ? "Terminar edición" : "Editar textos"}</button>
        <button type="button" class="boton" id="copiar-clave">Copiar texto</button>
        <button type="button" class="boton primario" id="imprimir-clave">Imprimir o PDF</button>
      </div>
      ${editando ? `<p class="nota no-imprimir">Escriba directamente sobre cada alternativa. Los cambios se guardan en este navegador y se conservan si la clave se vuelve a generar. <button type="button" class="enlace" id="restaurar-textos">Restaurar textos automáticos</button></p>` : ""}
      <article class="clave-documento">
        ${editando
          ? `<input class="clave-titulo-input" id="clave-titulo" value="${esc(titulo || tituloAuto)}" aria-label="Título de la clave">`
          : `<h3 class="clave-titulo">${esc(titulo || tituloAuto)}</h3>`}
        <p class="nota">Generada el ${new Date().toLocaleDateString("es-CO")} a partir de ${elegidas.length} especies. Revise cada paso con los ejemplares.</p>
        <ol class="clave">
          ${pares.map(p => p.ramas.map((rama, i) => {
            const d = destino(rama.hijo);
            const t = texto(p.c, rama.valores);
            return `<li class="alternativa ${i ? "b" : "a"}">
              <span class="clave-num">${p.numero}${i ? "b" : "a"}.</span>
              ${editando
                ? `<input class="clave-input" data-clave="${esc(claveTexto(p.c, rama.valores))}" value="${esc(t)}" aria-label="Texto de ${p.numero}${i ? "b" : "a"}">`
                : `<span class="clave-texto">${esc(t)}</span>`}
              <span class="clave-puntos" aria-hidden="true"></span>
              <span class="clave-destino">${d.html}</span>
            </li>`;
          }).join("")).join("")}
        </ol>
      </article>` : ""}`;

    if (raiz.tipo !== "par") return;
    $("#editar-clave").addEventListener("click", () => { editando = !editando; dibujarClave(elegidas); });
    $("#imprimir-clave").addEventListener("click", () => App.imprimir("clave"));
    $("#copiar-clave").addEventListener("click", async () => {
      const lineas = [titulo || tituloAuto, ""];
      pares.forEach(p => p.ramas.forEach((rama, i) => {
        lineas.push(`${p.numero}${i ? "b" : "a"}. ${texto(p.c, rama.valores)} ..... ${destino(rama.hijo).texto}`);
      }));
      try { await navigator.clipboard.writeText(lineas.join("\n")); App.aviso("Clave copiada. Puede pegarla en un documento."); }
      catch (e) { App.aviso("No se pudo copiar automáticamente.", "error"); }
    });
    if (editando) {
      cont.querySelectorAll(".clave-input").forEach(inp => inp.addEventListener("input", () => {
        textos[inp.dataset.clave] = inp.value;
        guardarTextos();
      }));
      $("#clave-titulo").addEventListener("input", ev => {
        titulo = ev.target.value;
        try { localStorage.setItem(CLAVE_TITULO, titulo); } catch (e) { /* sin almacenamiento */ }
      });
      $("#restaurar-textos").addEventListener("click", () => {
        pares.forEach(p => p.ramas.forEach(rama => { delete textos[claveTexto(p.c, rama.valores)]; }));
        guardarTextos();
        titulo = "";
        try { localStorage.removeItem(CLAVE_TITULO); } catch (e) { /* sin almacenamiento */ }
        dibujarClave(elegidas);
      });
    }
  }

  return { mostrar, construir };
})();
