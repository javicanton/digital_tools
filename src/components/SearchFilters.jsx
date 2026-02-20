import { UI_TEXT } from '../i18n/es';

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
  return (
    <section className="filters-panel" aria-labelledby="filters-title">
      <h3 id="filters-title">Filtros y ordenacion</h3>

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
                {category}
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

        <fieldset className="field-group full-width">
          <legend>{UI_TEXT.filters.tagsLabel}</legend>
          <div className="tag-grid" role="group" aria-label={UI_TEXT.filters.tagsLabel}>
            {availableTags.map((tag) => {
              const checked = selectedTags.includes(tag);

              return (
                <label
                  key={tag}
                  className={checked ? 'tag-option tag-option--active' : 'tag-option'}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleTag(tag)}
                  />
                  <span>{tag}</span>
                </label>
              );
            })}
          </div>
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
