import React, { useId, useMemo, useState } from 'react';
import { HEART_OUTLINE_D, PUZZLE_PIECES_8, PUZZLE_SEAMS_D } from './puzzleHeart8.template';

type CapsuleItem = {
  id: string;
  title?: string;
  cover?: string;
  subtitle?: string;
};

type PuzzleHeart8Props = {
  items: CapsuleItem[];
  onClick?: (item: CapsuleItem) => void;
  className?: string;
};

export function PuzzleHeart8({ items, onClick, className }: PuzzleHeart8Props) {
  const uid = useId();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const shown = useMemo(() => items.slice(0, 8), [items]);

  return (
    <div className={className}>
      <svg
        viewBox="0 0 100 100"
        className="puzzle-svg"
        role="img"
        aria-label="心形拼图"
      >
        <defs>
          <clipPath id={`heart-clip-${uid}`}>
            <path d={HEART_OUTLINE_D} />
          </clipPath>

          {PUZZLE_PIECES_8.map((p) => (
            <clipPath id={`piece-clip-${uid}-${p.id}`} key={p.id} clipPathUnits="userSpaceOnUse">
              <path d={p.clipD} />
            </clipPath>
          ))}

          <radialGradient id={`glow-${uid}`} cx="30%" cy="20%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          <radialGradient id={`vignette-${uid}`} cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.38)" />
          </radialGradient>
        </defs>

        <path
          d={HEART_OUTLINE_D}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.2}
        />

        <g clipPath={`url(#heart-clip-${uid})`}>
          <path d={HEART_OUTLINE_D} fill="rgba(255,255,255,0.04)" />

          {PUZZLE_PIECES_8.map((p, idx) => {
            const it = shown[idx];
            if (!it) return null;
            const hovered = hoverId === p.id;

            return (
              <g
                key={p.id}
                clipPath={`url(#piece-clip-${uid}-${p.id})`}
                style={{
                  cursor: 'pointer',
                  transformOrigin: '50px 50px',
                  transition: 'transform 180ms ease, filter 180ms ease, opacity 180ms ease',
                  transform: hovered ? 'scale(1.012)' : 'scale(1.0)',
                  filter: hovered
                    ? 'drop-shadow(0 12px 22px rgba(0,0,0,0.35))'
                    : 'drop-shadow(0 6px 14px rgba(0,0,0,0.2))',
                  zIndex: p.z ?? 1,
                }}
                onMouseEnter={() => setHoverId(p.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => onClick?.(it)}
              >
                <rect width="100" height="100" fill="url(#puzzle-fallback)" />
                {it.cover ? (
                  <image
                    href={it.cover}
                    x={0}
                    y={0}
                    width={100}
                    height={100}
                    preserveAspectRatio="xMidYMid slice"
                    opacity={hoverId && !hovered ? 0.82 : 1}
                  />
                ) : null}
                <rect width="100" height="100" fill="rgba(255,255,255,0.02)" />
              </g>
            );
          })}

          <path d={HEART_OUTLINE_D} fill={`url(#glow-${uid})`} />
          <path d={HEART_OUTLINE_D} fill={`url(#vignette-${uid})`} />

          {PUZZLE_SEAMS_D.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.05}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.28))',
              }}
            />
          ))}

          <path
            d={HEART_OUTLINE_D}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1.5}
          />
        </g>

        <defs>
          <linearGradient id="puzzle-fallback" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
