# Vocabulario morfológico

Versión 1.0. Generado desde `js/caracteres.js` (no edites este archivo a mano: se vuelve a generar). 16 categorías, 50 caracteres (selectores) y 220 términos.

## Cómo leer este documento
- Cada **carácter** es un selector independiente en la app. Nunca se mezclan dos caracteres en un mismo selector.
- **Fuente del carácter**: de dónde sale el término (LA_HOJA, guía de campo o complementario).
- **Fuente de la definición**: LA_HOJA define muchos términos (venación, filotaxis, estípulas), pero otros solo los nombra (formas, bases, ápices, márgenes). Esas definiciones son botánicas estándar y quedan marcadas como *Complementaria*.
- Estados de cada carácter en una especie:
  - Presente: se observó e identificó.
  - Ausente: se comprobó que la característica no existe en la planta.
  - No observado: no fue posible determinarla en campo. No equivale a ausente.
- **Admite ausente**: solo en los caracteres donde 'no tiene' es un dato botánico (estípulas, látex, flores…). En los demás, solo hay 'presente' o 'no observado'.
- **Varios valores**: la especie puede tener más de un término a la vez (por ejemplo, márgenes que varían).

## Decisiones sobre términos dudosos

Aprobadas por el usuario tal como se propusieron (versión 1.0). Para cambiar alguna, se edita `js/caracteres.js` y se vuelve a generar este documento.

1. **Ovada / aovada y obovada / trasovada.** La guía usa 'aovada' y 'trasovada', y LA_HOJA 'ovada' y 'obovada'. Las traté como **sinónimos** (un solo término con su sinónimo) para que la misma forma no quede partida en dos. ¿De acuerdo?
2. **Digitada (guía) = palmaticompuesta (LA_HOJA).** Las dejé como sinónimos.
3. **Escotada (guía) = ápice emarginado (LA_HOJA).** Las dejé como sinónimos.
4. **Entera y enterísima.** La guía separa 'entera' (sin senos ni escotaduras) de 'enterísima' (sin dientes). En la app, 'entera' es el grado de división de la hoja simple (carácter B) y 'margen entero' corresponde a 'enterísima' (carácter F). ¿Te parece bien así?
5. **Revoluto, involuto y plano.** LA_HOJA los pone en la lista de márgenes, pero describen otra cosa (hacia dónde se curva el borde) que los dientes. Los separé en **'Margen: curvatura'** para que una hoja pueda ser, por ejemplo, aserrada y revoluta a la vez.
6. **Ondulado.** Lo dejé en el contorno del margen, junto a 'sinuado', como en LA_HOJA. En muchos textos 'ondulado' se refiere a ondas fuera del plano de la lámina, que sería curvatura. ¿Dónde lo prefieres?
7. **Peltada.** LA_HOJA la usa en la lista de bases y al hablar del pecíolo (Victoria cruziana). Para no contarla dos veces, quedó **solo en Base (D)**.
8. **Acicular y escuamiforme.** Están en la lista de formas de lámina de LA_HOJA (C) y también como tipos de hoja de gimnosperma (B). Dejé las dos, pero en una gimnosperma podrían contar dos veces al comparar. Propongo que en la identificación se cuenten como un solo rasgo cuando coinciden.
9. **Hojas opuestas no decusadas.** LA_HOJA solo nombra la decusada (2 por nudo, en cruz). No agregué 'opuesta dística' porque no está en el documento. ¿La necesitas?
10. **Hoja escurrida (guía).** La guía pone como ejemplo el girasol, que en realidad tiene hojas pecioladas. Dejé el término sin ese ejemplo.
11. **Cuneiforme (guía).** La guía la describe como 'pico de pato'. La definí como 'en forma de cuña', que es el uso estándar, y menciono la frase de la guía.
12. **Hoja nerviosa y hoja venosa (guía).** 'Nerviosa' quedó como sinónimo de paralelódroma. 'Venosa' (venas sobresalientes) no es un tipo de venación de Hickey, así que no la agregué como término. ¿Quieres un carácter aparte para 'venas prominentes en el envés'?
13. **Dicotiledónea.** Uso este término porque es el que usa LA_HOJA, aunque en la clasificación actual se habla de eudicotiledóneas y magnólidas.
14. **Número de piezas florales.** Las opciones '3, 4 o 5 o múltiplos' se solapan (6 es múltiplo de 3; 12 lo es de 3 y de 4). ¿Prefieres que se escriba el número exacto?
15. **Conos de gimnospermas.** No son frutos. En gimnospermas propongo marcar 'Flores: ausente' y 'Frutos: ausente' y describir los conos en las observaciones.
16. **Términos complementarios para aprobar**: consistencia e indumento de la lámina (J), todo el tallo (K), roseta y acuática (L), flor (M), fruto (N), 'caulinar', 'sésil simple', 'una vez pinnada' y 'zarcillo caulinar'. ¿Los dejo, quito o cambio alguno?
17. **Figuras de LA_HOJA.** Las ilustraciones del documento (Carlton, Hickey) no se pueden leer como texto. Las definiciones de forma, base, ápice y margen se redactaron con el criterio botánico estándar. Revísalas con las figuras a la vista.

## A. Grupo vegetal

### Grupo vegetal
`grupo` · Fuente: LA_HOJA · un valor · no admite ausente

