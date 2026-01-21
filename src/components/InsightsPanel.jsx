function InsightsPanel({ recommendations, products }) {
  const fastest = [...products].sort((a, b) => a.latency - b.latency)[0];
  const mostEngaged = [...products].sort((a, b) => b.engagement - a.engagement)[0];

  return (
    <div className="panel" aria-label="Lazy insights">
      <div className="inline">
        <h2>Lazy Insights</h2>
        <span className="badge">Loaded on demand</span>
      </div>
      <p className="subtle">
        This block is dynamically imported to demonstrate bundle splitting for non-critical UI.
      </p>
      <div className="list">
        {recommendations.map((item) => (
          <div key={item.id} className="list-item">
            <div>
              <strong>{item.title}</strong>
              <div className="subtle">{item.detail}</div>
            </div>
            <small>{item.target}</small>
          </div>
        ))}
      </div>
      <div className="callout">
        <strong>Signals:</strong> {mostEngaged?.name} keeps visitors engaged; {fastest?.name} is the
        quickest to hydrate. Keep both above the fold.
      </div>
    </div>
  );
}

export default InsightsPanel;
