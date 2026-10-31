/*
 * Lógica compartida sobre caracteres morfológicos: índices del vocabulario,
 * dependencias (aplicaSi), limpieza de registros y comparación entre dos valores.
 *
 * Un valor de carácter es { estado: "presente"|"ausente", valores: [] }.
 * Un carácter sin valor (undefined) está "no observado".
 */

const Morfologia = (function () {
  const caracteres = {};
  const terminos = {};
  const categoriaDe = {};
  VOCABULARIO.categorias.forEach(cat => cat.caracteres.forEach(c => {
    caracteres[c.id] = c;
    categoriaDe[c.id] = cat;
    c.terminos.forEach(t => { terminos[t.id] = Object.assign({ caracter: c.id }, t); });
  }));

  // Categorías que describen a la planta (O, ambiente, va en la estación de muestreo).
  const categoriasEspecie = VOCABULARIO.categorias.filter(cat => cat.id !== "O");

  // ¿Corresponde preguntar o comparar el carácter `c` dado lo registrado?
  function aplica(c, registro) {
    if (!c.aplicaSi) return true;
    const padre = caracteres[c.aplicaSi.caracter];
    if (!aplica(padre, registro)) return false;
    const v = registro[c.aplicaSi.caracter];
    if (!v || v.estado !== "presente") return false;
    if (c.aplicaSi.presente) return true;
    return v.valores.some(x => c.aplicaSi.valores.includes(x));
  }

  // Quita valores vacíos, estados no permitidos y caracteres que ya no aplican.
  function limpiar(registro) {
    const r = {};
    for (const id of Object.keys(registro || {})) {
      const c = caracteres[id];
      const v = registro[id];
      if (!c || !v) continue;
      if (v.estado === "ausente") {
        if (c.admiteAusente) r[id] = { estado: "ausente", valores: [] };
      } else if (v.estado === "presente") {
        const valores = (v.valores || []).filter(x => terminos[x] && terminos[x].caracter === id);
        if (c.soloPresencia) r[id] = { estado: "presente", valores: [] };
        else if (valores.length) r[id] = { estado: "presente", valores: c.multiple ? valores : valores.slice(0, 1) };
      }
    }
    let cambio = true;
    while (cambio) {
      cambio = false;
      for (const id of Object.keys(r)) {
        if (!aplica(caracteres[id], r)) { delete r[id]; cambio = true; }
      }
    }
    return r;
  }

  /*
   * Compara dos valores del mismo carácter:
   *   "no_comparable" si alguno no fue observado,
   *   "coincide" si tienen el mismo estado y (si son presentes) comparten al menos un término,
   *   "difiere" en otro caso.
   */
  function comparar(a, b) {
    if (!a || !b) return "no_comparable";
    if (a.estado !== b.estado) return "difiere";
    if (a.estado === "ausente") return "coincide";
    if (!a.valores.length || !b.valores.length) return "coincide";
    return a.valores.some(v => b.valores.includes(v)) ? "coincide" : "difiere";
  }

  function nombreTermino(id) {
    return terminos[id] ? terminos[id].nombre : id;
  }

  function texto(c, v) {
    if (!v) return "No observado";
    if (v.estado === "ausente") return "Ausente";
    if (c.soloPresencia) return "Presente";
    return v.valores.map(nombreTermino).join(", ");
  }

  function contarDocumentados(registro) {
    return Object.keys(limpiar(registro)).length;
  }

  return { caracteres, terminos, categoriaDe, categoriasEspecie, aplica, limpiar, comparar, texto, nombreTermino, contarDocumentados };
})();
