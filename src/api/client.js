// Default to same-origin so front+back can share one port; override via VITE_API_URL if needed
const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return res.json();
}

export async function fetchState() {
  return request('/api/state');
}

export async function createCapsule(capsule) {
  return request('/api/capsules', {
    method: 'POST',
    body: JSON.stringify({ capsule }),
  });
}

export async function updateCapsule(id, data) {
  return request(`/api/capsules/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateBucket(id, data) {
  return request(`/api/bucket/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateNote(note) {
  return request('/api/note', {
    method: 'PUT',
    body: JSON.stringify({ note }),
  });
}
