import { useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { VisibleToolsCountContext } from './context/VisibleToolsCount';
import HomePage from './pages/HomePage';
import ToolDetailPage from './pages/ToolDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import RequestInclusionPage from './pages/RequestInclusionPage';
import { UI_TEXT } from './i18n/es';

const THEME_KEY = 'catalogo-theme';

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const { visibleCount } = useContext(VisibleToolsCountContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const themeLabel = useMemo(
    () => (theme === 'dark' ? UI_TEXT.theme.toLight : UI_TEXT.theme.toDark),
    [theme]
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido-principal">
        {UI_TEXT.skipToContent}
      </a>

      <header className="site-header">
        <div className="header-inner container">
          <div className="branding">
            <p className="badge">Repositorio docente</p>
            <h1>{UI_TEXT.siteTitle}</h1>
            <p>{UI_TEXT.siteSubtitle}</p>
            {visibleCount !== null && (
              <p className="header-tools-count" aria-live="polite">
                <strong>{visibleCount}</strong> {UI_TEXT.home.statsLabel}
              </p>
            )}
          </div>

          <div className="header-actions">
            <nav aria-label="Navegacion principal" className="main-nav">
              <NavLink to="/" end>
                {UI_TEXT.nav.catalog}
              </NavLink>
              <NavLink to="/solicitar">{UI_TEXT.nav.request}</NavLink>
            </nav>

            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              aria-label={themeLabel}
            >
              {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </button>
          </div>
        </div>
      </header>

      <main id="contenido-principal" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tool/:toolId" element={<ToolDetailPage />} />
          <Route path="/solicitar" element={<RequestInclusionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
