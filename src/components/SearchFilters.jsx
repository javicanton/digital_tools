import { useMemo, useState } from 'react';
import { UI_TEXT } from '../i18n/es';
import { capitalizeFirst } from '../lib/normalize';

export default function SearchFilters({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedTags,
  onToggleTag,
  onClear,
  sortBy,
  onSortChange,
  availableTags,
}) {
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const filteredTags = useMemo(() => {
    const q = tagSearchQuery.trim().toLowerCase();
    if (!q) return availableTags.slice(0, 12);
    return availableTags
      .filter((tag) => tag.toLowerCase().includes(q))
      .slice(0, 12);
  }, [availableTags, tagSearchQuery]);

  return (
    <section className="filters-panel" aria-labelledby="filters-title">
      <h3 id="filters-title">Filtros y ordenación</h3>

      <form className="filters-grid" onSubmit={(event) => event.preventDefault()}>
        <div className="field-group full-width">
          <label htmlFor="search">{UI_TEXT.filters.searchLabel}</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={UI_TEXT.filters.searchPlaceholder}
          />
        </div>

        <div className="field-group">
          <label htmlFor="category">{UI_TEXT.filters.categoryLabel}</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">{UI_TEXT.filters.categoryAll}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {capitalizeFirst(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="sort">{UI_TEXT.filters.sortLabel}</label>
          <select id="sort" value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
            <option value="relevance">{UI_TEXT.filters.sortOptions.relevance}</option>
            <option value="name">{UI_TEXT.filters.sortOptions.name}</option>
            <option value="price">{UI_TEXT.filters.sortOptions.price}</option>
            <option value="learningCurve">{UI_TEXT.filters.sortOptions.learningCurve}</option>
          </select>
        </div>

        <fieldset className="field-group full-width tag-filter-fieldset">
          <legend>{UI_TEXT.filters.tagsLabel}</legend>
          <div className="tag-search-row">
            <input
              type="search"
              value={tagSearchQuery}
              onChange={(event) => setTagSearchQuery(event.target.value)}
              placeholder={UI_TEXT.filters.tagSearchPlaceholder}
              aria-label={UI_TEXT.filters.tagSearchPlaceholder}
              className="tag-search-input"
            />
          </div>
          {selectedTags.length > 0 && (
            <div className="tag-chips" role="group" aria-label="Etiquetas activas">
              {selectedTags.map((tag) => (
                <span key={tag} className="tag-chip">
                  <span className="tag-chip-label">{tag}</span>
                  <button
                    type="button"
                    className="tag-chip-remove"
                    onClick={() => onToggleTag(tag)}
                    aria-label={`Quitar etiqueta ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filteredTags.length > 0 && (
            <div className="tag-suggestions">
              {filteredTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-suggestion-btn ${isSelected ? 'tag-suggestion-btn--active' : ''}`}
                    onClick={() => onToggleTag(tag)}
                    disabled={isSelected}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <div className="field-group actions-row">
          <button type="button" className="secondary-button" onClick={onClear}>
            {UI_TEXT.filters.clear}
          </button>
        </div>
      </form>
    </section>
  );
}
