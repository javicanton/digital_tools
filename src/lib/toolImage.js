export function getToolImageUrl(tool) {
  const imagen = tool?.imagen_url;
  if (imagen && typeof imagen === 'string' && imagen.trim()) {
    return imagen.trim();
  }
  try {
    const url = tool?.url_oficial;
    if (url) {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostname)}`;
    }
  } catch {
    // ignore
  }
  return getPlaceholderSvg(tool?.nombre ?? 'Herramienta');
}

export function getPlaceholderSvg(label) {
  const safeLabel = String(label || 'Herramienta').slice(0, 36);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='#0e6d6b'/><stop offset='100%' stop-color='#f18f01'/></linearGradient></defs><rect width='1200' height='675' fill='url(#g)'/><text x='50%' y='52%' text-anchor='middle' fill='#ffffff' font-size='56' font-family='Manrope, Arial, sans-serif'>${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