> Gran grupo de plantas vasculares. LA_HOJA trata por separado las hojas de dicotiledóneas, monocotiledóneas, gimnospermas y pteridofitas.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Angiosperma: dicotiledónea** | Planta con flor cuyo embrión tiene dos cotiledones. Sus hojas suelen tener lámina, pecíolo, base foliar y a veces estípulas, con venación cerrada (en red). | Hibiscus rosa-sinensis (rosa china) | LA_HOJA |
| **Angiosperma: monocotiledónea** | Planta con flor cuyo embrión tiene un cotiledón. Sus hojas son generalmente enteras, con venación paralela y vaina siempre bien desarrollada. | Zea mays (maíz), Tulipa, Canna indica (achira) | LA_HOJA |
| **Gimnosperma** | Planta con semillas pero sin flores ni frutos verdaderos. Su hoja típica es acicular o escuamiforme, aunque hay excepciones: hojas en abanico (Ginkgo), pinnaticompuestas (Cycas) o pecioladas (Gnetum). *Nota: LA_HOJA describe las hojas; 'sin flores ni frutos verdaderos' es complementario.* | Pinus, Thuja, Araucaria angustifolia, Ginkgo biloba | LA_HOJA + complementaria |
| **Helecho o planta afín (pteridofita)** | Planta vascular sin semillas. Tiene micrófilos (Selaginella, Lycopodium) o megáfilos llamados frondes (helechos), con prefoliación circinada. | Selaginella sellowii, Lycopodium, Nephrolepis cordifolia, Adiantum | LA_HOJA |

## B. Tipo y organización de la hoja

### Tipo de hoja
`b_tipo` · Fuente: LA_HOJA · un valor · no admite ausente

> Mire dónde está la yema axilar: está en la base del pecíolo de la hoja completa, nunca en la base de cada folíolo.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Simple** | Hoja con una sola lámina foliar. Puede estar dividida (fida, partida o secta), pero sus porciones no son folíolos articulados. | Eugenia uniflora (ñangapiré) | LA_HOJA |
| **Compuesta** | Lámina dividida en folíolos articulados sobre el raquis o sus divisiones. Los folíolos pueden tener peciólulos o ser sésiles. | Fraxinus (fresno), Erythrina crista-galli (ceibo) | LA_HOJA |

### Grado de división de la hoja simple
`b_division` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Tipo de hoja" es Simple.*

> Compare la profundidad de las incisiones con la distancia entre el borde y el nervio.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Entera** | Lámina sin incisiones. | Eugenia uniflora (ñangapiré) | LA_HOJA |
| **Fida o lobada**<br>sin.: hendida, lobada | Incisiones que no llegan a la mitad de la distancia entre el borde y el nervio (menos del 50 %). | Turnera sidoides (pinnatífida), Platanus (palmatífida) | LA_HOJA |
| **Partida** | Incisiones que pasan la mitad de esa distancia (más del 50 %). | Quercus robur (pinnatipartida), Passiflora caerulea (palmatipartida) | LA_HOJA |
| **Secta** | Incisiones que llegan casi hasta el nervio, o hasta él. Las porciones tienen base ancha y no están articuladas. | Taraxacum officinale (pinnatisecta), Manihot esculenta (palmatisecta), Dahlia, Foeniculum | LA_HOJA |

### Disposición de las divisiones
`b_division_disposicion` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Grado de división de la hoja simple" es Fida o lobada o Partida o Secta.*

> Al combinar este carácter con el anterior salen los nombres de LA_HOJA: pinnatífida, pinnatipartida, pinnatisecta, palmatífida, palmatipartida y palmatisecta.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Pinnada (pinnati-)** | Las divisiones se disponen a lo largo del nervio medio. | Turnera sidoides, Quercus robur, Taraxacum officinale | Complementaria |
| **Palmeada (palmati-)** | Las divisiones salen de un mismo punto en la base de la lámina. | Platanus, Passiflora caerulea, Manihot esculenta (yuca) | Complementaria |

### Organización de la hoja compuesta
`b_compuesta` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Tipo de hoja" es Compuesta.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Unifoliolada** | Un solo folíolo, articulado con el pecíolo. | Citrus aurantium (naranjo agrio) | LA_HOJA |
| **Bifoliolada** | Dos folíolos. | Melicoccus lepidopetalus (coquito de San Juan) | LA_HOJA |
| **Trifoliolada o ternada**<br>sin.: ternada | Tres folíolos. | Erythrina crista-galli (ceibo) | LA_HOJA |
| **Pinnada** | Más de tres folíolos (pinnas) dispuestos a lo largo de un eje o raquis. | Fraxinus (fresno) | LA_HOJA |
| **Palmaticompuesta**<br>sin.: digitada (guía de campo) | Más de tres folíolos insertos todos en el extremo del raquis. No se conocen hojas bipalmaticompuestas. | Tabebuia heptaphylla (lapacho rosado), palo borracho | LA_HOJA |

### Grado de división de la hoja pinnada
`b_pinnada_grado` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Organización de la hoja compuesta" es Pinnada.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Una vez pinnada** | Los folíolos se insertan directamente en el raquis principal. | Fraxinus (fresno) | Complementaria |
| **Bipinnada** | Con raquis secundarios. Las últimas porciones de lámina se llaman pínnulas. | Acacia | LA_HOJA |
| **Tripinnada** | Con raquis terciarios. | - | LA_HOJA |
| **Cuadripinnada** | Con raquis de cuarto orden. | - | LA_HOJA |

### Terminación de la hoja pinnada
`b_pinnada_terminal` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Organización de la hoja compuesta" es Pinnada.*

> Es independiente del grado de división: hay hojas bipinnadas paripinnadas, como Acacia.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Paripinnada** | El raquis termina sin folíolo terminal, así que los folíolos suelen ser pares. | Acacia (bipinnada paripinnada) | Complementaria |
| **Imparipinnada** | El raquis termina en un folíolo terminal, así que los folíolos suelen ser impares. | Fraxinus (fresno) | Complementaria |

