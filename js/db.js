/*
 * Almacenamiento local (IndexedDB), copia de seguridad e importación.
 *
 * Almacenes:
 *   estaciones  { id, nombre, fecha, municipio, vereda, localidad, zona, altitud,
 *                 temperatura, temperatura_suelo, humedad, observaciones, creado, modificado }
 *   especies    { id, nombreCientifico, nombreComun, familia, estacionId, colector,
 *                 numeroColeccion, fecha, observaciones, fotoPrincipalId,
 *                 caracteres: { <idCaracter>: { estado: "presente"|"ausente", valores: [] } },
 *                 creado, modificado }
 *                 Un carácter que no aparece en `caracteres` está "no observado".
 *   fotos       { id, especieId, tipo, descripcion, blob, creado, modificado }
 *
 * Archivo de respaldo (.json):
 *   { app: "identificador-plantas", formato: 1, exportado, estaciones[], especies[],
 *     fotos[] (con `datos` en base64 en lugar de `blob`) }
 */

const DB = (function () {
  const NOMBRE = "identificador-plantas";
  const VERSION = 1;
  const ALMACENES = ["estaciones", "especies", "fotos"];
  const FORMATO = 1;
  let conexion = null;

  function abrir() {
    if (conexion) return Promise.resolve(conexion);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(NOMBRE, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("estaciones")) db.createObjectStore("estaciones", { keyPath: "id" });
        if (!db.objectStoreNames.contains("especies")) {
          const s = db.createObjectStore("especies", { keyPath: "id" });
          s.createIndex("estacionId", "estacionId");
        }
        if (!db.objectStoreNames.contains("fotos")) {
          const s = db.createObjectStore("fotos", { keyPath: "id" });
          s.createIndex("especieId", "especieId");
        }
      };
      req.onsuccess = () => { conexion = req.result; resolve(conexion); };
      req.onerror = () => reject(req.error);
    });
  }

  function promesa(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Ejecuta `fn(stores)` dentro de una transacción y resuelve cuando se confirma.
  async function transaccion(nombres, modo, fn) {
    const db = await abrir();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(nombres, modo);
      const stores = {};
      nombres.forEach(n => { stores[n] = tx.objectStore(n); });
      let resultado;
      Promise.resolve(fn(stores)).then(r => { resultado = r; }, err => { tx.abort(); reject(err); });
      tx.oncomplete = () => resolve(resultado);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Transacción cancelada"));
    });
  }

  function nuevoId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    // Respaldo para navegadores sin randomUUID (p. ej. páginas abiertas como archivo).
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  // --- Operaciones básicas -----------------------------------------------------

  async function listar(almacen) {
    return transaccion([almacen], "readonly", s => promesa(s[almacen].getAll()));
  }

  async function obtener(almacen, id) {
    return transaccion([almacen], "readonly", s => promesa(s[almacen].get(id)));
  }

  // Guarda un registro: asigna id y fechas si faltan y actualiza `modificado`.
  async function guardar(almacen, registro) {
    const ahora = new Date().toISOString();
    const r = Object.assign({}, registro);
    if (!r.id) r.id = nuevoId();
    if (!r.creado) r.creado = ahora;
    r.modificado = ahora;
    await transaccion([almacen], "readwrite", s => promesa(s[almacen].put(r)));
    return r;
  }

  async function fotosDeEspecie(especieId) {
    return transaccion(["fotos"], "readonly", s => promesa(s.fotos.index("especieId").getAll(especieId)));
  }

  // Borra una especie junto con sus fotos.
  async function borrarEspecie(id) {
    return transaccion(["especies", "fotos"], "readwrite", async s => {
      const claves = await promesa(s.fotos.index("especieId").getAllKeys(id));
      claves.forEach(k => s.fotos.delete(k));
      s.especies.delete(id);
    });
  }

  // Borra una estación solo si ninguna especie la usa.
  async function borrarEstacion(id) {
    return transaccion(["estaciones", "especies"], "readwrite", async s => {
      const usos = await promesa(s.especies.index("estacionId").count(id));
      if (usos > 0) throw new Error(`La estación tiene ${usos} especie(s) registradas; no se puede borrar.`);
      s.estaciones.delete(id);
    });
  }

  async function borrar(almacen, id) {
    return transaccion([almacen], "readwrite", s => promesa(s[almacen].delete(id)));
  }

  async function borrarTodo() {
    return transaccion(ALMACENES, "readwrite", s => { ALMACENES.forEach(n => s[n].clear()); });
  }

  async function contar() {
    return transaccion(ALMACENES, "readonly", async s => {
      const r = {};
      for (const n of ALMACENES) r[n] = await promesa(s[n].count());
      return r;
    });
  }

  // --- Copia de seguridad --------------------------------------------------------

  function blobADatos(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(blob);
    });
  }

  async function datosABlob(datos) {
    const res = await fetch(datos);
    return res.blob();
  }

  async function exportar() {
    const [estaciones, especies, fotos] = await Promise.all(ALMACENES.map(listar));
    const fotosJson = [];
    for (const f of fotos) {
      const copia = Object.assign({}, f);
      delete copia.blob;
      copia.datos = f.blob ? await blobADatos(f.blob) : null;
      fotosJson.push(copia);
    }
    return {
      app: "identificador-plantas",
      formato: FORMATO,
      exportado: new Date().toISOString(),
      estaciones: estaciones,
      especies: especies,
      fotos: fotosJson
    };
  }

  function validarArchivo(datos) {
    if (!datos || datos.app !== "identificador-plantas") throw new Error("El archivo no es una copia de seguridad de esta aplicación.");
    if (datos.formato > FORMATO) throw new Error("El archivo viene de una versión más nueva de la aplicación. Actualícela antes de importar.");
    for (const n of ALMACENES) {
      if (!Array.isArray(datos[n])) throw new Error(`El archivo está incompleto: falta "${n}".`);
      for (const r of datos[n]) if (!r || !r.id) throw new Error(`Hay un registro sin identificador en "${n}".`);
    }
  }

  const normalizar = s => (s || "").trim().toLowerCase().replace(/\s+/g, " ");

  /*
   * Analiza un archivo antes de importarlo, sin modificar nada.
   * Devuelve qué pasaría en modo "agregar":
   *   nuevos, actualizados, sinCambio: conteos por almacén
   *   posiblesDuplicados: especies con otro id pero mismo nombre científico y misma estación
   */
  async function analizarImportacion(datos) {
    validarArchivo(datos);
    const existentes = {};
    for (const n of ALMACENES) {
      existentes[n] = new Map((await listar(n)).map(r => [r.id, r]));
    }
    const resumen = { nuevos: {}, actualizados: {}, sinCambio: {}, posiblesDuplicados: [] };
    for (const n of ALMACENES) {
      resumen.nuevos[n] = 0; resumen.actualizados[n] = 0; resumen.sinCambio[n] = 0;
      for (const r of datos[n]) {
        const actual = existentes[n].get(r.id);
        if (!actual) resumen.nuevos[n]++;
        else if ((r.modificado || "") > (actual.modificado || "")) resumen.actualizados[n]++;
        else resumen.sinCambio[n]++;
      }
    }
    const porClave = new Map();
    for (const e of existentes.especies.values()) {
      const nombre = normalizar(e.nombreCientifico);
      if (nombre) porClave.set(nombre + "|" + (e.estacionId || ""), e);
    }
    for (const e of datos.especies) {
      if (existentes.especies.has(e.id)) continue;
      const nombre = normalizar(e.nombreCientifico);
      const previa = nombre && porClave.get(nombre + "|" + (e.estacionId || ""));
      if (previa) resumen.posiblesDuplicados.push({ entrante: e, existente: previa });
    }
    return resumen;
  }

  /*
   * Importa un archivo.
   *   modo: "agregar"   -> conserva lo que hay; un registro con el mismo id solo se
   *                        sobrescribe si el del archivo es más reciente.
   *         "reemplazar" -> borra todo y deja exactamente lo que trae el archivo.
   *   omitirIds: ids de especies (posibles duplicados) que el usuario decidió no importar;
   *              sus fotos tampoco se importan.
   */
  async function importar(datos, modo, omitirIds) {
    validarArchivo(datos);
    const omitir = new Set(omitirIds || []);
    // Las fotos se convierten antes de abrir la transacción (IndexedDB no admite esperas externas).
    const fotos = [];
    for (const f of datos.fotos) {
      if (omitir.has(f.especieId)) continue;
      const copia = Object.assign({}, f);
      delete copia.datos;
      copia.blob = f.datos ? await datosABlob(f.datos) : null;
      fotos.push(copia);
    }
    const entrantes = {
      estaciones: datos.estaciones,
      especies: datos.especies.filter(e => !omitir.has(e.id)),
      fotos: fotos
    };
    return transaccion(ALMACENES, "readwrite", async s => {
      const cuenta = { escritos: 0, omitidos: omitir.size };
      if (modo === "reemplazar") ALMACENES.forEach(n => s[n].clear());
      for (const n of ALMACENES) {
        for (const r of entrantes[n]) {
          if (modo !== "reemplazar") {
            const actual = await promesa(s[n].get(r.id));
            if (actual && (r.modificado || "") <= (actual.modificado || "")) continue;
          }
          s[n].put(r);
          cuenta.escritos++;
        }
      }
      return cuenta;
    });
  }

  // Pide al navegador que no borre los datos cuando falte espacio.
  async function pedirPersistencia() {
    if (navigator.storage && navigator.storage.persist) {
      try { return await navigator.storage.persist(); } catch (e) { return false; }
    }
    return false;
  }

  async function espacio() {
    if (navigator.storage && navigator.storage.estimate) {
      try { return await navigator.storage.estimate(); } catch (e) { return null; }
    }
    return null;
  }

  return {
    abrir, nuevoId, listar, obtener, guardar, borrar, borrarEspecie, borrarEstacion, borrarTodo,
    fotosDeEspecie, contar, exportar, analizarImportacion, importar, pedirPersistencia, espacio
  };
})();
