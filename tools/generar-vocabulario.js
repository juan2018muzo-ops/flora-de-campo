// Valida js/caracteres.js y genera docs/vocabulario.md para revisión.
// Uso: node tools/generar-vocabulario.js
const fs = require("fs");
const path = require("path");
const V = require("../js/caracteres.js");

const FUENTE = { LA_HOJA: "LA_HOJA", guia: "Guía de campo", complementario: "Complementario" };
const DEF = { LA_HOJA: "LA_HOJA", guia: "Guía de campo", complementaria: "Complementaria", mixta: "LA_HOJA + complementaria" };

// --- Validación -------------------------------------------------------------
const errores = [];
const caracteres = {};
const terminos = {};
for (const cat of V.categorias) {
  for (const c of cat.caracteres) {
    if (caracteres[c.id]) errores.push(`Carácter repetido: ${c.id}`);
    caracteres[c.id] = c;
    if (c.soloPresencia && c.terminos.length) errores.push(`${c.id}: soloPresencia no debe tener términos`);
    if (!c.soloPresencia && !c.terminos.length) errores.push(`${c.id}: no tiene términos`);
    if (c.soloPresencia && !c.admiteAusente) errores.push(`${c.id}: soloPresencia requiere admiteAusente`);
    for (const t of c.terminos) {
      if (terminos[t.id]) errores.push(`Término repetido: ${t.id} (en ${terminos[t.id]} y ${c.id})`);
      terminos[t.id] = c.id;
      if (!DEF[t.defFuente]) errores.push(`${t.id}: defFuente desconocida "${t.defFuente}"`);
    }
  }
}
for (const c of Object.values(caracteres)) {
  if (!c.aplicaSi) continue;
  const padre = caracteres[c.aplicaSi.caracter];
  if (!padre) { errores.push(`${c.id}: aplicaSi apunta a un carácter inexistente`); continue; }
  for (const v of c.aplicaSi.valores || []) {
    if (terminos[v] !== padre.id) errores.push(`${c.id}: aplicaSi usa "${v}", que no es un término de ${padre.id}`);
  }
}
if (errores.length) {
  console.error("ERRORES:\n" + errores.join("\n"));
  process.exit(1);
}

// --- Documento --------------------------------------------------------------
const nombreTermino = id => {
  const c = caracteres[terminos[id]];
  return c.terminos.find(t => t.id === id).nombre;
};
const celda = s => (s || "").replace(/\|/g, "/");
const L = [];
const nTerm = Object.keys(terminos).length;
const nCar = Object.keys(caracteres).length;

L.push("# Vocabulario morfológico");
L.push("");
L.push(`Versión ${V.version}. Generado desde \`js/caracteres.js\` (no edites este archivo a mano: se vuelve a generar). ${V.categorias.length} categorías, ${nCar} caracteres (selectores) y ${nTerm} términos.`);
L.push("");
L.push("## Cómo leer este documento");
L.push("- Cada **carácter** es un selector independiente en la app. Nunca se mezclan dos caracteres en un mismo selector.");
L.push("- **Fuente del carácter**: de dónde sale el término (LA_HOJA, guía de campo o complementario).");
L.push("- **Fuente de la definición**: LA_HOJA define muchos términos (venación, filotaxis, estípulas), pero otros solo los nombra (formas, bases, ápices, márgenes). Esas definiciones son botánicas estándar y quedan marcadas como *Complementaria*.");
L.push("- Estados de cada carácter en una especie:");
for (const v of Object.values(V.estados)) L.push(`  - ${v}`);
L.push("- **Admite ausente**: solo en los caracteres donde 'no tiene' es un dato botánico (estípulas, látex, flores…). En los demás, solo hay 'presente' o 'no observado'.");
L.push("- **Varios valores**: la especie puede tener más de un término a la vez (por ejemplo, márgenes que varían).");
L.push("");
L.push("## Decisiones sobre términos dudosos");
L.push("");
L.push("Aprobadas por el usuario tal como se propusieron (versión 1.0). Para cambiar alguna, se edita `js/caracteres.js` y se vuelve a generar este documento.");
L.push("");
const aclaraciones = [
  "**Ovada / aovada y obovada / trasovada.** La guía usa 'aovada' y 'trasovada', y LA_HOJA 'ovada' y 'obovada'. Las traté como **sinónimos** (un solo término con su sinónimo) para que la misma forma no quede partida en dos. ¿De acuerdo?",
  "**Digitada (guía) = palmaticompuesta (LA_HOJA).** Las dejé como sinónimos.",
  "**Escotada (guía) = ápice emarginado (LA_HOJA).** Las dejé como sinónimos.",
  "**Entera y enterísima.** La guía separa 'entera' (sin senos ni escotaduras) de 'enterísima' (sin dientes). En la app, 'entera' es el grado de división de la hoja simple (carácter B) y 'margen entero' corresponde a 'enterísima' (carácter F). ¿Te parece bien así?",
  "**Revoluto, involuto y plano.** LA_HOJA los pone en la lista de márgenes, pero describen otra cosa (hacia dónde se curva el borde) que los dientes. Los separé en **'Margen: curvatura'** para que una hoja pueda ser, por ejemplo, aserrada y revoluta a la vez.",
  "**Ondulado.** Lo dejé en el contorno del margen, junto a 'sinuado', como en LA_HOJA. En muchos textos 'ondulado' se refiere a ondas fuera del plano de la lámina, que sería curvatura. ¿Dónde lo prefieres?",
  "**Peltada.** LA_HOJA la usa en la lista de bases y al hablar del pecíolo (Victoria cruziana). Para no contarla dos veces, quedó **solo en Base (D)**.",
  "**Acicular y escuamiforme.** Están en la lista de formas de lámina de LA_HOJA (C) y también como tipos de hoja de gimnosperma (B). Dejé las dos, pero en una gimnosperma podrían contar dos veces al comparar. Propongo que en la identificación se cuenten como un solo rasgo cuando coinciden.",
  "**Hojas opuestas no decusadas.** LA_HOJA solo nombra la decusada (2 por nudo, en cruz). No agregué 'opuesta dística' porque no está en el documento. ¿La necesitas?",
  "**Hoja escurrida (guía).** La guía pone como ejemplo el girasol, que en realidad tiene hojas pecioladas. Dejé el término sin ese ejemplo.",
  "**Cuneiforme (guía).** La guía la describe como 'pico de pato'. La definí como 'en forma de cuña', que es el uso estándar, y menciono la frase de la guía.",
  "**Hoja nerviosa y hoja venosa (guía).** 'Nerviosa' quedó como sinónimo de paralelódroma. 'Venosa' (venas sobresalientes) no es un tipo de venación de Hickey, así que no la agregué como término. ¿Quieres un carácter aparte para 'venas prominentes en el envés'?",
  "**Dicotiledónea.** Uso este término porque es el que usa LA_HOJA, aunque en la clasificación actual se habla de eudicotiledóneas y magnólidas.",
  "**Número de piezas florales.** Las opciones '3, 4 o 5 o múltiplos' se solapan (6 es múltiplo de 3; 12 lo es de 3 y de 4). ¿Prefieres que se escriba el número exacto?",
  "**Conos de gimnospermas.** No son frutos. En gimnospermas propongo marcar 'Flores: ausente' y 'Frutos: ausente' y describir los conos en las observaciones.",
  "**Términos complementarios para aprobar**: consistencia e indumento de la lámina (J), todo el tallo (K), roseta y acuática (L), flor (M), fruto (N), 'caulinar', 'sésil simple', 'una vez pinnada' y 'zarcillo caulinar'. ¿Los dejo, quito o cambio alguno?",
  "**Figuras de LA_HOJA.** Las ilustraciones del documento (Carlton, Hickey) no se pueden leer como texto. Las definiciones de forma, base, ápice y margen se redactaron con el criterio botánico estándar. Revísalas con las figuras a la vista."
];
aclaraciones.forEach((a, i) => L.push(`${i + 1}. ${a}`));
L.push("");

