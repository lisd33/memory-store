export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// 隐式心形方程：输入范围建议 [-1.2, 1.2]
export function isInHeart(x: number, y: number) {
  // 翻转 y 更符合视觉
  const yy = -y;
  const a = x * x + yy * yy - 1;
  return a * a * a - x * x * yy * yy * yy <= 0;
}

// 稳定随机：保证刷新不抖
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 三角形面积（像素坐标）
export function triArea(ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  return Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);
}
