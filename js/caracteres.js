/*
 * Vocabulario morfológico del Identificador de plantas (Biología Vegetal II).
 *
 * Referencia principal: documento LA_HOJA. Segunda fuente: guía de salida de campo.
 * Lo que no está en esos documentos se marca como "complementario".
 *
 * Estructura:
 *   VOCABULARIO.categorias[]  -> categorías A..P
 *     .caracteres[]           -> cada carácter es UN selector independiente
 *       .terminos[]           -> valores posibles del carácter
 *
 * Cada carácter de una especie se registra en uno de tres estados:
 *   "presente" (con uno o varios términos), "ausente" (solo si admiteAusente)
 *   o "no_observado" (valor por defecto; nunca equivale a ausente).
 *
 * Campos de un carácter:
 *   id, nombre, ayuda
 *   fuente        "LA_HOJA" | "guia" | "complementario" (por defecto la de su categoría)
 *   multiple      true si una especie puede tener varios términos a la vez
 *   admiteAusente true si "ausente" tiene sentido botánico
 *   soloPresencia true si el carácter no tiene términos, solo presente/ausente
 *   aplicaSi      { caracter, valores } o { caracter, presente: true }:
 *                 el carácter solo se pregunta y se compara cuando se cumple
 *   opcional      true para caracteres que rara vez se observan en campo
 *
 * Campos de un término:
 *   id, nombre, def, defFuente ("LA_HOJA" | "guia" | "complementaria" | "mixta"),
 *   ejemplo (especies citadas en LA_HOJA o en la guía), sinonimos[], nota, fuente
 */

function t(id, nombre, def, extra) {
  return Object.assign({ id: id, nombre: nombre, def: def, defFuente: "LA_HOJA", ejemplo: "", sinonimos: [], nota: "" }, extra || {});
}