### Tipo de hoja de monocotiledónea
`b_monocot` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Grupo vegetal" es Angiosperma: monocotiledónea.*

> Los cinco tipos que describe LA_HOJA (sección 2.5).

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Tipo 1: lámina con vaina** | Limbo entero y alargado, de venación paralela, unido al tallo por una vaina que lo abraza. Puede tener lígula entre la lámina y la vaina. | Zea mays (maíz), Tulipa, Convallaria | LA_HOJA |
| **Tipo 2: con pecíolo entre vaina y lámina** | Tiene un pecíolo entre la vaina y la lámina. Puede tener un pecíolo inflado, una estípula intrapeciolar o pulvinos. | Araceae (Syngonium podophyllum), Eichhornia crassipes (camalote), Marantaceae (Calathea makoyana) | LA_HOJA |
| **Tipo 3: ensiforme o equitante** | La vaina lleva sobre su cara dorsal un limbo aplanado en un plano perpendicular al tallo, con las dos caras verticales. Incluye la variante de lámina cilíndrica sobre una vaina cerrada. | Iridaceae, Belamcanda chinensis; variante cilíndrica: Allium cepa (cebolla), Juncus microcephalus | LA_HOJA |
| **Tipo 4: hoja de palmera** | Limbo plegado, entero al inicio, que luego se divide (sectado), con venación pinnada o palmada. En Caryota es doblemente sectado. | Butia yatay, Arecastrum romanzoffianum (pinnadas); Copernicia alba (palmada); Caryota | LA_HOJA |
| **Tipo 5: pinnati-paralelinervada** | La línea media tiene muchas venas paralelas. Las venas periféricas se desvían casi en ángulo recto y recorren la lámina como secundarias paralelas. La hoja tiende a desgarrarse. | Canna (achira), Musa (bananero) | LA_HOJA |

### Tipo de hoja de gimnosperma
`b_gimno` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Grupo vegetal" es Gimnosperma.*

> Tipos descritos en LA_HOJA (sección 2.6).

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Acicular** | Aguja verde con una sola vena y punta aguda. Su base se une al eje formando el cojinete foliar. | Abies, Larix, Picea, Pinus (en ramas cortas de 1 a 5 hojas) | LA_HOJA |
| **Escuamiforme** | Hoja reducida, en forma de escama, con una sola vena. A menudo está soldada en parte al tallo. | Taxodiaceae, Cupressaceae, Podocarpaceae; Thuja, cipreses | LA_HOJA |
| **Ancha con varias venas** | Hoja anchamente ovada, con varias venas. | Algunas Araucariaceae | LA_HOJA |
| **En abanico** | Limbo expandido en forma de abanico, con venación dicotómica abierta. | Ginkgo biloba | LA_HOJA |
| **Pinnaticompuesta** | Hoja compuesta pinnada. | Cycas revoluta | LA_HOJA |
| **Peciolada, parecida a la de dicotiledónea** | Hoja con pecíolo y lámina, parecida a la de una dicotiledónea. | Gnetum | LA_HOJA |

### Tipo de hoja de pteridofita
`b_pterido` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Grupo vegetal" es Helecho o planta afín (pteridofita).*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Micrófilo** | Hoja reducida, de pocos milímetros, entera y sin pecíolo, sin vascularización o con una sola vena. | Selaginella, Lycopodium | LA_HOJA |
| **Megáfilo (fronde)** | Hoja grande, a menudo compuesta, con venación muy desarrollada y crecimiento apical prolongado. Tiene un pecíolo con escamas pardas. | Filicales: Nephrolepis cordifolia | LA_HOJA |

### Forma de la fronde
`b_fronde` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Tipo de hoja de pteridofita" es Megáfilo (fronde).*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Simple entera** | Lámina alargada y entera. | Ophioglossum | LA_HOJA |
| **Simple pinnatífida o pinnatisecta** | Lámina simple con divisiones que no forman pinnas articuladas. | - | LA_HOJA |
| **Pinnada** | Lámina pinnada con raquis simple. | Polypodium vulgare | LA_HOJA |
| **Bipinnada** | Con raquis primario y secundarios. | Polystichum filix-mas, Macrothelypteris torresiana | LA_HOJA |
| **Tripinnada** | Con raquis primario, secundarios y terciarios. | Pteris aquilina | LA_HOJA |

## C. Forma de la lámina

### Forma de la lámina (o del folíolo)
`forma` · Fuente: LA_HOJA · varios valores · no admite ausente

