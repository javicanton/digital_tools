export default function InfoSection({ title, children }) {
  return (
    <section className="info-section" aria-label={title}>
      <h3>{title}</h3>
      <div className="info-content">{children}</div>
    </section>
  );
}
