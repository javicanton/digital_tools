import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import InfoSection from '../components/InfoSection';
import { UI_TEXT } from '../i18n/es';
import { loadTools } from '../lib/data';
import { capitalizeFirst, formatSpanishNumber, parseSpanishNumber, splitList } from '../lib/normalize';
import { getPlaceholderSvg, getToolImageUrl } from '../lib/toolImage';

function renderList(items) {
  const parsed = splitList(items);
  if (!parsed.length) {
    return <p>No especificado.</p>;
  }

  return (
    <ul>
      {parsed.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function getCostLabel(rawCost) {
  const numeric = parseSpanishNumber(rawCost);
  if (Number.isFinite(numeric) && !/[a-zA-Z]/.test(rawCost)) {
    return `${formatSpanishNumber(numeric)} EUR`;
  }

  return rawCost || 'No especificado';
}

export default function ToolDetailPage() {
  const { toolId } = useParams();

  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const dataset = await loadTools();
        if (active) {
          setTools(dataset);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      active = false;
    };
  }, []);

  const tool = useMemo(
    () => tools.find((item) => item.tool_id === decodeURIComponent(toolId ?? '')),
    [toolId, tools]
  );

  if (loading) {
    return <p className="status-message">{UI_TEXT.home.loading}</p>;
  }

  if (!tool) {
    return (
      <section className="detail-layout">
        <p>
          <Link to="/" className="secondary-link">
            {UI_TEXT.detail.back}
          </Link>
        </p>
        <h2>{UI_TEXT.detail.notFoundTitle}</h2>
        <p>{UI_TEXT.detail.notFoundBody}</p>
      </section>
    );
  }

  return (
    <article className="detail-layout">
      <p>
        <Link to="/" className="secondary-link">
          {UI_TEXT.detail.back}
        </Link>
      </p>

      <div className="detail-tool-media">
        <img
          src={getToolImageUrl(tool)}
          alt={`Imagen de ${tool.nombre}`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getPlaceholderSvg(tool.nombre);
          }}
        />
      </div>

      <header className="detail-header">
        <div>
          <p className="tool-category">
            <Link
              to="/"
              state={{ selectedCategory: tool.categoria_principal }}
              className="tool-category-link"
            >
              {capitalizeFirst(tool.categoria_principal)}
            </Link>
          </p>
          <h2>{tool.nombre}</h2>
          <p>{tool.descripcion_corta}</p>
          {tool.etiquetas_lista?.length > 0 && (
            <ul className="detail-tag-list" aria-label="Etiquetas">
              {tool.etiquetas_lista.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/"
                    state={{ addTag: tag }}
                    className="tag-link"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="detail-actions">
          <a className="primary-button" href={tool.url_oficial} target="_blank" rel="noreferrer">
            {UI_TEXT.card.officialSite}
          </a>
        </div>
      </header>

      <section className="summary-strip" aria-label={UI_TEXT.detail.quickSummary}>
        <div>
          <h3>{UI_TEXT.detail.quickSummary}</h3>
          <p>{tool.utilidad_en_investigacion || 'No especificado.'}</p>
        </div>
        <div>
          <h3>{UI_TEXT.detail.dataTypes}</h3>
          <p>{tool.tipos_datos || 'No especificado.'}</p>
        </div>
      </section>

      <section className="detail-sections" aria-label="Secciones obligatorias">
        <InfoSection title={UI_TEXT.detail.keyFeatures}>
          {renderList(tool.funcionalidades_clave)}
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.price}>
          <p>{tool.precio_modelo || 'No especificado.'}</p>
          <p>
            <strong>{UI_TEXT.detail.costEstimate}:</strong> {getCostLabel(tool.coste_estimado)}
          </p>
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.requirements}>
          <p>{tool.requisitos_sistema || 'No especificado.'}</p>
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.privacy}>
          <p>{tool.transparencia_datos || 'No especificado.'}</p>
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.versatility}>
          {renderList(tool.fases_investigacion)}
        </InfoSection>
      </section>

      <section className="detail-sections detail-sections--secondary" aria-label="Secciones recomendadas">
        <InfoSection title={UI_TEXT.detail.integrations}>
          <p>{tool.integraciones || 'No especificado.'}</p>
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.docs}>
          <p>{tool.documentacion_tutoriales || 'No especificado.'}</p>
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.collaboration}>
          <p>{tool.trabajo_colaborativo || 'No especificado.'}</p>
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.importExport}>
          <p>
            <strong>Importación:</strong> {tool.importacion || 'No especificado.'}
          </p>
          <p>
            <strong>Exportación:</strong> {tool.exportacion || 'No especificado.'}
          </p>
        </InfoSection>

        <InfoSection title={UI_TEXT.detail.aiUsage}>
          <p>{tool.uso_IA || 'No especificado.'}</p>
        </InfoSection>
      </section>

      <details className="optional-details">
        <summary>{UI_TEXT.detail.optional}</summary>
        <div className="optional-grid">
          <InfoSection title={UI_TEXT.detail.ethics}>
            <p>{tool.protocolos_etica || 'No especificado.'}</p>
          </InfoSection>

          <InfoSection title={UI_TEXT.detail.language}>
            <p>{tool.idioma_interfaz || 'No especificado.'}</p>
          </InfoSection>

          <InfoSection title={UI_TEXT.detail.alternatives}>
            {renderList(tool.alternativas)}
          </InfoSection>

          <InfoSection title={UI_TEXT.detail.limitations}>
            <p>{tool.notas_limitaciones || 'No especificado.'}</p>
          </InfoSection>

          <InfoSection title={UI_TEXT.detail.updated}>
            <p>{tool.ultima_actualizacion_aprox || 'No especificado.'}</p>
          </InfoSection>
        </div>
      </details>
    </article>
  );
}
