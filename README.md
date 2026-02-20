# Catalogo web de herramientas digitales para investigacion social

Repositorio estatico para mantener un catalogo publico de herramientas digitales orientado a docencia en investigacion social aplicada.

## Eleccion tecnica
Se implementa **Opcion B (Vite + React, sin backend)**.

Motivo breve:
- Es simple de mantener por alumnado (solo archivos JSON + componentes React).
- Coste cero de infraestructura (deploy estatico en GitHub Pages).
- Facil de evolucionar (filtros nuevos, campos nuevos o i18n sin migraciones de base de datos).

## Estructura del proyecto

```text
.
├── .github/workflows/deploy-pages.yml
├── public/
│   ├── data/
│   │   ├── tool-images.json
│   │   └── tools.json
│   └── sw.js
├── data/
│   └── tools.template.csv
├── scripts/
│   └── csv-to-json.mjs
├── src/
│   ├── components/
│   │   ├── InfoSection.jsx
│   │   ├── SearchFilters.jsx
│   │   └── ToolCard.jsx
│   ├── i18n/es.js
│   ├── lib/
│   │   ├── constants.js
│   │   ├── data.js
│   │   ├── normalize.js
│   │   └── sort.js
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── RequestInclusionPage.jsx
│   │   └── ToolDetailPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Ejecutar en local

Requisito: Node.js 20+

```bash
npm install
npm run dev
```

Build de produccion:

```bash
npm run build
npm run preview
```

## Dataset y esquema

El catalogo lee `public/data/tools.json`.

Cada herramienta debe contener **exactamente** estos campos:

`tool_id, nombre, url_oficial, categoria_principal, etiquetas, descripcion_corta, funcionalidades_clave, utilidad_en_investigacion, fases_investigacion, tipos_datos, precio_modelo, coste_estimado, requisitos_sistema, integraciones, importacion, exportacion, trabajo_colaborativo, documentacion_tutoriales, idioma_interfaz, transparencia_datos, protocolos_etica, uso_IA, curva_aprendizaje, alternativas, notas_limitaciones, ultima_actualizacion_aprox`

Incluye un ejemplo realista con **10 herramientas ficticias** en `public/data/tools.json`.

Para imagenes de tarjetas, el catalogo usa `public/data/tool-images.json` (mapa `tool_id -> URL externa`).

## Actualizar datos desde CSV o JSON

1. Prepara tu archivo CSV con las cabeceras exactas (puedes partir de `data/tools.template.csv`).
2. Ejecuta:

```bash
npm run import:csv -- --input ./ruta/tools.csv --output ./public/data/tools.json
```

Tambien admite entrada JSON:

```bash
npm run import:csv -- --input ./ruta/tools.json --output ./public/data/tools.json
```

El script:
- valida campos obligatorios,
- normaliza valores como texto,
- detecta `tool_id` duplicados,
- escribe JSON listo para publicar.

## Como anadir una herramienta manualmente

1. Abre `public/data/tools.json`.
2. Duplica un objeto existente.
3. Cambia `tool_id` por uno unico (slug en minusculas y guiones).
4. Completa campos.
5. Guarda y revisa en local con `npm run dev`.

## Convencion de categorias y etiquetas

Categorias recomendadas (nivel principal, una por herramienta):
- `Analisis cualitativo`
- `Encuestas online`
- `Trabajo de campo`
- `Transcripcion y audio`
- `Analisis de redes`
- `Visualizacion de datos`
- `Metodos mixtos`
- `Modelado y simulacion`

Reglas para etiquetas:
- usa 3 a 6 etiquetas por herramienta,
- siempre en minusculas,
- separadas por coma,
- preferir terminos metodologicos (`muestreo`, `codificacion`, `triangulacion`) sobre marcas.

## UX implementada

- Busqueda por `nombre`, `descripcion_corta`, `etiquetas` y `funcionalidades_clave`.
- Filtro por `categoria_principal`.
- Filtro multi-seleccion por `etiquetas`.
- Orden por relevancia textual, nombre, precio/modelo y curva de aprendizaje.
- Menu lateral de filtros a la derecha en escritorio, con posicion sticky durante el scroll.
- Tarjetas responsive con imagen, nombre, categoria, 3 etiquetas, precio, curva y 1-2 funcionalidades.
- Parrilla de 3 tarjetas por fila en escritorio, 2 en tablet y 1 en movil.
- Ficha individual en `/tool/{tool_id}` con obligatorias primero, recomendadas despues y opcionales en bloque colapsable.
- Modo claro/oscuro.
- Accesibilidad base: estructura semantica, labels, foco visible y navegacion por teclado.

## Cache temporal de imagenes externas

El proyecto registra un `service worker` (`public/sw.js`) en produccion para cachear imagenes externas de las tarjetas en el navegador.

Esto permite:
- reducir recargas de imagenes ya vistas,
- mejorar rendimiento percibido,
- mantener un almacenamiento temporal en cliente sin backend.

Importante:
- el cache depende del navegador del usuario (no es persistencia en servidor),
- si una URL externa cambia o cae, la tarjeta usa fallback visual.

## Formulario de inclusion de nuevas herramientas

La pagina `/solicitar` usa una URL externa configurable:

1. Crea un `.env` local basado en `.env.example`.
2. Define:

```bash
VITE_SUGGESTION_FORM_URL=https://tu-formulario-real.example.com
```

Sirve para integrar Google Forms, Typeform u otra opcion sin backend.

## Despliegue en GitHub Pages

Ya se incluye `.github/workflows/deploy-pages.yml` para publicar automaticamente al hacer push a `main`.

Pasos en GitHub:
1. Ve a **Settings > Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions**.
3. Haz push a `main`.
4. El workflow compila y publica `dist`.

Notas de rutas:
- `vite.config.js` calcula `base` automaticamente para Pages de proyecto.
- El script `npm run build` genera `dist/404.html` para soportar rutas SPA como `/tool/{tool_id}`.

## Idioma e internacionalizacion

Todo el contenido y etiquetas de interfaz estan en espanol (`src/i18n/es.js`).
Para preparar ingles, crea un archivo espejo (por ejemplo `src/i18n/en.js`) y selecciona idioma desde un estado global o contexto.

## Sistema numerico espanol

El proyecto formatea valores numericos con locale `es-ES`, usando coma decimal cuando el dato es numerico.