> En una hoja compuesta se registra la forma del folíolo. Marque más de una forma si la especie varía.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Lanceolada**<br>sin.: lanceada (guía de campo) | Varias veces más larga que ancha, más ancha en el tercio inferior y estrechada hacia el ápice, como punta de lanza. | Ligustrum (aligustre, citado en la guía de campo) | Complementaria |
| **Hastada** | Más o menos triangular, con dos lóbulos basales agudos que se abren hacia afuera, como una alabarda. | - | Complementaria |
| **Romboidal** | En forma de rombo, más ancha en la mitad. | Eichhornia azurea (hojas emergentes) | Complementaria |
| **Obromboidal** | Rombo con la parte más ancha por encima de la mitad. | - | Complementaria |
| **Elíptica** | Más ancha en la mitad, con bordes curvos y ambos extremos parecidos. Es de 1,5 a 2 veces más larga que ancha. | Eichhornia azurea (hojas emergentes) | Complementaria |
| **Oblonga** | De 2 a 3 veces más larga que ancha, con bordes casi paralelos en buena parte de su longitud. | - | Complementaria |
| **Triangular** | En forma de triángulo, con la base ancha. | - | Complementaria |
| **Obtriangular** | Triángulo invertido: ancha en el ápice y estrecha en la base. | - | Complementaria |
| **Cordada** | Ovada, con una escotadura en la base que forma dos lóbulos redondeados, como un corazón. | - | Complementaria |
| **Obcordada** | Corazón invertido: la escotadura está en el ápice. | - | Complementaria |
| **Ovada**<br>sin.: aovada (guía de campo) | Con el contorno de un huevo, más ancha en la mitad inferior. | - | LA_HOJA + complementaria |
| **Obovada**<br>sin.: trasovada (guía de campo) | Huevo invertido: más ancha en la mitad superior. | - | LA_HOJA + complementaria |
| **Reniforme** | Más ancha que larga, en forma de riñón, con la base escotada. | - | Complementaria |
| **Linear** | Muy larga y estrecha, con bordes paralelos. | Eichhornia azurea (hojas sumergidas, acintadas) | Complementaria |
| **Escuamiforme** | Pequeña y en forma de escama. | Thuja, Cupressaceae | Complementaria |
| **Acicular** | Linear, puntiaguda y por lo común persistente, como una aguja. | Pinus (pino) | Guía de campo |
| **Panduriforme** | Con forma de violín: ensanchada en los extremos y estrechada en la parte media. | - | Complementaria |
| **Orbicular** | De contorno casi circular. | - | Complementaria |
| **Cuneiforme** (Guía de campo) | En forma de cuña: ancha en la parte superior y estrechada gradualmente hacia la base. La guía la describe como 'pico de pato'. | Pittosporum tobira (citado en la guía de campo) | LA_HOJA + complementaria |

## D. Base de la lámina

### Base de la lámina
`base` · Fuente: LA_HOJA · varios valores · no admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Cuneada** | Se estrecha hacia el pecíolo en forma de cuña, con bordes rectos que convergen. | - | Complementaria |
| **Aguda** | Termina en un ángulo menor de 90°, con bordes rectos o algo convexos. | - | Complementaria |
| **Redondeada** | Base en forma de arco. | - | Complementaria |
| **Cordada** | Con una escotadura que forma dos lóbulos redondeados. | - | Complementaria |
| **Truncada** | Como cortada transversalmente: recta, casi perpendicular al nervio medio. | - | Complementaria |
| **Hastada** | Con dos lóbulos basales agudos que se abren hacia afuera. | - | Complementaria |
| **Sagitada** | Con dos lóbulos basales agudos dirigidos hacia abajo, como punta de flecha. | - | Complementaria |
| **Peltada** | El pecíolo se inserta en el centro de la lámina, no en el borde. | Victoria cruziana (irupé) | LA_HOJA |

## E. Ápice de la lámina

### Ápice de la lámina
`apice` · Fuente: LA_HOJA · varios valores · no admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Acuminado** | Se estrecha bruscamente en una punta larga y fina. | - | Complementaria |
| **Agudo** | Termina en un ángulo menor de 90°, con bordes rectos. | - | Complementaria |
| **Redondeado** | Termina en un arco. | - | Complementaria |
| **Obtuso** | Termina en un ángulo mayor de 90°, romo. | - | Complementaria |
| **Retuso** | Redondeado u obtuso, con una escotadura pequeña y poco profunda. | - | Complementaria |
| **Obcordado** | Con una escotadura profunda que forma dos lóbulos redondeados. | - | Complementaria |
| **Cuspidado** | Termina de golpe en una punta rígida y aguda (cúspide). | - | Complementaria |
| **Mucronado** | Redondeado u obtuso, termina en una punta corta (mucrón) que prolonga el nervio medio. | - | Complementaria |
| **Truncado** | Como cortado transversalmente. | - | Complementaria |
| **Emarginado**<br>sin.: escotada (guía de campo) | Con una escotadura evidente en el ápice. | - | Complementaria |
| **Atenuado** | Se estrecha poco a poco en una punta larga. | - | Complementaria |

## F. Margen foliar

### Margen: contorno del borde
`margen` · Fuente: LA_HOJA · varios valores · no admite ausente

> LA_HOJA señala que también importan el espaciado y el tamaño de los dientes (iguales, desiguales o dobles). Anótelo en observaciones.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Entero**<br>sin.: enterísima (guía de campo) | Borde liso, sin dientes ni lóbulos. | Erythrina crista-galli (seibo) | Complementaria |
| **Serrulado** | Aserrado con dientes muy pequeños. | - | Complementaria |
| **Aserrado** | Dientes agudos inclinados hacia el ápice, como una sierra. | Mespilus germanica (níspero); violeta (guía de campo) | Guía de campo |
| **Doblemente aserrado** | Dientes aserrados que a su vez tienen dientes menores. | Turnera orientalis | Complementaria |
| **Crenado** | Dientes redondeados. | Pelargonium hortorum (malvón) | Complementaria |
| **Lobado** | Con lóbulos redondeados. | Quercus robur (roble) | Complementaria |
| **Sinuado** | Con entrantes y salientes suaves en el plano de la lámina. | - | Complementaria |
| **Ondulado** | El borde forma ondas. | - | Complementaria |
| **Inciso** | Con cortes profundos e irregulares. | - | Complementaria |
| **Eroso** | Con dientes irregulares, como roído. | - | Complementaria |
| **Dentado** | Dientes de puntas rectas, dirigidos hacia afuera. | Macfadyena dentata (uña de gato); castaño común (guía de campo) | Guía de campo |

