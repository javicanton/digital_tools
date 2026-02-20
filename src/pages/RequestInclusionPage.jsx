import { UI_TEXT } from '../i18n/es';
import { DEFAULT_SUGGESTION_FORM_URL } from '../lib/constants';

const configuredFormUrl =
  import.meta.env.VITE_SUGGESTION_FORM_URL || DEFAULT_SUGGESTION_FORM_URL;

export default function RequestInclusionPage() {
  const usingDefaultUrl = configuredFormUrl === DEFAULT_SUGGESTION_FORM_URL;

  return (
    <section className="request-page" aria-labelledby="request-title">
      <h2 id="request-title">{UI_TEXT.request.title}</h2>
      <p>{UI_TEXT.request.body}</p>

      <a className="primary-button" href={configuredFormUrl} target="_blank" rel="noreferrer">
        {UI_TEXT.request.openForm}
      </a>

      {usingDefaultUrl && (
        <article className="warning-box" aria-live="polite">
          <h3>{UI_TEXT.request.fallbackTitle}</h3>
          <p>{UI_TEXT.request.fallbackBody}</p>
          <p>
            Variable esperada: <code>VITE_SUGGESTION_FORM_URL</code>
          </p>
        </article>
      )}
    </section>
  );
}
