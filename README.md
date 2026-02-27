# Catálogo de Herramientas Digitales para Investigación Social

**Web en línea:** [https://javicanton.github.io/digital_tools/](https://javicanton.github.io/digital_tools/)

Catálogo público de herramientas digitales para la investigación social aplicada. Pensado para docencia y para que estudiantes e investigadores encuentren, comparen y elijan software por fase del proyecto, tipo de datos, coste o curva de aprendizaje.

## Qué ofrece

- **Listado de herramientas** con nombre, categoría, descripción, etiquetas y enlace a la web oficial.
- **Búsqueda por texto** (nombre, descripción, etiquetas, funcionalidades).
- **Filtros** por categoría principal y por etiquetas (buscador de etiquetas y chips activos).
- **Ficha detallada** de cada herramienta: precio, requisitos, integraciones, importación/exportación, trabajo colaborativo, documentación, ética y privacidad, alternativas, etc.
- **Categorías y etiquetas clicables** en las tarjetas y en la ficha para aplicar filtros al instante.
- **Modo claro y oscuro** y diseño responsive.

## Origen

Proyecto del **Máster en Métodos y Técnicas de Investigación Social Aplicada** de UNIR. El catálogo se nutre de un dataset en JSON generado desde CSV y se publica como sitio estático en GitHub Pages.

## Cómo contribuir o ejecutarlo en local

- **Requisito:** Node.js 20+
- **Instalar y arrancar:** `npm install` y `npm run dev`
- **Generar datos desde CSV:**  
  `npm run import:csv -- --input ./data/tools.csv --output ./public/data/tools.json`
- **Build:** `npm run build` (el despliegue en GitHub Pages usa el workflow en `.github/workflows/deploy-pages.yml`).

Los textos de la interfaz están en `src/i18n/es.js`. El dataset debe seguir el esquema definido en el script `scripts/csv-to-json.mjs` (campos como `tool_id`, `nombre`, `url_oficial`, `categoria_principal`, `etiquetas`, etc.).
