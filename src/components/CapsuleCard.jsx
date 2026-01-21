import { useMemo } from 'react';

const moodPalette = {
  温柔: '#f472b6',
  雀跃: '#f59e0b',
  安静: '#60a5fa',
  踏实: '#22c55e',
  甜蜜: '#fb7185',
  沉静: '#38bdf8',
  惊喜: '#f97316',
  自由: '#22d3ee',
  松弛: '#a78bfa',
  怀旧: '#fbbf24',
};

function CapsuleCard({ capsule, onOpen, layoutStyle }) {
  const accent = moodPalette[capsule.mood] ?? '#22d3ee';
  const accentStyle = useMemo(() => ({ '--accent': accent }), [accent]);
  const coverStyle = capsule.cover ? { backgroundImage: `url(${capsule.cover})` } : undefined;
  const mergedStyle = useMemo(
    () => ({ ...layoutStyle, ...accentStyle }),
    [layoutStyle, accentStyle],
  );

  return (
    <button
      type="button"
      className="capsule-card"
      style={mergedStyle}
      aria-label={`查看 ${capsule.title}`}
      onClick={() => onOpen(capsule)}
    >
      <div className="capsule-cover" style={coverStyle} aria-hidden>
        {!capsule.cover && <div className="cover-fallback">点击填充封面</div>}
      </div>
      <div className="capsule-top">
        <div>
          <div className="capsule-badges">
            <span className="pill pill-soft">{capsule.date}</span>
            <span className="pill pill-outline">{capsule.place}</span>
            <span className="pill pill-accent">{capsule.mood ?? '心动'}</span>
          </div>
          <h3>{capsule.title}</h3>
        </div>
      </div>
      <p className="subtle clamp-2">{capsule.note}</p>
    </button>
  );
}

export default CapsuleCard;
