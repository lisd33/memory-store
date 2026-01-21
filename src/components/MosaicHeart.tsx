import React, { useEffect, useMemo, useRef, useState } from 'react';

type CapsuleItem = {
  id: string;
  title?: string;
  cover?: string;
  subtitle?: string;
};

type MosaicHeartProps = {
  items: CapsuleItem[];
  onClick?: (item: CapsuleItem) => void;
  className?: string;
  minTile?: number;
  maxTile?: number;
  density?: number;
  seed?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function isInHeart(x: number, y: number) {
  const yy = -y;
  const a = x * x + yy * yy - 1;
  return a * a * a - x * x * yy * yy * yy <= 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

type Tile = {
  id: string;
  x: number;
  y: number;
  s: number;
};

export function MosaicHeart({
  items,
  onClick,
  className,
  minTile = 18,
  maxTile = 96,
  density = 0.58,
  seed = 42,
}: MosaicHeartProps) {
  const { ref, w, h } = useElementSize<HTMLDivElement>();

  const layout = useMemo(() => {
    if (!w || !h || items.length === 0) return [];

    const N = items.length;
    const heartArea = w * h * density;
    const tileArea = heartArea / N;
    let tileSize = clamp(Math.sqrt(tileArea) * 0.92, minTile, maxTile);

    const rand = mulberry32(seed + N);
    const cx = w / 2;
    const cy = h / 2;
    const heartR = (Math.min(w, h) / 2) * 0.92;

    let minDist = tileSize * 0.92;
    const maxAttempts = Math.max(4000, N * 400);

    const pts: Array<{ nx: number; ny: number }> = [];

    function ok(nx: number, ny: number) {
      for (let i = 0; i < pts.length; i++) {
        const dx = nx - pts[i].nx;
        const dy = ny - pts[i].ny;
        if (dx * dx + dy * dy < (minDist / heartR) * (minDist / heartR)) return false;
      }
      return true;
    }

    let attempts = 0;
    while (pts.length < N && attempts < maxAttempts) {
      attempts++;
      const nx = rand() * 2.4 - 1.2;
      const ny = rand() * 2.4 - 1.2;

      if (!isInHeart(nx, ny)) continue;
      if (!ok(nx, ny)) continue;

      pts.push({ nx, ny });

      if (attempts > maxAttempts * 0.6 && pts.length < N * 0.8) {
        minDist *= 0.985;
      }
    }

    if (pts.length < N) {
      tileSize = Math.max(minTile, tileSize * 0.88);
      minDist = tileSize * 0.85;
    }

    const tiles: Tile[] = [];
    for (let i = 0; i < Math.min(N, pts.length); i++) {
      const { nx, ny } = pts[i];

      const px = cx + nx * heartR;
      const py = cy + ny * heartR;

      const jitter = 0.88 + rand() * 0.24;
      const s = tileSize * jitter;

      tiles.push({
        id: items[i].id,
        x: px - s / 2,
        y: py - s / 2,
        s,
      });
    }

    return tiles;
  }, [w, h, items, density, minTile, maxTile, seed]);

  const heartMaskSvg = useMemo(() => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill="black" d="M50 16 C37 2 12 12 12 36 C12 57 30 73 50 92 C70 73 88 57 88 36 C88 12 63 2 50 16 Z"/>
</svg>
`.trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        WebkitMaskImage: `url("${heartMaskSvg}")`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskImage: `url("${heartMaskSvg}")`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        contentVisibility: 'auto',
        containIntrinsicSize: '480px 480px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), rgba(255,255,255,0.00) 55%), radial-gradient(circle at 50% 60%, rgba(0,0,0,0.20), rgba(0,0,0,0.55) 90%)',
          pointerEvents: 'none',
        }}
      />

      {layout.map((t, idx) => {
        const it = items[idx];
        if (!it) return null;

        return (
          <button
            key={t.id}
            onClick={() => onClick?.(it)}
            style={{
              position: 'absolute',
              left: t.x,
              top: t.y,
              width: t.s,
              height: t.s,
              borderRadius: Math.max(10, t.s * 0.22),
              backgroundImage: it.cover ? `url("${it.cover}")` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 10px 22px rgba(0,0,0,0.22)',
              transform: 'translateZ(0)',
              transition: 'transform 160ms ease, filter 160ms ease, opacity 160ms ease',
              opacity: 1,
              cursor: 'pointer',
              padding: 0,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.filter = 'brightness(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1.0)';
              e.currentTarget.style.filter = 'brightness(1.0)';
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.10)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
