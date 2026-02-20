import { Link } from 'react-router-dom';
import { UI_TEXT } from '../i18n/es';

export default function ToolCard({ tool }) {
  const shortTags = tool.etiquetas_lista.slice(0, 3);
  const shortFeatures = tool.funcionalidades_lista.slice(0, 2);

  return (
    <article className="tool-card">
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
