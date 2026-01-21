function MetricCard({ label, value, hint, trend }) {
  return (
    <article className="card" aria-label={label}>
      <h3>{label}</h3>
      <div className="value">{value}</div>
      {trend ? <div className="trend">{trend}</div> : null}
      {hint ? <p className="subtle">{hint}</p> : null}
    </article>
  );
}

export default MetricCard;
