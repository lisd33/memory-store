import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Delaunay } from 'd3-delaunay';
import { clamp, isInHeart, mulberry32, triArea } from './heartMath';
import '../styles/shatteredHeart.css';

type CapsuleItem = {
  id: string;
  title?: string;
  cover?: string;
  coverUrl?: string;
  note?: string;
  date?: string;
  place?: string;
};

type Props = {
  items: CapsuleItem[];
  onClick?: (item: CapsuleItem) => void;
  className?: string;
  seed?: number;
  maxPieces?: number;
  showFallingShards?: boolean;
  fallingCount?: number;
  bevelStrength?: number; // 0..1
  showIndices?: boolean;
  forceShowHeart?: boolean;
};

const HEART_OUTLINE_D =
  'M50 18 C38 6 15 14 15 36 C15 55 32 70 50 88 C68 70 85 55 85 36 C85 14 62 6 50 18 Z';

type TriPiece = {
  a: { x: number; y: number };
  b: { x: number; y: number };
  c: { x: number; y: number };
  area: number;
  cx: number;
  cy: number;
  points: string;
};

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}

function makeFallingShards(seed: number, count: number): Array<{ points: string; rot: number }> {
  const rand = mulberry32(seed);
  const out: Array<{ points: string; rot: number }> = [];
  const baseX = 72;
  const baseY = 78;

  for (let i = 0; i < count; i++) {
    const x = baseX + rand() * 26;
    const y = baseY + rand() * 22;
    const s = 2.2 + rand() * 6.6;
    const rot = (rand() * 2 - 1) * 18;

    const p1 = `${x},${y}`;
    const p2 = `${x + s * (0.9 + rand() * 0.6)},${y + s * (0.2 + rand() * 0.6)}`;
    const p3 = `${x + s * (0.1 + rand() * 0.6)},${y + s * (0.9 + rand() * 0.7)}`;

    out.push({ points: `${p1} ${p2} ${p3}`, rot });
  }
  return out;
}

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

