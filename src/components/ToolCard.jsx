import { Link } from 'react-router-dom';
import { UI_TEXT } from '../i18n/es';
import { capitalizeFirst } from '../lib/normalize';
import { getPlaceholderSvg, getToolImageUrl } from '../lib/toolImage';

export default function ToolCard({ tool, onFilterByCategory, onFilterByTag }) {
  const shortTags = tool.etiquetas_lista.slice(0, 3);
  const shortFeatures = tool.funcionalidades_lista.slice(0, 2);
  const imageSrc = getToolImageUrl(tool);
  const categoryLabel = capitalizeFirst(tool.categoria_principal);

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
        <p className="tool-category">
          {onFilterByCategory ? (
            <button
              type="button"
              className="tool-category-link"
              onClick={() => onFilterByCategory(tool.categoria_principal)}
            >
              {categoryLabel}
            </button>
          ) : (
            categoryLabel
          )}
        </p>
        <h3>
          <Link to={`/tool/${encodeURIComponent(tool.tool_id)}`}>{tool.nombre}</Link>
        </h3>
        <p className="tool-summary">{tool.descripcion_corta}</p>
      </header>

      <ul className="tag-list" aria-label="Etiquetas principales">
        {shortTags.map((tag) => (
          <li key={tag}>
            {onFilterByTag ? (
              <button
                type="button"
                className="tag-link"
                onClick={() => onFilterByTag(tag)}
              >
                {tag}
              </button>
            ) : (
              tag
            )}
          </li>
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
