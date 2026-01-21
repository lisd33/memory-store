function Mosaic({ items }) {
  return (
    <div className="mosaic" role="list">
      {items.map((item, index) => (
        <figure key={item.id} className="mosaic-card" role="listitem">
          <div className="mosaic-media">
            <img src={item.url} alt={item.title} loading="lazy" />
            <span className="pill pill-soft">{item.mood}</span>
            <span className="badge-corner">{index + 1}</span>
          </div>
          <figcaption>
            <div>
              <strong>{item.title}</strong>
              <p className="subtle">{item.season} · 收藏至你的专属相册</p>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default Mosaic;