### Margen: curvatura del borde
`margen_curvatura` · Fuente: LA_HOJA · un valor · no admite ausente

> LA_HOJA los incluye en la lista de márgenes, pero describen otra cosa (hacia dónde se curva el borde), por eso van en un selector aparte.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Plano** | El borde sigue el plano de la lámina. | - | Complementaria |
| **Revoluto** | Borde enrollado hacia el envés. | Rosmarinus officinalis (romero) | Complementaria |
| **Involuto** | Borde enrollado hacia el haz. | - | Complementaria |

## G. Nervadura (venación)

### Tipo de venación mayor
`nervadura` · Fuente: LA_HOJA · un valor · no admite ausente

> Se basa en las venas primarias, las más gruesas (Hickey). Craspedódroma, camptódroma e hifódroma son variantes de la venación pinnada.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Pinnada craspedódroma** | Una vena media con venas secundarias escalonadas que terminan en el margen. | - | LA_HOJA |
| **Pinnada camptódroma** | Una vena media con venas secundarias que terminan antes del margen. | - | LA_HOJA |
| **Pinnada hifódroma** | Solo se ve la vena media. Las secundarias faltan, son rudimentarias o quedan ocultas en un mesófilo carnoso o coriáceo. | - | LA_HOJA |
| **Paralelódroma**<br>sin.: nerviosa (guía de campo: rayas de arriba abajo que no se dividen; ej. llantén) | Dos o más venas primarias nacen a cada lado de la base y corren paralelas hasta el ápice, donde convergen. | Plantago | LA_HOJA |
| **Campilódroma** | Varias venas primarias nacen en un mismo punto y forman arcos recurvos que convergen hacia el ápice. También se da en monocotiledóneas. | - | LA_HOJA |
| **Acródroma** | Dos o más venas primarias, o secundarias muy desarrolladas, forman arcos no recurvos que convergen hacia el ápice. | Saponaria, Bupleurum | LA_HOJA |
| **Actinódroma** | Tres o más venas basales que se separan radialmente desde un punto. | Malvaceae, Tiliaceae | LA_HOJA |
| **Palinactinódroma (pedada)** | Las venas primarias se ramifican dicotómicamente, más o menos separadas. Las dos laterales inferiores forman ángulos muy abiertos con la vena media. | Platanus | LA_HOJA |
| **Dicotómica abierta** | Las venas se bifurcan una y otra vez y terminan libres, sin unirse en red. No forma aréolas. | Ginkgo biloba, Adiantum (culantrillo), Circaeaster | LA_HOJA |
| **Pinnati-paralelinervada** | Nervio medio grueso del que salen venas secundarias paralelas casi en ángulo recto (tipo 5 de monocotiledóneas). | Canna (achira), Musa (bananero) | LA_HOJA |

## H. Filotaxis

### Disposición de las hojas en el tallo
`filotaxis` · Fuente: LA_HOJA · un valor · no admite ausente

> Cuente cuántas hojas salen de cada nudo: una (alterna), dos (decusada) o tres o más (verticilada).

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Alterna dística** | Una hoja por nudo, alternando sobre dos líneas opuestas del tallo (ortósticos). Es frecuente en monocotiledóneas y rara en dicotiledóneas. | Belamcanda chinensis | LA_HOJA |
| **Alterna helicoidal** | Una hoja por nudo, sobre una espiral alrededor del tallo. El ángulo de divergencia suele ser de 137° a 140°. | Boehmeria nivea | LA_HOJA |
| **Opuesta decusada** | Dos hojas por nudo. Cada par queda en cruz con el par siguiente. | Amaranthaceae, Labiatae | LA_HOJA |
| **Verticilada** | Tres o más hojas por nudo. | Nerium oleander (laurel rosa), Apocynaceae | LA_HOJA |

### Posición de las hojas
`posicion` · Fuente: Guía de campo · varios valores · no admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Caulinares** (Complementario) | Hojas insertas a lo largo del tallo aéreo. | - | Complementaria |
| **Radicales (basales)** | Hojas que parecen nacer de la raíz, agrupadas en la base de la planta. | Mandrágora (citada en la guía de campo) | Guía de campo |

## I. Pecíolo, base foliar y estructuras asociadas

### Pecíolo
`peciolo` · Fuente: LA_HOJA · un valor · no admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Peciolada** | Con pecíolo que une la lámina al tallo. | Broussonetia papyrifera | LA_HOJA |
| **Sésil** | Sin pecíolo: el limbo se une directamente al tallo. | Dianthus caryophyllus (clavel) | LA_HOJA |

### Inserción de la hoja sésil
`sesil_tipo` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Pecíolo" es Sésil.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Sésil simple** | El limbo se inserta en el tallo sin rodearlo. | - | Complementaria |
| **Abrazadora** | La base del limbo abraza el tallo. | Bupleurum | LA_HOJA |
| **Connada (soldadas)** | Dos hojas sésiles del mismo nudo se sueldan entre sí y rodean el tallo. | Lonicera implexa, Dianthus, Deianira erubescens | LA_HOJA |
| **Perfoliada** (Guía de campo) | Una hoja cuya base rodea por completo el tallo, sin formar tubo. | - | Guía de campo |
| **Escurrida (decurrente)** (Guía de campo)<br>sin.: escurrida (guía de campo) | Hoja sésil cuya base se prolonga hacia abajo por ambos lados del tallo. | - | Guía de campo |

