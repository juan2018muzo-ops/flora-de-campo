# Flora de campo

Aplicación web para identificar y registrar plantas por sus características morfológicas, hecha para la salida de campo de **Biología Vegetal II** (UPTC). El vocabulario sale del documento *LA_HOJA* y de la guía de campo (ver `docs/vocabulario.md`).

Funciona en el celular y en el computador, **sin internet** después de la primera carga, y no necesita instalar nada.

## Qué hace

| Pestaña | Para qué |
|---|---|
| **Identificar** | Marque lo que ve en la planta; la app la compara con las especies registradas y muestra el porcentaje de coincidencia (orientativo). |
| **Catálogo** | Fichas de cada especie (con fotos, imprimibles en PDF), comparación entre dos especies, **álbum de hojas** y **glosario ilustrado**. |
| **Registrar** | Nueva especie: estación de muestreo, fotos etiquetadas y características (presente / ausente / no observado). |
| **Claves** | Clave dicotómica generada a partir de las especies, editable e imprimible. |

El ícono de base de datos (arriba a la derecha) abre **Datos y copias de seguridad**: descargar un respaldo `.json` (con fotos), importar el de un compañero (agregar o reemplazar) y borrar todo.

> Los datos se guardan **solo en el navegador de cada dispositivo**. Descargue copias de seguridad con frecuencia, sobre todo antes de borrar datos del navegador o cambiar de celular.

## Abrirla en el computador

Desde esta carpeta, en una terminal:

```bash
python -m http.server 8000
```

y abra <http://localhost:8000>. (Abrir `index.html` con doble clic también funciona, pero sin el modo sin conexión).

## Usarla en el celular: publicarla gratis con GitHub Pages

El celular necesita una dirección `https://`. Una forma gratuita y permanente:

1. Cree una cuenta en <https://github.com> (si no tiene).
2. Botón **New repository** → nombre, por ejemplo `flora-de-campo` → **Public** → **Create repository**.
3. En el repositorio nuevo: **uploading an existing file** → arrastre **todo el contenido** de esta carpeta (`index.html`, `manifest.json`, `sw.js` y las carpetas `css`, `js`, `img`, `docs`) → **Commit changes**.
4. **Settings → Pages** → *Source*: **Deploy from a branch** → *Branch*: `main` y carpeta `/ (root)` → **Save**.
5. En uno o dos minutos la página queda en `https://SU-USUARIO.github.io/flora-de-campo/`.
6. Ábrala en el celular **con internet** una vez. Para tenerla como app: menú del navegador → **Agregar a pantalla de inicio** / **Instalar app**. Desde ahí funciona sin señal.

Cualquier persona con el enlace puede abrir la app, pero **no ve sus datos**: cada quien tiene los suyos en su dispositivo. Para compartir registros use la copia de seguridad `.json`.

### Publicar una versión nueva

Suba los archivos modificados al repositorio y, en `sw.js`, cambie `VERSION` (por ejemplo, de `flora-v1` a `flora-v2`). Los celulares tomarán la versión nueva la segunda vez que abran la app con internet.

## Estructura

```
index.html            página única con las 4 pestañas
manifest.json, sw.js  instalación y funcionamiento sin conexión
css/                  estilos de pantalla e impresión
js/caracteres.js      vocabulario morfológico (fuente única de términos)
js/ilustraciones.js   dibujos SVG de los términos
js/db.js              almacenamiento (IndexedDB), respaldo e importación
js/…                  una pantalla por archivo (identificar, catalogo, registro, clave, album, glosario)
docs/vocabulario.md   vocabulario para revisión (se genera con: node tools/generar-vocabulario.js)
```