const VOCABULARIO = {
  version: "1.0",
  estados: {
    presente: "Presente: se observó e identificó.",
    ausente: "Ausente: se comprobó que la característica no existe en la planta.",
    no_observado: "No observado: no fue posible determinarla en campo. No equivale a ausente."
  },

  categorias: [
    // ------------------------------------------------------------------ A
    {
      id: "A", nombre: "Grupo vegetal", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "grupo", nombre: "Grupo vegetal", multiple: false, admiteAusente: false,
          ayuda: "Gran grupo de plantas vasculares. LA_HOJA trata por separado las hojas de dicotiledóneas, monocotiledóneas, gimnospermas y pteridofitas.",
          terminos: [
            t("dicotiledonea", "Angiosperma: dicotiledónea",
              "Planta con flor cuyo embrión tiene dos cotiledones. Sus hojas suelen tener lámina, pecíolo, base foliar y a veces estípulas, con venación cerrada (en red).",
              { ejemplo: "Hibiscus rosa-sinensis (rosa china)" }),
            t("monocotiledonea", "Angiosperma: monocotiledónea",
              "Planta con flor cuyo embrión tiene un cotiledón. Sus hojas son generalmente enteras, con venación paralela y vaina siempre bien desarrollada.",
              { ejemplo: "Zea mays (maíz), Tulipa, Canna indica (achira)" }),
            t("gimnosperma", "Gimnosperma",
              "Planta con semillas pero sin flores ni frutos verdaderos. Su hoja típica es acicular o escuamiforme, aunque hay excepciones: hojas en abanico (Ginkgo), pinnaticompuestas (Cycas) o pecioladas (Gnetum).",
              { defFuente: "mixta", ejemplo: "Pinus, Thuja, Araucaria angustifolia, Ginkgo biloba",
                nota: "LA_HOJA describe las hojas; 'sin flores ni frutos verdaderos' es complementario." }),
            t("pteridofita", "Helecho o planta afín (pteridofita)",
              "Planta vascular sin semillas. Tiene micrófilos (Selaginella, Lycopodium) o megáfilos llamados frondes (helechos), con prefoliación circinada.",
              { ejemplo: "Selaginella sellowii, Lycopodium, Nephrolepis cordifolia, Adiantum" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ B
    {
      id: "B", nombre: "Tipo y organización de la hoja", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "b_tipo", nombre: "Tipo de hoja", multiple: false, admiteAusente: false,
          ayuda: "Mire dónde está la yema axilar: está en la base del pecíolo de la hoja completa, nunca en la base de cada folíolo.",
          terminos: [
            t("simple", "Simple",
              "Hoja con una sola lámina foliar. Puede estar dividida (fida, partida o secta), pero sus porciones no son folíolos articulados.",
              { ejemplo: "Eugenia uniflora (ñangapiré)" }),
            t("compuesta", "Compuesta",
              "Lámina dividida en folíolos articulados sobre el raquis o sus divisiones. Los folíolos pueden tener peciólulos o ser sésiles.",
              { ejemplo: "Fraxinus (fresno), Erythrina crista-galli (ceibo)" })
          ]
        },
        {
          id: "b_division", nombre: "Grado de división de la hoja simple", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "b_tipo", valores: ["simple"] },
          ayuda: "Compare la profundidad de las incisiones con la distancia entre el borde y el nervio.",
          terminos: [
            t("entera", "Entera", "Lámina sin incisiones.", { ejemplo: "Eugenia uniflora (ñangapiré)" }),
            t("fida", "Fida o lobada", "Incisiones que no llegan a la mitad de la distancia entre el borde y el nervio (menos del 50 %).",
              { ejemplo: "Turnera sidoides (pinnatífida), Platanus (palmatífida)", sinonimos: ["hendida", "lobada"] }),
            t("partida", "Partida", "Incisiones que pasan la mitad de esa distancia (más del 50 %).",
              { ejemplo: "Quercus robur (pinnatipartida), Passiflora caerulea (palmatipartida)" }),
            t("secta", "Secta", "Incisiones que llegan casi hasta el nervio, o hasta él. Las porciones tienen base ancha y no están articuladas.",
              { ejemplo: "Taraxacum officinale (pinnatisecta), Manihot esculenta (palmatisecta), Dahlia, Foeniculum" })
          ]
        },
        {
          id: "b_division_disposicion", nombre: "Disposición de las divisiones", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "b_division", valores: ["fida", "partida", "secta"] },
          ayuda: "Al combinar este carácter con el anterior salen los nombres de LA_HOJA: pinnatífida, pinnatipartida, pinnatisecta, palmatífida, palmatipartida y palmatisecta.",
          terminos: [
            t("pinnada", "Pinnada (pinnati-)", "Las divisiones se disponen a lo largo del nervio medio.",
              { defFuente: "complementaria", ejemplo: "Turnera sidoides, Quercus robur, Taraxacum officinale" }),
            t("palmada", "Palmeada (palmati-)", "Las divisiones salen de un mismo punto en la base de la lámina.",
              { defFuente: "complementaria", ejemplo: "Platanus, Passiflora caerulea, Manihot esculenta (yuca)" })
          ]
        },
        {
          id: "b_compuesta", nombre: "Organización de la hoja compuesta", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "b_tipo", valores: ["compuesta"] },
          terminos: [
            t("unifoliolada", "Unifoliolada", "Un solo folíolo, articulado con el pecíolo.", { ejemplo: "Citrus aurantium (naranjo agrio)" }),
            t("bifoliolada", "Bifoliolada", "Dos folíolos.", { ejemplo: "Melicoccus lepidopetalus (coquito de San Juan)" }),
            t("trifoliolada", "Trifoliolada o ternada", "Tres folíolos.", { ejemplo: "Erythrina crista-galli (ceibo)", sinonimos: ["ternada"] }),
            t("pinnada_comp", "Pinnada", "Más de tres folíolos (pinnas) dispuestos a lo largo de un eje o raquis.", { ejemplo: "Fraxinus (fresno)" }),
            t("palmaticompuesta", "Palmaticompuesta", "Más de tres folíolos insertos todos en el extremo del raquis. No se conocen hojas bipalmaticompuestas.",
              { ejemplo: "Tabebuia heptaphylla (lapacho rosado), palo borracho", sinonimos: ["digitada (guía de campo)"] })
          ]
        },
        {
          id: "b_pinnada_grado", nombre: "Grado de división de la hoja pinnada", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "b_compuesta", valores: ["pinnada_comp"] },
          terminos: [
            t("unipinnada", "Una vez pinnada", "Los folíolos se insertan directamente en el raquis principal.", { defFuente: "complementaria", ejemplo: "Fraxinus (fresno)" }),
            t("bipinnada", "Bipinnada", "Con raquis secundarios. Las últimas porciones de lámina se llaman pínnulas.", { ejemplo: "Acacia" }),
            t("tripinnada", "Tripinnada", "Con raquis terciarios.", {}),
            t("cuadripinnada", "Cuadripinnada", "Con raquis de cuarto orden.", {})
          ]
        },
        {
          id: "b_pinnada_terminal", nombre: "Terminación de la hoja pinnada", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "b_compuesta", valores: ["pinnada_comp"] },
          ayuda: "Es independiente del grado de división: hay hojas bipinnadas paripinnadas, como Acacia.",
          terminos: [
            t("paripinnada", "Paripinnada", "El raquis termina sin folíolo terminal, así que los folíolos suelen ser pares.",
              { defFuente: "complementaria", ejemplo: "Acacia (bipinnada paripinnada)" }),
            t("imparipinnada", "Imparipinnada", "El raquis termina en un folíolo terminal, así que los folíolos suelen ser impares.",
              { defFuente: "complementaria", ejemplo: "Fraxinus (fresno)" })
          ]
        },
        {
          id: "b_monocot", nombre: "Tipo de hoja de monocotiledónea", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "grupo", valores: ["monocotiledonea"] },
          ayuda: "Los cinco tipos que describe LA_HOJA (sección 2.5).",
          terminos: [
            t("mono_tipo1", "Tipo 1: lámina con vaina",
              "Limbo entero y alargado, de venación paralela, unido al tallo por una vaina que lo abraza. Puede tener lígula entre la lámina y la vaina.",
              { ejemplo: "Zea mays (maíz), Tulipa, Convallaria" }),
            t("mono_tipo2", "Tipo 2: con pecíolo entre vaina y lámina",
              "Tiene un pecíolo entre la vaina y la lámina. Puede tener un pecíolo inflado, una estípula intrapeciolar o pulvinos.",
              { ejemplo: "Araceae (Syngonium podophyllum), Eichhornia crassipes (camalote), Marantaceae (Calathea makoyana)" }),
            t("mono_tipo3", "Tipo 3: ensiforme o equitante",
              "La vaina lleva sobre su cara dorsal un limbo aplanado en un plano perpendicular al tallo, con las dos caras verticales. Incluye la variante de lámina cilíndrica sobre una vaina cerrada.",
              { ejemplo: "Iridaceae, Belamcanda chinensis; variante cilíndrica: Allium cepa (cebolla), Juncus microcephalus" }),
            t("mono_tipo4", "Tipo 4: hoja de palmera",
              "Limbo plegado, entero al inicio, que luego se divide (sectado), con venación pinnada o palmada. En Caryota es doblemente sectado.",
              { ejemplo: "Butia yatay, Arecastrum romanzoffianum (pinnadas); Copernicia alba (palmada); Caryota" }),
            t("mono_tipo5", "Tipo 5: pinnati-paralelinervada",
              "La línea media tiene muchas venas paralelas. Las venas periféricas se desvían casi en ángulo recto y recorren la lámina como secundarias paralelas. La hoja tiende a desgarrarse.",
              { ejemplo: "Canna (achira), Musa (bananero)" })
          ]
        },
        {
          id: "b_gimno", nombre: "Tipo de hoja de gimnosperma", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "grupo", valores: ["gimnosperma"] },
          ayuda: "Tipos descritos en LA_HOJA (sección 2.6).",
          terminos: [
            t("gim_acicular", "Acicular", "Aguja verde con una sola vena y punta aguda. Su base se une al eje formando el cojinete foliar.",
              { ejemplo: "Abies, Larix, Picea, Pinus (en ramas cortas de 1 a 5 hojas)" }),
            t("gim_escuamiforme", "Escuamiforme", "Hoja reducida, en forma de escama, con una sola vena. A menudo está soldada en parte al tallo.",
              { ejemplo: "Taxodiaceae, Cupressaceae, Podocarpaceae; Thuja, cipreses" }),
            t("gim_ancha", "Ancha con varias venas", "Hoja anchamente ovada, con varias venas.", { ejemplo: "Algunas Araucariaceae" }),
            t("gim_abanico", "En abanico", "Limbo expandido en forma de abanico, con venación dicotómica abierta.", { ejemplo: "Ginkgo biloba" }),
            t("gim_pinnaticompuesta", "Pinnaticompuesta", "Hoja compuesta pinnada.", { ejemplo: "Cycas revoluta" }),
            t("gim_peciolada", "Peciolada, parecida a la de dicotiledónea", "Hoja con pecíolo y lámina, parecida a la de una dicotiledónea.", { ejemplo: "Gnetum" })
          ]
        },
        {
          id: "b_pterido", nombre: "Tipo de hoja de pteridofita", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "grupo", valores: ["pteridofita"] },
          terminos: [
            t("microfilo", "Micrófilo", "Hoja reducida, de pocos milímetros, entera y sin pecíolo, sin vascularización o con una sola vena.",
              { ejemplo: "Selaginella, Lycopodium" }),
            t("megafilo", "Megáfilo (fronde)", "Hoja grande, a menudo compuesta, con venación muy desarrollada y crecimiento apical prolongado. Tiene un pecíolo con escamas pardas.",
              { ejemplo: "Filicales: Nephrolepis cordifolia" })
          ]
        },
        {
          id: "b_fronde", nombre: "Forma de la fronde", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "b_pterido", valores: ["megafilo"] },
          terminos: [
            t("fronde_simple_entera", "Simple entera", "Lámina alargada y entera.", { ejemplo: "Ophioglossum" }),
            t("fronde_simple_dividida", "Simple pinnatífida o pinnatisecta", "Lámina simple con divisiones que no forman pinnas articuladas.", {}),
            t("fronde_pinnada", "Pinnada", "Lámina pinnada con raquis simple.", { ejemplo: "Polypodium vulgare" }),
            t("fronde_bipinnada", "Bipinnada", "Con raquis primario y secundarios.", { ejemplo: "Polystichum filix-mas, Macrothelypteris torresiana" }),
            t("fronde_tripinnada", "Tripinnada", "Con raquis primario, secundarios y terciarios.", { ejemplo: "Pteris aquilina" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ C
    {
      id: "C", nombre: "Forma de la lámina", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "forma", nombre: "Forma de la lámina (o del folíolo)", multiple: true, admiteAusente: false,
          ayuda: "En una hoja compuesta se registra la forma del folíolo. Marque más de una forma si la especie varía.",
          terminos: [
            t("lanceolada", "Lanceolada", "Varias veces más larga que ancha, más ancha en el tercio inferior y estrechada hacia el ápice, como punta de lanza.",
              { defFuente: "complementaria", ejemplo: "Ligustrum (aligustre, citado en la guía de campo)", sinonimos: ["lanceada (guía de campo)"] }),
            t("hastada", "Hastada", "Más o menos triangular, con dos lóbulos basales agudos que se abren hacia afuera, como una alabarda.", { defFuente: "complementaria" }),
            t("romboidal", "Romboidal", "En forma de rombo, más ancha en la mitad.", { defFuente: "complementaria", ejemplo: "Eichhornia azurea (hojas emergentes)" }),
            t("obromboidal", "Obromboidal", "Rombo con la parte más ancha por encima de la mitad.", { defFuente: "complementaria" }),
            t("eliptica", "Elíptica", "Más ancha en la mitad, con bordes curvos y ambos extremos parecidos. Es de 1,5 a 2 veces más larga que ancha.",
              { defFuente: "complementaria", ejemplo: "Eichhornia azurea (hojas emergentes)" }),
            t("oblonga", "Oblonga", "De 2 a 3 veces más larga que ancha, con bordes casi paralelos en buena parte de su longitud.", { defFuente: "complementaria" }),
            t("triangular", "Triangular", "En forma de triángulo, con la base ancha.", { defFuente: "complementaria" }),
            t("obtriangular", "Obtriangular", "Triángulo invertido: ancha en el ápice y estrecha en la base.", { defFuente: "complementaria" }),
            t("cordada", "Cordada", "Ovada, con una escotadura en la base que forma dos lóbulos redondeados, como un corazón.", { defFuente: "complementaria" }),
            t("obcordada", "Obcordada", "Corazón invertido: la escotadura está en el ápice.", { defFuente: "complementaria" }),
            t("ovada", "Ovada", "Con el contorno de un huevo, más ancha en la mitad inferior.",
              { defFuente: "mixta", sinonimos: ["aovada (guía de campo)"] }),
            t("obovada", "Obovada", "Huevo invertido: más ancha en la mitad superior.",
              { defFuente: "mixta", sinonimos: ["trasovada (guía de campo)"] }),
            t("reniforme", "Reniforme", "Más ancha que larga, en forma de riñón, con la base escotada.", { defFuente: "complementaria" }),
            t("linear", "Linear", "Muy larga y estrecha, con bordes paralelos.", { defFuente: "complementaria", ejemplo: "Eichhornia azurea (hojas sumergidas, acintadas)" }),
            t("escuamiforme", "Escuamiforme", "Pequeña y en forma de escama.", { defFuente: "complementaria", ejemplo: "Thuja, Cupressaceae" }),
            t("acicular", "Acicular", "Linear, puntiaguda y por lo común persistente, como una aguja.", { defFuente: "guia", ejemplo: "Pinus (pino)" }),
            t("panduriforme", "Panduriforme", "Con forma de violín: ensanchada en los extremos y estrechada en la parte media.", { defFuente: "complementaria" }),
            t("orbicular", "Orbicular", "De contorno casi circular.", { defFuente: "complementaria" }),
            t("cuneiforme", "Cuneiforme", "En forma de cuña: ancha en la parte superior y estrechada gradualmente hacia la base. La guía la describe como 'pico de pato'.",
              { defFuente: "mixta", fuente: "guia", ejemplo: "Pittosporum tobira (citado en la guía de campo)" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ D
    {
      id: "D", nombre: "Base de la lámina", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "base", nombre: "Base de la lámina", multiple: true, admiteAusente: false,
          terminos: [
            t("base_cuneada", "Cuneada", "Se estrecha hacia el pecíolo en forma de cuña, con bordes rectos que convergen.", { defFuente: "complementaria" }),
            t("base_aguda", "Aguda", "Termina en un ángulo menor de 90°, con bordes rectos o algo convexos.", { defFuente: "complementaria" }),
            t("base_redondeada", "Redondeada", "Base en forma de arco.", { defFuente: "complementaria" }),
            t("base_cordada", "Cordada", "Con una escotadura que forma dos lóbulos redondeados.", { defFuente: "complementaria" }),
            t("base_truncada", "Truncada", "Como cortada transversalmente: recta, casi perpendicular al nervio medio.", { defFuente: "complementaria" }),
            t("base_hastada", "Hastada", "Con dos lóbulos basales agudos que se abren hacia afuera.", { defFuente: "complementaria" }),
            t("base_sagitada", "Sagitada", "Con dos lóbulos basales agudos dirigidos hacia abajo, como punta de flecha.", { defFuente: "complementaria" }),
            t("base_peltada", "Peltada", "El pecíolo se inserta en el centro de la lámina, no en el borde.", { ejemplo: "Victoria cruziana (irupé)" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ E
    {
      id: "E", nombre: "Ápice de la lámina", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "apice", nombre: "Ápice de la lámina", multiple: true, admiteAusente: false,
          terminos: [
            t("apice_acuminado", "Acuminado", "Se estrecha bruscamente en una punta larga y fina.", { defFuente: "complementaria" }),
            t("apice_agudo", "Agudo", "Termina en un ángulo menor de 90°, con bordes rectos.", { defFuente: "complementaria" }),
            t("apice_redondeado", "Redondeado", "Termina en un arco.", { defFuente: "complementaria" }),
            t("apice_obtuso", "Obtuso", "Termina en un ángulo mayor de 90°, romo.", { defFuente: "complementaria" }),
            t("apice_retuso", "Retuso", "Redondeado u obtuso, con una escotadura pequeña y poco profunda.", { defFuente: "complementaria" }),
            t("apice_obcordado", "Obcordado", "Con una escotadura profunda que forma dos lóbulos redondeados.", { defFuente: "complementaria" }),
            t("apice_cuspidado", "Cuspidado", "Termina de golpe en una punta rígida y aguda (cúspide).", { defFuente: "complementaria" }),
            t("apice_mucronado", "Mucronado", "Redondeado u obtuso, termina en una punta corta (mucrón) que prolonga el nervio medio.", { defFuente: "complementaria" }),
            t("apice_truncado", "Truncado", "Como cortado transversalmente.", { defFuente: "complementaria" }),
            t("apice_emarginado", "Emarginado", "Con una escotadura evidente en el ápice.",
              { defFuente: "complementaria", sinonimos: ["escotada (guía de campo)"] }),
            t("apice_atenuado", "Atenuado", "Se estrecha poco a poco en una punta larga.", { defFuente: "complementaria" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ F
    {
      id: "F", nombre: "Margen foliar", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "margen", nombre: "Margen: contorno del borde", multiple: true, admiteAusente: false,
          ayuda: "LA_HOJA señala que también importan el espaciado y el tamaño de los dientes (iguales, desiguales o dobles). Anótelo en observaciones.",
          terminos: [
            t("margen_entero", "Entero", "Borde liso, sin dientes ni lóbulos.",
              { defFuente: "complementaria", ejemplo: "Erythrina crista-galli (seibo)", sinonimos: ["enterísima (guía de campo)"] }),
            t("margen_serrulado", "Serrulado", "Aserrado con dientes muy pequeños.", { defFuente: "complementaria" }),
            t("margen_aserrado", "Aserrado", "Dientes agudos inclinados hacia el ápice, como una sierra.",
              { defFuente: "guia", ejemplo: "Mespilus germanica (níspero); violeta (guía de campo)" }),
            t("margen_doble_aserrado", "Doblemente aserrado", "Dientes aserrados que a su vez tienen dientes menores.", { defFuente: "complementaria", ejemplo: "Turnera orientalis" }),
            t("margen_crenado", "Crenado", "Dientes redondeados.", { defFuente: "complementaria", ejemplo: "Pelargonium hortorum (malvón)" }),
            t("margen_lobado", "Lobado", "Con lóbulos redondeados.", { defFuente: "complementaria", ejemplo: "Quercus robur (roble)" }),
            t("margen_sinuado", "Sinuado", "Con entrantes y salientes suaves en el plano de la lámina.", { defFuente: "complementaria" }),
            t("margen_ondulado", "Ondulado", "El borde forma ondas.", { defFuente: "complementaria" }),
            t("margen_inciso", "Inciso", "Con cortes profundos e irregulares.", { defFuente: "complementaria" }),
            t("margen_eroso", "Eroso", "Con dientes irregulares, como roído.", { defFuente: "complementaria" }),
            t("margen_dentado", "Dentado", "Dientes de puntas rectas, dirigidos hacia afuera.",
              { defFuente: "guia", ejemplo: "Macfadyena dentata (uña de gato); castaño común (guía de campo)" })
          ]
        },
        {
          id: "margen_curvatura", nombre: "Margen: curvatura del borde", multiple: false, admiteAusente: false,
          ayuda: "LA_HOJA los incluye en la lista de márgenes, pero describen otra cosa (hacia dónde se curva el borde), por eso van en un selector aparte.",
          terminos: [
            t("margen_plano", "Plano", "El borde sigue el plano de la lámina.", { defFuente: "complementaria" }),
            t("margen_revoluto", "Revoluto", "Borde enrollado hacia el envés.", { defFuente: "complementaria", ejemplo: "Rosmarinus officinalis (romero)" }),
            t("margen_involuto", "Involuto", "Borde enrollado hacia el haz.", { defFuente: "complementaria" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ G
    {
      id: "G", nombre: "Nervadura (venación)", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "nervadura", nombre: "Tipo de venación mayor", multiple: false, admiteAusente: false,
          ayuda: "Se basa en las venas primarias, las más gruesas (Hickey). Craspedódroma, camptódroma e hifódroma son variantes de la venación pinnada.",
          terminos: [
            t("craspedodroma", "Pinnada craspedódroma", "Una vena media con venas secundarias escalonadas que terminan en el margen.", {}),
            t("camptodroma", "Pinnada camptódroma", "Una vena media con venas secundarias que terminan antes del margen.", {}),
            t("hifodroma", "Pinnada hifódroma", "Solo se ve la vena media. Las secundarias faltan, son rudimentarias o quedan ocultas en un mesófilo carnoso o coriáceo.", {}),
            t("paralelodroma", "Paralelódroma", "Dos o más venas primarias nacen a cada lado de la base y corren paralelas hasta el ápice, donde convergen.",
              { ejemplo: "Plantago", sinonimos: ["nerviosa (guía de campo: rayas de arriba abajo que no se dividen; ej. llantén)"] }),
            t("campilodroma", "Campilódroma", "Varias venas primarias nacen en un mismo punto y forman arcos recurvos que convergen hacia el ápice. También se da en monocotiledóneas.", {}),
            t("acrodroma", "Acródroma", "Dos o más venas primarias, o secundarias muy desarrolladas, forman arcos no recurvos que convergen hacia el ápice.",
              { ejemplo: "Saponaria, Bupleurum" }),
            t("actinodroma", "Actinódroma", "Tres o más venas basales que se separan radialmente desde un punto.", { ejemplo: "Malvaceae, Tiliaceae" }),
            t("palinactinodroma", "Palinactinódroma (pedada)", "Las venas primarias se ramifican dicotómicamente, más o menos separadas. Las dos laterales inferiores forman ángulos muy abiertos con la vena media.",
              { ejemplo: "Platanus" }),
            t("dicotomica_abierta", "Dicotómica abierta", "Las venas se bifurcan una y otra vez y terminan libres, sin unirse en red. No forma aréolas.",
              { ejemplo: "Ginkgo biloba, Adiantum (culantrillo), Circaeaster" }),
            t("pinnati_paralelinervada", "Pinnati-paralelinervada", "Nervio medio grueso del que salen venas secundarias paralelas casi en ángulo recto (tipo 5 de monocotiledóneas).",
              { ejemplo: "Canna (achira), Musa (bananero)" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ H
    {
      id: "H", nombre: "Filotaxis", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "filotaxis", nombre: "Disposición de las hojas en el tallo", multiple: false, admiteAusente: false,
          ayuda: "Cuente cuántas hojas salen de cada nudo: una (alterna), dos (decusada) o tres o más (verticilada).",
          terminos: [
            t("alterna_disticha", "Alterna dística", "Una hoja por nudo, alternando sobre dos líneas opuestas del tallo (ortósticos). Es frecuente en monocotiledóneas y rara en dicotiledóneas.",
              { ejemplo: "Belamcanda chinensis" }),
            t("alterna_helicoidal", "Alterna helicoidal", "Una hoja por nudo, sobre una espiral alrededor del tallo. El ángulo de divergencia suele ser de 137° a 140°.",
              { ejemplo: "Boehmeria nivea" }),
            t("opuesta_decusada", "Opuesta decusada", "Dos hojas por nudo. Cada par queda en cruz con el par siguiente.",
              { ejemplo: "Amaranthaceae, Labiatae" }),
            t("verticilada", "Verticilada", "Tres o más hojas por nudo.", { ejemplo: "Nerium oleander (laurel rosa), Apocynaceae" })
          ]
        },
        {
          id: "posicion", nombre: "Posición de las hojas", multiple: true, admiteAusente: false, fuente: "guia",
          terminos: [
            t("caulinar", "Caulinares", "Hojas insertas a lo largo del tallo aéreo.", { defFuente: "complementaria", fuente: "complementario" }),
            t("radical", "Radicales (basales)", "Hojas que parecen nacer de la raíz, agrupadas en la base de la planta.",
              { defFuente: "guia", ejemplo: "Mandrágora (citada en la guía de campo)" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ I
    {
      id: "I", nombre: "Pecíolo, base foliar y estructuras asociadas", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "peciolo", nombre: "Pecíolo", multiple: false, admiteAusente: false,
          terminos: [
            t("peciolada", "Peciolada", "Con pecíolo que une la lámina al tallo.", { ejemplo: "Broussonetia papyrifera" }),
            t("sesil", "Sésil", "Sin pecíolo: el limbo se une directamente al tallo.", { ejemplo: "Dianthus caryophyllus (clavel)" })
          ]
        },
        {
          id: "sesil_tipo", nombre: "Inserción de la hoja sésil", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "peciolo", valores: ["sesil"] },
          terminos: [
            t("sesil_simple", "Sésil simple", "El limbo se inserta en el tallo sin rodearlo.", { defFuente: "complementaria" }),
            t("abrazadora", "Abrazadora", "La base del limbo abraza el tallo.", { ejemplo: "Bupleurum" }),
            t("connada", "Connada (soldadas)", "Dos hojas sésiles del mismo nudo se sueldan entre sí y rodean el tallo.",
              { ejemplo: "Lonicera implexa, Dianthus, Deianira erubescens" }),
            t("perfoliada", "Perfoliada", "Una hoja cuya base rodea por completo el tallo, sin formar tubo.", { defFuente: "guia", fuente: "guia" }),
            t("decurrente", "Escurrida (decurrente)", "Hoja sésil cuya base se prolonga hacia abajo por ambos lados del tallo.",
              { defFuente: "guia", fuente: "guia", sinonimos: ["escurrida (guía de campo)"] })
          ]
        },
        {
          id: "peciolo_forma", nombre: "Forma del pecíolo", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "peciolo", valores: ["peciolada"] },
          terminos: [
            t("peciolo_cilindrico", "Cilíndrico", "Pecíolo estrecho y de sección circular.", {}),
            t("peciolo_acanalado", "Acanalado", "Pecíolo hundido en la cara superior.", {}),
            t("peciolo_alado", "Aplanado o alado", "Pecíolo aplanado y ancho.", { ejemplo: "Citrus" }),
            t("peciolo_inflado", "Inflado", "Pecíolo hinchado, a veces flotador.", { ejemplo: "Eichhornia crassipes (camalote)" })
          ]
        },
        {
          id: "pulvino", nombre: "Pulvinos", multiple: true, admiteAusente: true,
          ayuda: "Engrosamientos que parecen articulaciones, con superficie arrugada. Están relacionados con los movimientos de las hojas (nastias).",
          terminos: [
            t("pulvino_t", "Pulvino", "Engrosamiento en la base o el ápice del pecíolo.", { ejemplo: "Marantaceae (entre el pecíolo y la lámina)" }),
            t("pulvinulo", "Pulvínulo", "Engrosamiento en el peciólulo de cada folíolo de una hoja compuesta.", { ejemplo: "Mimosa paupera" })
          ]
        },
        {
          id: "vaina", nombre: "Vaina foliar", multiple: false, admiteAusente: true,
          ayuda: "Base foliar ensanchada que envuelve el tallo.",
          terminos: [
            t("vaina_abierta", "Vaina abierta", "La base foliar abraza el tallo, pero sus bordes no se sueldan.",
              { defFuente: "mixta", ejemplo: "Apium graveolens (apio), Umbelliferae, Zea mays" }),
            t("vaina_cerrada", "Vaina cerrada", "Vaina cilíndrica totalmente cerrada alrededor del tallo.", { ejemplo: "Allium cepa (cebolla), Juncus microcephalus" })
          ]
        },
        {
          id: "ligula", nombre: "Lígula", multiple: false, admiteAusente: true, soloPresencia: true,
          ayuda: "Apéndice laminar vertical en la unión entre la lámina y la vaina, típico de gramíneas.",
          terminos: []
        },
        {
          id: "estipulas", nombre: "Estípulas: disposición", multiple: true, admiteAusente: true,
          ayuda: "Apéndices a ambos lados de la base del pecíolo. Si comprobó que no tiene, marque Ausente.",
          terminos: [
            t("estipulas_libres", "Libres, laterales", "Una a cada lado del pecíolo, sin soldarse.", { ejemplo: "Gossypium hirsutum (algodón)" }),
            t("estipulas_adnatas", "Adnatas al pecíolo", "Soldadas al pecíolo.", { ejemplo: "Rosa" }),
            t("estipulas_intrapeciolares", "Axilares o intrapeciolares", "Las dos estípulas de la hoja se sueldan entre la hoja y el tallo.",
              { ejemplo: "Eichhornia crassipes (una estípula intrapeciolar membranácea)" }),
            t("estipulas_opositifolias", "Opositifolias", "Soldadas entre sí, abrazando el tallo del lado opuesto a la hoja.",
              { ejemplo: "Coronilla minima; Platanus (coherentes)" }),
            t("ocrea", "Ócrea", "Estípulas soldadas que forman un tubo alrededor del tallo.", { ejemplo: "Polygonum" }),
            t("estipulas_interpeciolares", "Interpeciolares", "Se sueldan estípulas de hojas distintas del mismo nudo, quedando entre los pecíolos.",
              { ejemplo: "Muchas Rubiaceae; Coffea arabica (café)" }),
            t("estipulas_capuchon", "En capuchón terminal", "Estípulas soldadas que forman un capuchón protector sobre el meristema apical.",
              { ejemplo: "Ficus religiosa, Ficus benjamina" })
          ]
        },
        {
          id: "estipulas_forma", nombre: "Estípulas: tamaño y forma", multiple: true, admiteAusente: false,
          aplicaSi: { caracter: "estipulas", presente: true },
          terminos: [
            t("estipulas_pequenas", "Pequeñas", "Estípulas mucho menores que el limbo.", {}),
            t("estipulas_foliaceas", "Foliáceas", "Estípulas parecidas a hojas, a veces del tamaño del limbo.", { ejemplo: "Pisum sativum (arveja), Lathyrus aphaca" }),
            t("estipulas_compuestas", "Compuestas (pinnadas)", "Estípulas divididas como una hoja pinnada.", { ejemplo: "Delonix regia (chivato), Peltophorum dubium" })
          ]
        },
        {
          id: "estipulas_duracion", nombre: "Estípulas: duración", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "estipulas", presente: true },
          ayuda: "Si las estípulas son caducas, quizás ya no estén. Mire las cicatrices en el nudo antes de marcarlas como ausentes.",
          terminos: [
            t("caducas", "Caducas", "Caen mucho antes que el resto de la hoja.", { ejemplo: "Delonix regia" }),
            t("persistentes", "Persistentes", "Permanecen incluso después de que cae la hoja.", {})
          ]
        },
        {
          id: "estipelas", nombre: "Estipelas", multiple: false, admiteAusente: true, soloPresencia: true,
          ayuda: "Son parecidas a las estípulas, pero están en la base de los folíolos de una hoja compuesta.",
          terminos: []
        }
      ]
    },

    // ------------------------------------------------------------------ J
    {
      id: "J", nombre: "Superficie de la hoja", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "color_caras", nombre: "Color de las caras", multiple: false, admiteAusente: false,
          terminos: [
            t("concolora", "Concolora", "Haz y envés del mismo color.", {}),
            t("discolora", "Discolora", "Haz y envés de distinto color. Por lo general el haz es de un verde más oscuro.", {})
          ]
        },
        {
          id: "textura", nombre: "Consistencia de la lámina", multiple: false, admiteAusente: false, fuente: "complementario",
          ayuda: "LA_HOJA solo menciona el mesófilo 'carnoso o coriáceo' (al hablar de la venación hifódroma). Los demás términos son complementarios.",
          terminos: [
            t("membranacea", "Membranácea", "Delgada, blanda y algo translúcida.", { defFuente: "complementaria" }),
            t("cartacea", "Cartácea", "Con la consistencia del papel.", { defFuente: "complementaria" }),
            t("coriacea", "Coriácea", "Gruesa y dura, como cuero.", { defFuente: "complementaria", fuente: "LA_HOJA" }),
            t("carnosa", "Carnosa o suculenta", "Gruesa y jugosa.", { defFuente: "complementaria", fuente: "LA_HOJA" })
          ]
        },
        {
          id: "indumento", nombre: "Pelos de la lámina (indumento)", multiple: true, admiteAusente: false, fuente: "complementario",
          ayuda: "No aparece en LA_HOJA, pero suele ser muy útil para distinguir especies.",
          terminos: [
            t("glabra", "Glabra", "Sin pelos.", { defFuente: "complementaria" }),
            t("pubescente", "Pubescente", "Con pelos finos y cortos.", { defFuente: "complementaria" }),
            t("tomentosa", "Tomentosa", "Con pelos densos y entrelazados, como fieltro.", { defFuente: "complementaria" }),
            t("escabrosa", "Escabrosa", "Áspera al tacto por pelos cortos y rígidos.", { defFuente: "complementaria" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ K
    {
      id: "K", nombre: "Tallo", fuente: "complementario",
      caracteres: [
        {
          id: "tallo_consistencia", nombre: "Consistencia del tallo", multiple: false, admiteAusente: false,
          terminos: [
            t("lenoso", "Leñoso", "Tallo duro, con madera.", { defFuente: "complementaria" }),
            t("herbaceo", "Herbáceo", "Tallo blando y verde, sin madera.", { defFuente: "complementaria" }),
            t("suculento", "Suculento", "Tallo grueso y carnoso, que almacena agua.", { defFuente: "complementaria" })
          ]
        },
        {
          id: "tallo_seccion", nombre: "Sección transversal del tallo", multiple: false, admiteAusente: false,
          terminos: [
            t("cilindrico", "Cilíndrico", "Sección circular.", { defFuente: "complementaria" }),
            t("cuadrangular", "Cuadrangular", "Sección cuadrada, con cuatro aristas.", { defFuente: "complementaria" }),
            t("triangular_tallo", "Triangular", "Sección triangular.", { defFuente: "complementaria" }),
            t("aplanado", "Aplanado", "Sección comprimida.", { defFuente: "complementaria" })
          ]
        },
        {
          id: "exudado", nombre: "Látex o exudado", multiple: true, admiteAusente: true,
          ayuda: "Haga un corte pequeño en el tallo o el pecíolo y observe qué sale.",
          terminos: [
            t("latex_blanco", "Látex blanco", "Líquido lechoso blanco.", { defFuente: "complementaria" }),
            t("latex_coloreado", "Látex coloreado", "Líquido amarillo, anaranjado o rojizo.", { defFuente: "complementaria" }),
            t("resina", "Resina", "Exudado pegajoso y aromático.", { defFuente: "complementaria" }),
            t("exudado_acuoso", "Exudado acuoso o mucilaginoso", "Líquido transparente, a veces viscoso.", { defFuente: "complementaria" })
          ]
        },
        {
          id: "tallo_punzantes", nombre: "Estructuras punzantes", multiple: true, admiteAusente: true,
          terminos: [
            t("espinas", "Espinas", "Órganos modificados, duros y punzantes, con tejido vascular (por ejemplo, ramas o hojas transformadas).", { defFuente: "complementaria" }),
            t("aguijones", "Aguijones", "Puntas duras que salen de la epidermis y se desprenden con facilidad, como en el rosal.", { defFuente: "complementaria" })
          ]
        },
        {
          id: "zarcillos", nombre: "Zarcillos", multiple: true, admiteAusente: true, fuente: "LA_HOJA",
          terminos: [
            t("zarcillo_foliar", "De origen foliar", "La hoja, o parte de ella, se transforma en zarcillo.", { ejemplo: "Lathyrus aphaca (el limbo se reduce a un zarcillo)" }),
            t("zarcillo_caulinar", "De origen caulinar", "Rama transformada en zarcillo.", { defFuente: "complementaria", fuente: "complementario" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ L
    {
      id: "L", nombre: "Hábito de crecimiento", fuente: "guia",
      caracteres: [
        {
          id: "habito", nombre: "Hábito o forma de vida", multiple: true, admiteAusente: false,
          ayuda: "Las formas de vida que lista la guía de campo (método de puntos de intercepción). Una planta puede tener dos, por ejemplo hierba y trepadora.",
          terminos: [
            t("arbol", "Árbol", "Planta leñosa con un tronco principal definido.", { defFuente: "complementaria" }),
            t("arbusto", "Arbusto", "Planta leñosa ramificada desde la base, sin tronco principal.", { defFuente: "complementaria" }),
            t("subarbusto", "Subarbusto", "Planta leñosa solo en la base, con ramas superiores herbáceas.", { defFuente: "complementaria" }),
            t("hierba", "Hierba", "Planta no leñosa.", { defFuente: "complementaria" }),
            t("graminoide", "Graminoide", "Hierba con aspecto de pasto: hojas lineares y venación paralela.", { defFuente: "complementaria" }),
            t("trepadora", "Trepadora o bejuco", "Planta que se apoya en otras para subir.", { defFuente: "complementaria" }),
            t("epifita", "Epífita", "Planta que crece sobre otra sin parasitarla.", { defFuente: "complementaria" }),
            t("roseta", "Roseta", "Hojas agrupadas en una roseta, en la base o en el extremo de un tallo.", { defFuente: "complementaria", fuente: "complementario" }),
            t("acuatica", "Acuática", "Planta que vive en el agua, flotante o arraigada.", { defFuente: "complementaria", fuente: "complementario", ejemplo: "Eichhornia crassipes (camalote)" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ M
    {
      id: "M", nombre: "Flor e inflorescencia", fuente: "complementario",
      caracteres: [
        {
          id: "flores", nombre: "Flores", multiple: false, admiteAusente: true, soloPresencia: true,
          ayuda: "Si la planta no tenía flores el día de la salida, deje 'No observado'. Use 'Ausente' solo si el grupo no produce flores (helechos, gimnospermas).",
          terminos: []
        },
        {
          id: "flor_color", nombre: "Color de la flor", multiple: true, admiteAusente: false,
          aplicaSi: { caracter: "flores", presente: true },
          terminos: [
            t("blanco", "Blanco", "", { defFuente: "complementaria" }),
            t("amarillo", "Amarillo", "", { defFuente: "complementaria" }),
            t("anaranjado", "Anaranjado", "", { defFuente: "complementaria" }),
            t("rojo", "Rojo", "", { defFuente: "complementaria" }),
            t("rosado", "Rosado", "", { defFuente: "complementaria" }),
            t("morado", "Morado o violeta", "", { defFuente: "complementaria" }),
            t("azul", "Azul", "", { defFuente: "complementaria" }),
            t("verde", "Verde", "", { defFuente: "complementaria" }),
            t("otro_color", "Otro", "", { defFuente: "complementaria" })
          ]
        },
        {
          id: "flor_simetria", nombre: "Simetría de la flor", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "flores", presente: true },
          terminos: [
            t("actinomorfa", "Actinomorfa (radial)", "Se puede dividir en mitades iguales por varios planos.", { defFuente: "complementaria" }),
            t("zigomorfa", "Zigomorfa (bilateral)", "Solo un plano la divide en dos mitades iguales.", { defFuente: "complementaria" }),
            t("asimetrica", "Asimétrica", "Ningún plano la divide en mitades iguales.", { defFuente: "complementaria" })
          ]
        },
        {
          id: "flor_piezas", nombre: "Número de pétalos o tépalos", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "flores", presente: true },
          terminos: [
            t("piezas_3", "3 o múltiplos de 3", "", { defFuente: "complementaria" }),
            t("piezas_4", "4 o múltiplos de 4", "", { defFuente: "complementaria" }),
            t("piezas_5", "5 o múltiplos de 5", "", { defFuente: "complementaria" }),
            t("piezas_muchas", "Numerosos (más de 10)", "", { defFuente: "complementaria" }),
            t("piezas_0", "Sin pétalos visibles", "", { defFuente: "complementaria" })
          ]
        },
        {
          id: "inflorescencia", nombre: "Tipo de inflorescencia", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "flores", presente: true },
          terminos: [
            t("solitaria", "Flor solitaria", "Una sola flor en el pedúnculo.", { defFuente: "complementaria" }),
            t("racimo", "Racimo", "Eje con flores pediceladas.", { defFuente: "complementaria" }),
            t("espiga", "Espiga", "Eje con flores sésiles.", { defFuente: "complementaria" }),
            t("umbela", "Umbela", "Pedicelos que salen de un mismo punto.", { defFuente: "complementaria" }),
            t("corimbo", "Corimbo", "Pedicelos de distinta longitud, con las flores a la misma altura.", { defFuente: "complementaria" }),
            t("panicula", "Panícula", "Racimo ramificado.", { defFuente: "complementaria" }),
            t("cima", "Cima", "El eje termina en una flor y las ramas laterales siguen creciendo.", { defFuente: "complementaria" }),
            t("capitulo", "Capítulo", "Flores sésiles sobre un receptáculo ensanchado, como en las Asteraceae.", { defFuente: "complementaria" }),
            t("espadice", "Espádice", "Espiga carnosa, a menudo rodeada por una espata, como en las Araceae.", { defFuente: "complementaria" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ N
    {
      id: "N", nombre: "Fruto", fuente: "complementario",
      caracteres: [
        {
          id: "frutos", nombre: "Frutos", multiple: false, admiteAusente: true, soloPresencia: true,
          ayuda: "Igual que con las flores: si no había frutos ese día, deje 'No observado'.",
          terminos: []
        },
        {
          id: "fruto_tipo", nombre: "Tipo de fruto", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "frutos", presente: true },
          terminos: [
            t("baya", "Baya", "Fruto carnoso con una o varias semillas, sin hueso.", { defFuente: "complementaria" }),
            t("drupa", "Drupa", "Fruto carnoso con un hueso (endocarpo duro) que encierra la semilla.", { defFuente: "complementaria" }),
            t("capsula", "Cápsula", "Fruto seco que se abre (dehiscente) y viene de varios carpelos.", { defFuente: "complementaria" }),
            t("legumbre", "Legumbre", "Fruto seco de un solo carpelo que se abre por dos suturas, como en las Fabaceae.", { defFuente: "complementaria" }),
            t("aquenio", "Aquenio", "Fruto seco que no se abre, con una semilla libre dentro.", { defFuente: "complementaria" }),
            t("cariopside", "Cariópside", "Fruto seco con la semilla soldada a la pared, como en las gramíneas.", { defFuente: "complementaria" }),
            t("samara", "Sámara", "Fruto seco que no se abre, con un ala.", { defFuente: "complementaria" }),
            t("foliculo", "Folículo", "Fruto seco de un carpelo que se abre por una sola sutura.", { defFuente: "complementaria" }),
            t("silicua", "Silicua", "Fruto seco con un tabique central, como en las Brassicaceae.", { defFuente: "complementaria" }),
            t("nuez", "Nuez", "Fruto seco que no se abre, de pared dura.", { defFuente: "complementaria" }),
            t("esquizocarpo", "Esquizocarpo", "Fruto seco que se separa en partes, como en las Apiaceae.", { defFuente: "complementaria" }),
            t("otro_fruto", "Otro", "", { defFuente: "complementaria" })
          ]
        },
        {
          id: "fruto_consistencia", nombre: "Consistencia del fruto", multiple: false, admiteAusente: false,
          aplicaSi: { caracter: "frutos", presente: true },
          terminos: [
            t("fruto_carnoso", "Carnoso", "", { defFuente: "complementaria" }),
            t("fruto_seco", "Seco", "", { defFuente: "complementaria" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ O
    {
      id: "O", nombre: "Ambiente", fuente: "guia",
      caracteres: [
        {
          id: "zona", nombre: "Zona climática", multiple: false, admiteAusente: false,
          ayuda: "Las tres zonas de clima del recorrido según la guía de campo (de 4 °C a 24 °C). Se toma de la estación de muestreo.",
          terminos: [
            t("zona_fria", "Frío o páramo", "", { defFuente: "guia" }),
            t("zona_templada", "Templado", "", { defFuente: "guia" }),
            t("zona_calida", "Cálido", "", { defFuente: "guia" })
          ]
        }
      ]
    },

    // ------------------------------------------------------------------ P
    {
      id: "P", nombre: "Notas opcionales (LA_HOJA)", fuente: "LA_HOJA",
      caracteres: [
        {
          id: "prefoliacion", nombre: "Prefoliación o vernación (en la yema)", multiple: false, admiteAusente: false, opcional: true,
          terminos: [
            t("pref_plana", "Plana", "Limbo extendido.", {}),
            t("pref_conduplicada", "Conduplicada", "Limbo plegado en dos a lo largo de la vena media.", { ejemplo: "Petunia thymifolia" }),
            t("pref_replegada", "Replegada", "Limbo plegado como un abanico.", { ejemplo: "Vid" }),
            t("pref_convoluta", "Convoluta", "Limbo enrollado paralelo a la vena media.", { ejemplo: "Lechuga" }),
            t("pref_involuta", "Involuta", "Márgenes enrollados hacia el haz.", { ejemplo: "Álamo, peral" }),
            t("pref_revoluta", "Revoluta", "Márgenes enrollados hacia el envés.", { ejemplo: "Sauce, Muehlenbeckia sagittifolia" }),
            t("pref_circinada", "Circinada", "Hoja enrollada sobre sí misma desde el ápice hacia la base. Es típica de las pteridofitas.", { ejemplo: "Helechos; Utricularia foliosa" })
          ]
        },
        {
          id: "heterofilia", nombre: "Heterofilia", multiple: false, admiteAusente: true, soloPresencia: true, opcional: true,
          ayuda: "Hojas de forma y tamaño diferentes en una misma planta, como las hojas sumergidas y emergentes de Eichhornia azurea.",
          terminos: []
        },
        {
          id: "anisofilia", nombre: "Anisofilia", multiple: false, admiteAusente: true, soloPresencia: true, opcional: true,
          ayuda: "Hojas de distinta forma y tamaño en un mismo sector del tallo, como en Selaginella.",
          terminos: []
        }
      ]
    }
  ],

  // Datos de la estación de muestreo (sección 9 del plan). Se comparten entre registros.
  camposEstacion: [
    { id: "nombre", nombre: "Nombre de la estación", tipo: "texto" },
    { id: "fecha", nombre: "Fecha", tipo: "fecha" },
    { id: "municipio", nombre: "Municipio", tipo: "texto",
      sugerencias: ["Tunja", "Ventaquemada", "Machetá", "Guateque", "Santa María", "San Luis de Gaceno"] },
    { id: "vereda", nombre: "Vereda", tipo: "texto" },
    { id: "localidad", nombre: "Localidad", tipo: "texto" },
    { id: "zona", nombre: "Zona climática", tipo: "caracter", caracter: "zona" },
    { id: "altitud", nombre: "Altitud (m s. n. m.)", tipo: "numero" },
    { id: "temperatura", nombre: "Temperatura ambiente (°C)", tipo: "numero" },
    { id: "temperatura_suelo", nombre: "Temperatura del suelo (°C)", tipo: "numero" },
    { id: "humedad", nombre: "Humedad relativa (%)", tipo: "numero" },
    { id: "observaciones", nombre: "Observaciones del entorno", tipo: "textoLargo" }
  ],

  // Tipos de fotografía (sección 5 del plan).
  tiposFoto: [
    { id: "planta", nombre: "Planta completa" },
    { id: "hoja", nombre: "Hoja" },
    { id: "haz", nombre: "Haz de la hoja" },
    { id: "enves", nombre: "Envés de la hoja" },
    { id: "tallo", nombre: "Tallo" },
    { id: "flor", nombre: "Flor" },
    { id: "fruto", nombre: "Fruto" },
    { id: "otro", nombre: "Otro detalle morfológico" }
  ]
};

if (typeof module !== "undefined") module.exports = VOCABULARIO;
