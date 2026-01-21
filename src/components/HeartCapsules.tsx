import { useEffect, useMemo, useState } from 'react';
import { PuzzleHeart8 } from './PuzzleHeart8';
import { MosaicHeart } from './MosaicHeart';
import '../styles/heartCapsules.css';

type Capsule = {
  id: string;
  title: string;
  note?: string;
  date?: string;
  place?: string;
  cover?: string;
};

type Props = {
  items: Capsule[];
  onClick: (item: Capsule) => void;
  maxSlots?: number;
  enablePaging?: boolean;
  onViewAll?: () => void;
};

function useIsMobile(threshold = 768) {
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth < threshold : false),
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < threshold);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [threshold]);

  return isMobile;
}

export default function HeartCapsules({
  items,
  onClick,
  maxSlots = 8,
  enablePaging = false,
  onViewAll,
}: Props) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);
  const totalPages = enablePaging ? Math.ceil(items.length / maxSlots) : 1;

  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

  const start = enablePaging ? page * maxSlots : 0;
  const visible = items.slice(start, start + maxSlots);
  const leftover = items.length - visible.length;

  const usePuzzle = !isMobile && visible.length > 3 && visible.length <= maxSlots;
  const useMosaic = !isMobile && items.length > maxSlots;

  const fallbackGrid = (
    <div className="capsule-fallback-grid">
      {visible.map((item) => (
        <button
          key={item.id}
          className="capsule-fallback"
          type="button"
          onClick={() => onClick(item)}
        >
          <div
            className="fallback-media"
            style={item.cover ? { backgroundImage: `url(${item.cover})` } : undefined}
          />
          <div className="fallback-meta">
            <span>{item.date}</span>
            <span>{item.place}</span>
          </div>
          <strong>{item.title}</strong>
          <p className="subtle clamp-2">{item.note}</p>
        </button>
      ))}
    </div>
  );

  const body = usePuzzle ? (
    <div className="puzzle-wrap">
      <PuzzleHeart8 items={visible} onClick={onClick} className="puzzle-heart" />
      {leftover > 0 && <div className="heart-more">+{leftover}</div>}
    </div>
  ) : useMosaic ? (
    <div className="mosaic-wrap">
      <MosaicHeart items={items} onClick={onClick} className="mosaic-heart" />
    </div>
  ) : (
    fallbackGrid
  );

  const actions = (
    <div className="heart-actions">
      {items.length > maxSlots && (
        <button type="button" className="chip chip-active" onClick={onViewAll}>
          查看全部（{items.length}）
        </button>
      )}
      {enablePaging && totalPages > 1 && (
        <div className="paging">
          <button
            type="button"
            className="ghost"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ←
          </button>
          <span className="subtle">
            第 {page + 1} / {totalPages} 页
          </span>
          <button
            type="button"
            className="ghost"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="heart-block">
      {body}
      {actions}
    </div>
  );
}
