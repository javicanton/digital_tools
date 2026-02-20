import { REQUIRED_FIELDS } from './constants';
import { splitList, toPlainLower } from './normalize';

let toolsCache = null;

function normalizeTool(rawTool) {
  const tool = REQUIRED_FIELDS.reduce((acc, key) => {
    const value = rawTool?.[key];
    acc[key] = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
    return acc;
  }, {});

  const etiquetasLista = splitList(tool.etiquetas);
  const funcionalidadesLista = splitList(tool.funcionalidades_clave);

  return {
    ...tool,
    etiquetas_lista: etiquetasLista,
    etiquetas_normalizadas: etiquetasLista.map((tag) => toPlainLower(tag)),
    funcionalidades_lista: funcionalidadesLista,
    search_index: toPlainLower(
      [tool.nombre, tool.descripcion_corta, tool.etiquetas, tool.funcionalidades_clave].join(' ')
    ),
  };
}

function validateRecord(rawTool) {
  return REQUIRED_FIELDS.every((field) => Object.prototype.hasOwnProperty.call(rawTool, field));
}

export async function loadTools() {
  if (toolsCache) {
    return toolsCache;
  }

  const datasetUrl = `${import.meta.env.BASE_URL}data/tools.json`;
  const response = await fetch(datasetUrl);

  if (!response.ok) {
    throw new Error(`Error cargando dataset: ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('El dataset debe ser un array JSON.');
  }

  const invalidCount = payload.filter((record) => !validateRecord(record)).length;
  if (invalidCount > 0) {
    throw new Error(`Hay ${invalidCount} registros con campos incompletos en tools.json.`);
  }

  const normalized = payload.map((record) => normalizeTool(record));

  toolsCache = normalized;
  return normalized;
}
