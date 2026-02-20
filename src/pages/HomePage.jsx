import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchFilters from '../components/SearchFilters';
import ToolCard from '../components/ToolCard';
import { UI_TEXT } from '../i18n/es';
import { loadTools } from '../lib/data';
import { filterAndSortTools } from '../lib/sort';

export default function HomePage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const dataset = await loadTools();
        if (active) {
          setTools(dataset);
          setError('');
        }
      } catch (datasetError) {
        if (active) {
          setError(datasetError.message);
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

  const categories = useMemo(() => {
    const uniqueCategories = new Set(tools.map((tool) => tool.categoria_principal));
    return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b, 'es'));
  }, [tools]);

  const availableTags = useMemo(() => {
    const allTags = tools.flatMap((tool) => tool.etiquetas_lista);
    return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b, 'es'));
  }, [tools]);

  const visibleTools = useMemo(
    () =>
      filterAndSortTools(tools, {
        query,
        selectedCategory,
        selectedTags,
        sortBy,
      }),
    [tools, query, selectedCategory, selectedTags, sortBy]
  );

  const handleToggleTag = (tag) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSortBy('relevance');
  };

  return (
    <>
      <section className="hero-panel" aria-labelledby="home-title">
        <div>
          <h2 id="home-title">{UI_TEXT.home.title}</h2>
          <p>{UI_TEXT.home.description}</p>
          <p className="result-count" aria-live="polite">
            <strong>{visibleTools.length}</strong> {UI_TEXT.home.statsLabel}
          </p>
        </div>

        <div className="hero-actions">
          <Link to="/solicitar" className="primary-button">
            {UI_TEXT.nav.request}
          </Link>
        </div>
      </section>

      <div className="catalog-layout">
        <section className="catalog-content" aria-label="Resultados del catalogo">
          {loading && <p className="status-message">{UI_TEXT.home.loading}</p>}
          {!loading && error && <p className="status-message status-error">{UI_TEXT.home.error}</p>}

          {!loading && !error && visibleTools.length === 0 && (
            <p className="status-message">{UI_TEXT.home.empty}</p>
          )}

          {!loading && !error && visibleTools.length > 0 && (
            <section className="tools-grid" aria-label="Listado de herramientas">
              {visibleTools.map((tool) => (
                <ToolCard key={tool.tool_id} tool={tool} />
              ))}
            </section>
          )}
        </section>

        <aside className="catalog-sidebar" aria-label="Menu lateral de filtros">
          <SearchFilters
            query={query}
            onQueryChange={setQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            onClear={clearFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableTags={availableTags}
          />
        </aside>
      </div>
    </>
  );
}
