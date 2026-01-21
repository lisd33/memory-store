import '../styles/heartCapsules.css';

function FullCapsuleList({ items, onClick, onClose }) {
  return (
    <div className="panel full-list">
      <div className="section-head slim">
        <div>
          <p className="eyebrow">全部胶囊</p>
          <h2>完整列表</h2>
        </div>
        <button type="button" className="ghost" onClick={onClose}>
          关闭
        </button>
      </div>
      <div className="capsule-fallback-grid large">
        {items.map((item) => (
          <button key={item.id} className="capsule-fallback" type="button" onClick={() => onClick(item)}>
            <div className="fallback-media" style={item.cover ? { backgroundImage: `url(${item.cover})` } : undefined} />
            <div className="fallback-meta">
              <span>{item.date}</span>
              <span>{item.place}</span>
            </div>
            <strong>{item.title}</strong>
            <p className="subtle clamp-2">{item.note}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default FullCapsuleList;
