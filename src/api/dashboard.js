const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_PRODUCTS = [
  { id: 'atlas', name: 'Atlas UI Kit', engagement: 0.84, latency: 182 },
  { id: 'pulse', name: 'Pulse Analytics', engagement: 0.76, latency: 143 },
  { id: 'relay', name: 'Relay Support Desk', engagement: 0.68, latency: 205 },
  { id: 'keystone', name: 'Keystone Automation', engagement: 0.72, latency: 167 },
  { id: 'aurora', name: 'Aurora Docs', engagement: 0.61, latency: 151 },
];

const MOCK_ACTIVITY = [
  { label: 'Server render time', value: 312 },
  { label: 'Client hydration', value: 410 },
  { label: 'API cache hit rate', value: 0.71 },
  { label: 'Navigation ready', value: 1480 },
];

export function fetchProducts() {
  // Simulated async fetch; starts immediately to avoid waterfalls.
  return wait(140).then(() =>
    MOCK_PRODUCTS.map((product, index) => ({
      ...product,
      // Slight variance to keep the UI lively.
      engagement: Number((product.engagement + index * 0.012).toFixed(2)),
      latency: product.latency + index * 11,
    })),
  );
}

export function fetchActivity() {
  return wait(220).then(() => MOCK_ACTIVITY);
}

export function fetchRecommendations(productsPromise) {
  // Start computing recommendations as soon as product data is available.
  const reasoningPromise = wait(180);

  return Promise.all([productsPromise, reasoningPromise]).then(([products]) => {
    const sorted = [...products].sort((a, b) => b.engagement - a.engagement);

    return [
      {
        id: 'bundle-dynamic-imports',
        title: 'Lazy load analytics panels',
        detail: 'Gate heavier insights behind user intent to keep TTI fast.',
        target: sorted[0]?.name ?? 'Primary surface',
      },
      {
        id: 'async-parallel',
        title: 'Parallelize dashboard queries',
        detail: 'Launch independent fetches together to avoid waterfalls.',
        target: `${sorted[1]?.name ?? 'Secondary surface'} & activity feed`,
      },
      {
        id: 'rerender-dependencies',
        title: 'Trim render payloads',
        detail: 'Pass only primitives to effects and derived UI helpers.',
        target: sorted[2]?.name ?? 'Supporting view',
      },
    ];
  });
}