### Forma del pecíolo
`peciolo_forma` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Pecíolo" es Peciolada.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Cilíndrico** | Pecíolo estrecho y de sección circular. | - | LA_HOJA |
| **Acanalado** | Pecíolo hundido en la cara superior. | - | LA_HOJA |
| **Aplanado o alado** | Pecíolo aplanado y ancho. | Citrus | LA_HOJA |
| **Inflado** | Pecíolo hinchado, a veces flotador. | Eichhornia crassipes (camalote) | LA_HOJA |

### Pulvinos
`pulvino` · Fuente: LA_HOJA · varios valores · admite ausente

> Engrosamientos que parecen articulaciones, con superficie arrugada. Están relacionados con los movimientos de las hojas (nastias).

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Pulvino** | Engrosamiento en la base o el ápice del pecíolo. | Marantaceae (entre el pecíolo y la lámina) | LA_HOJA |
| **Pulvínulo** | Engrosamiento en el peciólulo de cada folíolo de una hoja compuesta. | Mimosa paupera | LA_HOJA |

### Vaina foliar
`vaina` · Fuente: LA_HOJA · un valor · admite ausente

> Base foliar ensanchada que envuelve el tallo.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Vaina abierta** | La base foliar abraza el tallo, pero sus bordes no se sueldan. | Apium graveolens (apio), Umbelliferae, Zea mays | LA_HOJA + complementaria |
| **Vaina cerrada** | Vaina cilíndrica totalmente cerrada alrededor del tallo. | Allium cepa (cebolla), Juncus microcephalus | LA_HOJA |

### Lígula
`ligula` · Fuente: LA_HOJA · un valor · admite ausente

> Apéndice laminar vertical en la unión entre la lámina y la vaina, típico de gramíneas.

Solo se registra si está presente, ausente o no observado.

### Estípulas: disposición
`estipulas` · Fuente: LA_HOJA · varios valores · admite ausente

> Apéndices a ambos lados de la base del pecíolo. Si comprobó que no tiene, marque Ausente.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Libres, laterales** | Una a cada lado del pecíolo, sin soldarse. | Gossypium hirsutum (algodón) | LA_HOJA |
| **Adnatas al pecíolo** | Soldadas al pecíolo. | Rosa | LA_HOJA |
| **Axilares o intrapeciolares** | Las dos estípulas de la hoja se sueldan entre la hoja y el tallo. | Eichhornia crassipes (una estípula intrapeciolar membranácea) | LA_HOJA |
| **Opositifolias** | Soldadas entre sí, abrazando el tallo del lado opuesto a la hoja. | Coronilla minima; Platanus (coherentes) | LA_HOJA |
| **Ócrea** | Estípulas soldadas que forman un tubo alrededor del tallo. | Polygonum | LA_HOJA |
| **Interpeciolares** | Se sueldan estípulas de hojas distintas del mismo nudo, quedando entre los pecíolos. | Muchas Rubiaceae; Coffea arabica (café) | LA_HOJA |
| **En capuchón terminal** | Estípulas soldadas que forman un capuchón protector sobre el meristema apical. | Ficus religiosa, Ficus benjamina | LA_HOJA |

### Estípulas: tamaño y forma
`estipulas_forma` · Fuente: LA_HOJA · varios valores · no admite ausente

*Solo se pregunta si "Estípulas: disposición" está presente.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Pequeñas** | Estípulas mucho menores que el limbo. | - | LA_HOJA |
| **Foliáceas** | Estípulas parecidas a hojas, a veces del tamaño del limbo. | Pisum sativum (arveja), Lathyrus aphaca | LA_HOJA |
| **Compuestas (pinnadas)** | Estípulas divididas como una hoja pinnada. | Delonix regia (chivato), Peltophorum dubium | LA_HOJA |

### Estípulas: duración
`estipulas_duracion` · Fuente: LA_HOJA · un valor · no admite ausente

*Solo se pregunta si "Estípulas: disposición" está presente.*

> Si las estípulas son caducas, quizás ya no estén. Mire las cicatrices en el nudo antes de marcarlas como ausentes.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Caducas** | Caen mucho antes que el resto de la hoja. | Delonix regia | LA_HOJA |
| **Persistentes** | Permanecen incluso después de que cae la hoja. | - | LA_HOJA |

### Estipelas
`estipelas` · Fuente: LA_HOJA · un valor · admite ausente

> Son parecidas a las estípulas, pero están en la base de los folíolos de una hoja compuesta.

Solo se registra si está presente, ausente o no observado.

## J. Superficie de la hoja

### Color de las caras
`color_caras` · Fuente: LA_HOJA · un valor · no admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Concolora** | Haz y envés del mismo color. | - | LA_HOJA |
| **Discolora** | Haz y envés de distinto color. Por lo general el haz es de un verde más oscuro. | - | LA_HOJA |

### Consistencia de la lámina
`textura` · Fuente: Complementario · un valor · no admite ausente

> LA_HOJA solo menciona el mesófilo 'carnoso o coriáceo' (al hablar de la venación hifódroma). Los demás términos son complementarios.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Membranácea** | Delgada, blanda y algo translúcida. | - | Complementaria |
| **Cartácea** | Con la consistencia del papel. | - | Complementaria |
| **Coriácea** (LA_HOJA) | Gruesa y dura, como cuero. | - | Complementaria |
| **Carnosa o suculenta** (LA_HOJA) | Gruesa y jugosa. | - | Complementaria |

### Pelos de la lámina (indumento)
`indumento` · Fuente: Complementario · varios valores · no admite ausente

