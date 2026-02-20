import { Link } from 'react-router-dom';
import { UI_TEXT } from '../i18n/es';

function getLogoFallback(officialUrl) {
  try {
    const hostname = new URL(officialUrl).hostname;
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostname)}`;
  } catch {
    return '';
  }
}

function getPlaceholderSvg(label) {
  const safeLabel = String(label || 'Herramienta').slice(0, 36);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='#0e6d6b'/><stop offset='100%' stop-color='#f18f01'/></linearGradient></defs><rect width='1200' height='675' fill='url(#g)'/><text x='50%' y='52%' text-anchor='middle' fill='#ffffff' font-size='56' font-family='Manrope, Arial, sans-serif'>${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function ToolCard({ tool }) {
  const shortTags = tool.etiquetas_lista.slice(0, 3);
  const shortFeatures = tool.funcionalidades_lista.slice(0, 2);
  const imageSrc = tool.imagen_url || getLogoFallback(tool.url_oficial) || getPlaceholderSvg(tool.nombre);

  return (
    <article className="tool-card">
      <div className="tool-media">
        <img
          src={imageSrc}
          alt={`Imagen de ${tool.nombre}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = getPlaceholderSvg(tool.nombre);
          }}
        />
      </div>

      <header>
        <p className="tool-category">{tool.categoria_principal}</p>
        <h3>
          <Link to={`/tool/${encodeURIComponent(tool.tool_id)}`}>{tool.nombre}</Link>
        </h3>
        <p className="tool-summary">{tool.descripcion_corta}</p>
      </header>

      <ul className="tag-list" aria-label="Etiquetas principales">
        {shortTags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>

      <dl className="meta-grid">
        <div>
          <dt>Precio</dt>
          <dd>{tool.precio_modelo}</dd>
        </div>
        <div>
          <dt>Curva</dt>
          <dd>{tool.curva_aprendizaje}</dd>
        </div>
      </dl>

      <section className="feature-preview" aria-label={UI_TEXT.card.keyFeatures}>
        <h4>{UI_TEXT.card.keyFeatures}</h4>
        <ul>
          {shortFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <footer className="card-actions">
        <Link className="primary-button" to={`/tool/${encodeURIComponent(tool.tool_id)}`}>
          {UI_TEXT.card.viewDetail}
        </Link>
        <a
          className="secondary-link"
          href={tool.url_oficial}
          target="_blank"
          rel="noreferrer"
        >
          {UI_TEXT.card.officialSite}
        </a>
      </footer>
    </article>
  );
}
