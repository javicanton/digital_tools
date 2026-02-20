import { Link } from 'react-router-dom';
import { UI_TEXT } from '../i18n/es';

export default function NotFoundPage() {
  return (
    <section className="status-message">
      <h2>{UI_TEXT.notFound.title}</h2>
      <p>{UI_TEXT.notFound.body}</p>
      <Link to="/" className="primary-button">
        {UI_TEXT.notFound.back}
      </Link>
    </section>
  );
}