for (const cat of V.categorias) {
  L.push(`## ${cat.id}. ${cat.nombre}`);
  L.push("");
  for (const c of cat.caracteres) {
    const fuenteC = FUENTE[c.fuente || cat.fuente];
    const props = [
      `Fuente: ${fuenteC}`,
      c.multiple ? "varios valores" : "un valor",
      c.admiteAusente ? "admite ausente" : "no admite ausente"
    ];
    if (c.opcional) props.push("opcional");
    L.push(`### ${c.nombre}`);
    L.push(`\`${c.id}\` · ${props.join(" · ")}`);
    if (c.aplicaSi) {
      const padre = caracteres[c.aplicaSi.caracter];
      const cond = c.aplicaSi.presente ? "está presente" : "es " + c.aplicaSi.valores.map(nombreTermino).join(" o ");
      L.push("");
      L.push(`*Solo se pregunta si "${padre.nombre}" ${cond}.*`);
    }
    if (c.ayuda) { L.push(""); L.push(`> ${c.ayuda}`); }
    L.push("");
    if (c.soloPresencia) {
      L.push("Solo se registra si está presente, ausente o no observado.");
      L.push("");
      continue;
    }
    L.push("| Término | Definición | Ejemplo | Fuente def. |");
    L.push("|---|---|---|---|");
    for (const t of c.terminos) {
      let nombre = `**${t.nombre}**`;
      if (t.fuente && t.fuente !== (c.fuente || cat.fuente)) nombre += ` (${FUENTE[t.fuente]})`;
      if (t.sinonimos.length) nombre += `<br>sin.: ${t.sinonimos.join(", ")}`;
      let def = t.def || "-";
      if (t.nota) def += ` *Nota: ${t.nota}*`;
      L.push(`| ${celda(nombre)} | ${celda(def)} | ${celda(t.ejemplo) || "-"} | ${DEF[t.defFuente]} |`);
    }
    L.push("");
  }
}

L.push("## Datos de la estación de muestreo");
L.push("Se escriben una vez por estación y se comparten entre todas las especies registradas allí.");
L.push("");
for (const f of V.camposEstacion) L.push(`- ${f.nombre}${f.sugerencias ? ` (sugerencias: ${f.sugerencias.join(", ")})` : ""}`);
L.push("");
L.push("## Tipos de fotografía");
L.push(V.tiposFoto.map(f => f.nombre).join(" · "));
L.push("");

const destino = path.join(__dirname, "..", "docs", "vocabulario.md");
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, L.join("\n"), "utf8");
console.log(`OK: ${V.categorias.length} categorías, ${nCar} caracteres, ${nTerm} términos -> ${destino}`);
