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

## Cómo enviar nuevas herramientas

1. **Desde la web:** Ve a [submit](https://javicanton.github.io/digital_tools/submit/), rellena el formulario y pulsa "Abrir issue en GitHub". Se abrirá un issue con la etiqueta `tool-submission` y el cuerpo generado. Si el texto es largo, copia el cuerpo y pégalo en el issue.
2. **Desde GitHub:** En el repositorio, "New issue" y elige la plantilla **Nueva herramienta**. Completa los campos; al crear el issue con la plantilla se asigna la etiqueta `tool-submission`.

Un workflow de GitHub Actions (`.github/workflows/tool-submission.yml`) se ejecuta al abrir un issue con esa etiqueta: valida los datos, comprueba que no existan duplicados por `tool_id` o `url_oficial`, y crea una rama `submissions/<slug>-<timestamp>` con el CSV actualizado y abre una Pull Request. Si la validación falla, el workflow comenta los errores en el issue y lo cierra.

### Reglas de formato

- **tool_id:** Se genera automáticamente como slug (minúsculas, solo letras, números y guiones).
- **url_oficial:** Debe ser `https://` y una URL válida.
- **descripcion_corta:** Máximo 280 caracteres.
- **Campos tipo lista** (etiquetas, funcionalidades_clave, integraciones, importacion, exportacion, alternativas): se guardan con `|` en el CSV; en el formulario se separan por comas.
- **fases_investigacion:** Solo: diseño | recogida | limpieza | análisis | visualización | difusión.
- **tipos_datos:** Solo: cualitativo | cuantitativo | mixto.
- **precio_modelo:** Solo: gratuita | freemium | pago | open source | licencia académica.
- **coste_estimado:** Si no se conoce, usar NA.
- Valores desconocidos en otros campos: NA.

### Cómo revisar y mergear PRs

1. Revisa el diff de la PR generada por el bot: debe añadir una sola fila a `data/tools.csv` manteniendo el orden de las 26 columnas.
2. Comprueba que el checklist de la PR esté cubierto (tool_id y url no duplicados, descripción correcta, etc.).
3. El workflow `tools-lint.yml` se ejecuta en la PR: valida el CSV y el build. Solo haz merge si el workflow pasa.
4. Tras el merge a `main`, el despliegue en GitHub Pages se actualiza con el nuevo catálogo.

### Configuración necesaria

- **Labels:** Crea la etiqueta `tool-submission` en el repositorio (Settings > Labels) si no existe.
- **GitHub Actions:** Deben estar activados (Settings > Actions > General).
- Para probar el flujo end-to-end: abre un issue de prueba con la plantilla "Nueva herramienta", asigna la etiqueta `tool-submission` si no se asignó sola, y comprueba que el workflow cree la PR o comente los errores.
