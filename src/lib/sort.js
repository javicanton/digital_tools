import { parseSpanishNumber, toPlainLower } from './normalize';

const PRICE_RANKS = [
  { pattern: /gratis|gratuito|free|open source|libre/, rank: 0 },
  { pattern: /freemium|prueba|trial/, rank: 1 },
  { pattern: /suscripcion|pago por uso|licencia|plan/, rank: 2 },
  { pattern: /empresa|enterprise|contactar|presupuesto/, rank: 3 },
];

const CURVE_RANKS = [
  { pattern: /muy baja/, rank: 0 },
  { pattern: /\bbaja\b/, rank: 0 },
  { pattern: /media/, rank: 1 },
  { pattern: /muy alta/, rank: 3 },
  { pattern: /\balta\b/, rank: 2 },
];

function getPriceRank(priceModel) {
  const normalized = toPlainLower(priceModel);
  const matched = PRICE_RANKS.find((rule) => rule.pattern.test(normalized));
  return matched ? matched.rank : 4;
}

function getLearningCurveRank(learningCurve) {
  const normalized = toPlainLower(learningCurve);
  const matched = CURVE_RANKS.find((rule) => rule.pattern.test(normalized));
  return matched ? matched.rank : 4;
}

function safeNameCompare(toolA, toolB) {
  return toolA.nombre.localeCompare(toolB.nombre, 'es', { sensitivity: 'base' });
}

export function queryToTokens(query) {
  return toPlainLower(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function fieldScore(fieldValue, token, weight) {
  const normalized = toPlainLower(fieldValue);
  if (!normalized.includes(token)) {
    return 0;
  }

  if (normalized === token) {
    return weight * 3;
  }

  if (normalized.startsWith(token)) {
    return weight * 2;
  }

  return weight;
}

export function computeRelevance(tool, tokens) {
  if (!tokens.length) {
    return 0;
  }

  return tokens.reduce((acc, token) => {
    const score =
      fieldScore(tool.nombre, token, 6) +
      fieldScore(tool.descripcion_corta, token, 4) +
      fieldScore(tool.etiquetas, token, 5) +
      fieldScore(tool.funcionalidades_clave, token, 3);

    return acc + score;
  }, 0);
}

function matchesTokens(tool, tokens) {
  if (!tokens.length) {
    return true;
  }

  return tokens.every((token) => tool.search_index.includes(token));
}

function matchesCategory(tool, category) {
  if (!category) {
    return true;
  }

  return tool.categoria_principal === category;
}

function matchesTags(tool, selectedTags) {
  if (!selectedTags.length) {
    return true;
  }

  return selectedTags.every((tag) => tool.etiquetas_normalizadas.includes(toPlainLower(tag)));
}

export function sortTools(tools, sortBy, tokens) {
  const toolsCopy = [...tools];

  switch (sortBy) {
    case 'name':
      return toolsCopy.sort(safeNameCompare);
    case 'price':
      return toolsCopy.sort((toolA, toolB) => {
        const rankA = getPriceRank(toolA.precio_modelo);
        const rankB = getPriceRank(toolB.precio_modelo);
        if (rankA !== rankB) {
          return rankA - rankB;
        }

        const costA = parseSpanishNumber(toolA.coste_estimado);
        const costB = parseSpanishNumber(toolB.coste_estimado);

        if (Number.isFinite(costA) && Number.isFinite(costB) && costA !== costB) {
          return costA - costB;
        }

        return safeNameCompare(toolA, toolB);
      });
    case 'learningCurve':
      return toolsCopy.sort((toolA, toolB) => {
        const rankA = getLearningCurveRank(toolA.curva_aprendizaje);
        const rankB = getLearningCurveRank(toolB.curva_aprendizaje);
        if (rankA !== rankB) {
          return rankA - rankB;
        }

        return safeNameCompare(toolA, toolB);
      });
    case 'relevance':
    default:
      return toolsCopy.sort((toolA, toolB) => {
        const scoreA = computeRelevance(toolA, tokens);
        const scoreB = computeRelevance(toolB, tokens);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        return safeNameCompare(toolA, toolB);
      });
  }
}

export function filterAndSortTools(tools, { query, selectedCategory, selectedTags, sortBy }) {
  const tokens = queryToTokens(query);

  const filtered = tools.filter(
    (tool) =>
      matchesTokens(tool, tokens) &&
      matchesCategory(tool, selectedCategory) &&
      matchesTags(tool, selectedTags)
  );

  return sortTools(filtered, sortBy, tokens);
}
