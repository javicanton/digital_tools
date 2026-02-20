export function toPlainLower(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function splitList(value) {
  return String(value ?? '')
    .split(/[;,|]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseSpanishNumber(rawValue) {
  const source = String(rawValue ?? '').trim();
  const token = source.match(/-?[\d.,]+/);
  if (!token) {
    return Number.NaN;
  }

  const numericToken = token[0];
  const hasComma = numericToken.includes(',');
  const hasDot = numericToken.includes('.');

  let normalized = numericToken;

  if (hasComma && hasDot) {
    const commaIndex = numericToken.lastIndexOf(',');
    const dotIndex = numericToken.lastIndexOf('.');

    if (commaIndex > dotIndex) {
      normalized = numericToken.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = numericToken.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = numericToken.replace(',', '.');
  }

  return Number.parseFloat(normalized);
}

export function formatSpanishNumber(value) {
  if (!Number.isFinite(value)) {
    return 'No especificado';
  }

  const decimals = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 2,
  }).format(value);
}