> No aparece en LA_HOJA, pero suele ser muy útil para distinguir especies.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Glabra** | Sin pelos. | - | Complementaria |
| **Pubescente** | Con pelos finos y cortos. | - | Complementaria |
| **Tomentosa** | Con pelos densos y entrelazados, como fieltro. | - | Complementaria |
| **Escabrosa** | Áspera al tacto por pelos cortos y rígidos. | - | Complementaria |

## K. Tallo

### Consistencia del tallo
`tallo_consistencia` · Fuente: Complementario · un valor · no admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Leñoso** | Tallo duro, con madera. | - | Complementaria |
| **Herbáceo** | Tallo blando y verde, sin madera. | - | Complementaria |
| **Suculento** | Tallo grueso y carnoso, que almacena agua. | - | Complementaria |

### Sección transversal del tallo
`tallo_seccion` · Fuente: Complementario · un valor · no admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Cilíndrico** | Sección circular. | - | Complementaria |
| **Cuadrangular** | Sección cuadrada, con cuatro aristas. | - | Complementaria |
| **Triangular** | Sección triangular. | - | Complementaria |
| **Aplanado** | Sección comprimida. | - | Complementaria |

### Látex o exudado
`exudado` · Fuente: Complementario · varios valores · admite ausente

> Haga un corte pequeño en el tallo o el pecíolo y observe qué sale.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Látex blanco** | Líquido lechoso blanco. | - | Complementaria |
| **Látex coloreado** | Líquido amarillo, anaranjado o rojizo. | - | Complementaria |
| **Resina** | Exudado pegajoso y aromático. | - | Complementaria |
| **Exudado acuoso o mucilaginoso** | Líquido transparente, a veces viscoso. | - | Complementaria |

### Estructuras punzantes
`tallo_punzantes` · Fuente: Complementario · varios valores · admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Espinas** | Órganos modificados, duros y punzantes, con tejido vascular (por ejemplo, ramas o hojas transformadas). | - | Complementaria |
| **Aguijones** | Puntas duras que salen de la epidermis y se desprenden con facilidad, como en el rosal. | - | Complementaria |

### Zarcillos
`zarcillos` · Fuente: LA_HOJA · varios valores · admite ausente

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **De origen foliar** | La hoja, o parte de ella, se transforma en zarcillo. | Lathyrus aphaca (el limbo se reduce a un zarcillo) | LA_HOJA |
| **De origen caulinar** (Complementario) | Rama transformada en zarcillo. | - | Complementaria |

## L. Hábito de crecimiento

### Hábito o forma de vida
`habito` · Fuente: Guía de campo · varios valores · no admite ausente

> Las formas de vida que lista la guía de campo (método de puntos de intercepción). Una planta puede tener dos, por ejemplo hierba y trepadora.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Árbol** | Planta leñosa con un tronco principal definido. | - | Complementaria |
| **Arbusto** | Planta leñosa ramificada desde la base, sin tronco principal. | - | Complementaria |
| **Subarbusto** | Planta leñosa solo en la base, con ramas superiores herbáceas. | - | Complementaria |
| **Hierba** | Planta no leñosa. | - | Complementaria |
| **Graminoide** | Hierba con aspecto de pasto: hojas lineares y venación paralela. | - | Complementaria |
| **Trepadora o bejuco** | Planta que se apoya en otras para subir. | - | Complementaria |
| **Epífita** | Planta que crece sobre otra sin parasitarla. | - | Complementaria |
| **Roseta** (Complementario) | Hojas agrupadas en una roseta, en la base o en el extremo de un tallo. | - | Complementaria |
| **Acuática** (Complementario) | Planta que vive en el agua, flotante o arraigada. | Eichhornia crassipes (camalote) | Complementaria |

## M. Flor e inflorescencia

### Flores
`flores` · Fuente: Complementario · un valor · admite ausente

> Si la planta no tenía flores el día de la salida, deje 'No observado'. Use 'Ausente' solo si el grupo no produce flores (helechos, gimnospermas).

Solo se registra si está presente, ausente o no observado.

### Color de la flor
`flor_color` · Fuente: Complementario · varios valores · no admite ausente

*Solo se pregunta si "Flores" está presente.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Blanco** | - | - | Complementaria |
| **Amarillo** | - | - | Complementaria |
| **Anaranjado** | - | - | Complementaria |
| **Rojo** | - | - | Complementaria |
| **Rosado** | - | - | Complementaria |
| **Morado o violeta** | - | - | Complementaria |
| **Azul** | - | - | Complementaria |
| **Verde** | - | - | Complementaria |
| **Otro** | - | - | Complementaria |

### Simetría de la flor
`flor_simetria` · Fuente: Complementario · un valor · no admite ausente

*Solo se pregunta si "Flores" está presente.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Actinomorfa (radial)** | Se puede dividir en mitades iguales por varios planos. | - | Complementaria |
| **Zigomorfa (bilateral)** | Solo un plano la divide en dos mitades iguales. | - | Complementaria |
| **Asimétrica** | Ningún plano la divide en mitades iguales. | - | Complementaria |

### Número de pétalos o tépalos
`flor_piezas` · Fuente: Complementario · un valor · no admite ausente

*Solo se pregunta si "Flores" está presente.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **3 o múltiplos de 3** | - | - | Complementaria |
| **4 o múltiplos de 4** | - | - | Complementaria |
| **5 o múltiplos de 5** | - | - | Complementaria |
| **Numerosos (más de 10)** | - | - | Complementaria |
| **Sin pétalos visibles** | - | - | Complementaria |