export function ShatteredHeart({
  items,
  onClick,
  className,
  seed = 42,
  maxPieces = 120,
  showFallingShards = true,
  fallingCount = 10,
  bevelStrength = 0.75,
  showIndices = true,
  forceShowHeart = false,
}: Props) {
  const { ref, w, h } = useElementSize<HTMLDivElement>();
  const isMobile = useIsMobile();
  const uid = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ src: string; title?: string } | null>(null);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        cover: item.cover || item.coverUrl,
      })),
    [items],
  );

  const pieces: TriPiece[] = useMemo(() => {
    if (!w || !h) return [];

    const N = Math.min(normalizedItems.length, maxPieces);
    if (N <= 0) return [];

    // More points -> more triangles -> richer shards
    const sampleCount = Math.max(40, Math.ceil(N * 2.2));
    const rand = mulberry32(seed + N);

    const pts: Array<[number, number]> = [];
    let attempts = 0;
    while (pts.length < sampleCount && attempts < sampleCount * 2000) {
      attempts++;
      const x = rand() * 2.4 - 1.2;
      const y = rand() * 2.4 - 1.2;
      if (isInHeart(x, y)) pts.push([x, y]);
    }

    const scale = 39.5;
    const toView = (nx: number, ny: number) => ({ x: 50 + nx * scale, y: 50 + ny * scale });
    const points = pts.map(([nx, ny]) => {
      const p = toView(nx, ny);
      return [p.x, p.y];
    });

    const delaunay = Delaunay.from(points as any);
    const tri = delaunay.triangles;

    const tris: TriPiece[] = [];

    for (let i = 0; i < tri.length; i += 3) {
      const ia = tri[i]!;
      const ib = tri[i + 1]!;
      const ic = tri[i + 2]!;

      const ax = points[ia][0],
        ay = points[ia][1];
      const bx = points[ib][0],
        by = points[ib][1];
      const cx = points[ic][0],
        cy = points[ic][1];

      const gx = (ax + bx + cx) / 3;
      const gy = (ay + by + cy) / 3;

      const nx = (gx - 50) / scale;
      const ny = (gy - 50) / scale;
      if (!isInHeart(nx, ny)) continue;

      const area = triArea(ax, ay, bx, by, cx, cy);
      if (area < 2.5) continue;

      tris.push({
        a: { x: ax, y: ay },
        b: { x: bx, y: by },
        c: { x: cx, y: cy },
        area,
        cx: gx,
        cy: gy,
        points: `${ax},${ay} ${bx},${by} ${cx},${cy}`,
      });
    }

    tris.sort((t1, t2) => t2.area - t1.area);

    return tris.slice(0, N);
  }, [w, h, normalizedItems.length, maxPieces, seed]);

  const fallingShards = useMemo(() => {
    if (!showFallingShards) return [];
    return makeFallingShards(seed + 999, clamp(fallingCount, 0, 24));
  }, [showFallingShards, fallingCount, seed]);

  const beveAlpha = clamp(bevelStrength, 0, 1);
  const seamDark = 'rgba(0,0,0,0.32)';
  const seamLight = 'rgba(255,255,255,0.18)';

  const showHeart = (forceShowHeart || !isMobile) && pieces.length > 0;
  const fallbackGrid = (
    <div className="capsule-fallback-grid">
      {normalizedItems.slice(0, 12).map((item) => (
        <button
          key={item.id}
          className="capsule-fallback"
          type="button"
          onClick={() => onClick?.(item)}
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

  return (
    <div ref={ref} className={`shattered-root ${className ?? ''}`}>
      {showHeart ? (
        <svg
          viewBox="0 0 100 100"
          className="shattered-svg"
          role="img"
          aria-label="碎裂玻璃心"
          style={{ filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.35))' }}
        >
          <defs>
            <clipPath id={`heartClip-${uid}`}>
              <path d={HEART_OUTLINE_D} />
            </clipPath>

            {pieces.map((p, i) => (
              <clipPath key={i} id={`clip-${uid}-${i}`}>
                <polygon points={p.points} />
              </clipPath>
            ))}

            <linearGradient id={`bevelHi-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`rgba(255,255,255,${0.22 * beveAlpha})`} />
              <stop offset="35%" stopColor={`rgba(255,255,255,${0.06 * beveAlpha})`} />
              <stop offset="75%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <linearGradient id={`bevelLo-${uid}`} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={`rgba(0,0,0,${0.2 * beveAlpha})`} />
              <stop offset="60%" stopColor={`rgba(0,0,0,${0.06 * beveAlpha})`} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>

            <radialGradient id={`heartGlow-${uid}`} cx="30%" cy="20%" r="80%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>

            <radialGradient id={`heartVignette-${uid}`} cx="50%" cy="55%" r="75%">
              <stop offset="60%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
            </radialGradient>

            <linearGradient id={`rimGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>

            <radialGradient id={`outerGlow-${uid}`} cx="50%" cy="50%" r="80%">
              <stop offset="60%" stopColor="rgba(124,58,237,0.15)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </radialGradient>

            <linearGradient id={`fallbackGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <g transform="translate(0 4) scale(1 0.9)">
            <path
              d={HEART_OUTLINE_D}
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={0.8}
              pointerEvents="none"
            />
          </g>

          <g clipPath={`url(#heartClip-${uid})`} transform="translate(0 4) scale(1 0.9)">
            <path d={HEART_OUTLINE_D} fill="rgba(255,255,255,0.015)" pointerEvents="none" />

            {pieces.map((p, i) => {
              const item = normalizedItems[i];
              if (!item) return null;
              const hovered = hoverIdx === i;
              const dimOthers = hoverIdx !== null && !hovered;
              const cover = item.cover;

              return (
                <g
                  key={i}
                  aria-label={item.title}
                  style={{
                    cursor: 'pointer',
                    transformOrigin: `${p.cx}px ${p.cy}px`,
                    transition: 'transform 160ms ease, filter 160ms ease, opacity 160ms ease',
                    transform: hovered ? 'scale(1.04)' : 'scale(1.0)',
                    filter: hovered
                      ? 'drop-shadow(0 14px 26px rgba(0,0,0,0.35))'
                      : 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))',
                    opacity: dimOthers ? 0.82 : 1,
                  }}
                  onMouseEnter={() => {
                    setHoverIdx(i);
                    if (cover) setPreview({ src: cover, title: item.title });
                  }}
                  onMouseLeave={() => {
                    setHoverIdx(null);
                    setPreview(null);
                  }}
                  onClick={() => onClick?.(item)}
                >
                  <title>{item.title || '回忆胶囊'}</title>
                  <rect width="100" height="100" fill={`url(#fallbackGrad-${uid})`} clipPath={`url(#clip-${uid}-${i})`} />
                  {cover ? (
                    <image
                      href={cover}
                      x={0}
                      y={0}
                      width={100}
                      height={100}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#clip-${uid}-${i})`}
                      opacity={hoverIdx !== null && !hovered ? 0.8 : 1}
                    />
                  ) : null}

                  <polygon
                    points={p.points}
                    fill={`url(#bevelHi-${uid})`}
                    clipPath={`url(#clip-${uid}-${i})`}
                    style={{ mixBlendMode: 'overlay' as any }}
                  />
                  <polygon
                    points={p.points}
                    fill={`url(#bevelLo-${uid})`}
                    clipPath={`url(#clip-${uid}-${i})`}
                    style={{ mixBlendMode: 'multiply' as any }}
                  />
                  <polygon points={p.points} fill="rgba(255,255,255,0.02)" clipPath={`url(#clip-${uid}-${i})`} />
                  {showIndices && (
                    <text
                      x={p.cx}
                      y={p.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.82)"
                      fontSize="4"
                      fontWeight="600"
                      pointerEvents="none"
                      stroke="rgba(0,0,0,0.45)"
                      strokeWidth="0.4"
                    >
                      {i + 1}
                    </text>
                  )}
                </g>
              );
            })}

            {pieces.map((p, i) => (
              <polygon
                key={`seam-dark-${i}`}
                points={p.points}
                fill="none"
                stroke={seamDark}
                strokeWidth={2.0}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
                style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.25))' }}
              />
            ))}
            {pieces.map((p, i) => (
              <polygon
                key={`seam-light-${i}`}
                points={p.points}
                fill="none"
                stroke={seamLight}
                strokeWidth={1.0}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
                opacity={0.95}
              />
            ))}

            <path d={HEART_OUTLINE_D} fill={`url(#heartGlow-${uid})`} pointerEvents="none" />
            <path d={HEART_OUTLINE_D} fill={`url(#heartVignette-${uid})`} pointerEvents="none" />
          </g>

          <path d={HEART_OUTLINE_D} fill={`url(#outerGlow-${uid})`} pointerEvents="none" transform="translate(0 4) scale(1 0.9)" opacity={0.4} />
          <path
            d={HEART_OUTLINE_D}
            fill="none"
            stroke={`url(#rimGrad-${uid})`}
            strokeWidth={1.6}
            opacity={0.35}
            pointerEvents="none"
            transform="translate(0 4) scale(1 0.9)"
          />
          <path
            d={HEART_OUTLINE_D}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.9}
            pointerEvents="none"
            transform="translate(0 4) scale(1 0.9)"
          />

          {showFallingShards && fallingShards.length > 0 && (
            <g style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))' }}>
              {fallingShards.map((s, idx) => (
                <g
                  key={idx}
                  style={{
                    transformOrigin: '0px 0px',
                    transform: `rotate(${s.rot}deg)`,
                    opacity: 0.95,
                  }}
                >
                  <polygon points={s.points} fill="rgba(255,255,255,0.05)" />
                  <polygon points={s.points} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={1.8} />
                  <polygon points={s.points} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.9} />
                </g>
              ))}
            </g>
          )}
        </svg>
      ) : (
        fallbackGrid
      )}
      {preview && !isMobile && (
        <div className="shard-preview">
          <div
            className="shard-preview-media"
            style={{ backgroundImage: `url(${preview.src})` }}
            aria-label={preview.title}
          />
          {preview.title ? <div className="shard-preview-title">{preview.title}</div> : null}
        </div>
      )}
    </div>
  );
}

export default ShatteredHeart;