### Tipo de inflorescencia
`inflorescencia` · Fuente: Complementario · un valor · no admite ausente

*Solo se pregunta si "Flores" está presente.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Flor solitaria** | Una sola flor en el pedúnculo. | - | Complementaria |
| **Racimo** | Eje con flores pediceladas. | - | Complementaria |
| **Espiga** | Eje con flores sésiles. | - | Complementaria |
| **Umbela** | Pedicelos que salen de un mismo punto. | - | Complementaria |
| **Corimbo** | Pedicelos de distinta longitud, con las flores a la misma altura. | - | Complementaria |
| **Panícula** | Racimo ramificado. | - | Complementaria |
| **Cima** | El eje termina en una flor y las ramas laterales siguen creciendo. | - | Complementaria |
| **Capítulo** | Flores sésiles sobre un receptáculo ensanchado, como en las Asteraceae. | - | Complementaria |
| **Espádice** | Espiga carnosa, a menudo rodeada por una espata, como en las Araceae. | - | Complementaria |

## N. Fruto

### Frutos
`frutos` · Fuente: Complementario · un valor · admite ausente

> Igual que con las flores: si no había frutos ese día, deje 'No observado'.

Solo se registra si está presente, ausente o no observado.

### Tipo de fruto
`fruto_tipo` · Fuente: Complementario · un valor · no admite ausente

*Solo se pregunta si "Frutos" está presente.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Baya** | Fruto carnoso con una o varias semillas, sin hueso. | - | Complementaria |
| **Drupa** | Fruto carnoso con un hueso (endocarpo duro) que encierra la semilla. | - | Complementaria |
| **Cápsula** | Fruto seco que se abre (dehiscente) y viene de varios carpelos. | - | Complementaria |
| **Legumbre** | Fruto seco de un solo carpelo que se abre por dos suturas, como en las Fabaceae. | - | Complementaria |
| **Aquenio** | Fruto seco que no se abre, con una semilla libre dentro. | - | Complementaria |
| **Cariópside** | Fruto seco con la semilla soldada a la pared, como en las gramíneas. | - | Complementaria |
| **Sámara** | Fruto seco que no se abre, con un ala. | - | Complementaria |
| **Folículo** | Fruto seco de un carpelo que se abre por una sola sutura. | - | Complementaria |
| **Silicua** | Fruto seco con un tabique central, como en las Brassicaceae. | - | Complementaria |
| **Nuez** | Fruto seco que no se abre, de pared dura. | - | Complementaria |
| **Esquizocarpo** | Fruto seco que se separa en partes, como en las Apiaceae. | - | Complementaria |
| **Otro** | - | - | Complementaria |

### Consistencia del fruto
`fruto_consistencia` · Fuente: Complementario · un valor · no admite ausente

*Solo se pregunta si "Frutos" está presente.*

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Carnoso** | - | - | Complementaria |
| **Seco** | - | - | Complementaria |

## O. Ambiente

### Zona climática
`zona` · Fuente: Guía de campo · un valor · no admite ausente

> Las tres zonas de clima del recorrido según la guía de campo (de 4 °C a 24 °C). Se toma de la estación de muestreo.

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Frío o páramo** | - | - | Guía de campo |
| **Templado** | - | - | Guía de campo |
| **Cálido** | - | - | Guía de campo |

## P. Notas opcionales (LA_HOJA)

### Prefoliación o vernación (en la yema)
`prefoliacion` · Fuente: LA_HOJA · un valor · no admite ausente · opcional

| Término | Definición | Ejemplo | Fuente def. |
|---|---|---|---|
| **Plana** | Limbo extendido. | - | LA_HOJA |
| **Conduplicada** | Limbo plegado en dos a lo largo de la vena media. | Petunia thymifolia | LA_HOJA |
| **Replegada** | Limbo plegado como un abanico. | Vid | LA_HOJA |
| **Convoluta** | Limbo enrollado paralelo a la vena media. | Lechuga | LA_HOJA |
| **Involuta** | Márgenes enrollados hacia el haz. | Álamo, peral | LA_HOJA |
| **Revoluta** | Márgenes enrollados hacia el envés. | Sauce, Muehlenbeckia sagittifolia | LA_HOJA |
| **Circinada** | Hoja enrollada sobre sí misma desde el ápice hacia la base. Es típica de las pteridofitas. | Helechos; Utricularia foliosa | LA_HOJA |

### Heterofilia
`heterofilia` · Fuente: LA_HOJA · un valor · admite ausente · opcional

> Hojas de forma y tamaño diferentes en una misma planta, como las hojas sumergidas y emergentes de Eichhornia azurea.

Solo se registra si está presente, ausente o no observado.

### Anisofilia
`anisofilia` · Fuente: LA_HOJA · un valor · admite ausente · opcional

> Hojas de distinta forma y tamaño en un mismo sector del tallo, como en Selaginella.

Solo se registra si está presente, ausente o no observado.

## Datos de la estación de muestreo
Se escriben una vez por estación y se comparten entre todas las especies registradas allí.

- Nombre de la estación
- Fecha
- Municipio (sugerencias: Tunja, Ventaquemada, Machetá, Guateque, Santa María, San Luis de Gaceno)
- Vereda
- Localidad
- Zona climática
- Altitud (m s. n. m.)
- Temperatura ambiente (°C)
- Temperatura del suelo (°C)
- Humedad relativa (%)
- Observaciones del entorno

## Tipos de fotografía
Planta completa · Hoja · Haz de la hoja · Envés de la hoja · Tallo · Flor · Fruto · Otro detalle morfológico
