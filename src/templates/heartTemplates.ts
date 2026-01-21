export const HEART_OUTLINE =
  'M50 10 C35 -2 8 8 10 36 C12 58 30 72 50 90 C70 72 88 58 90 36 C92 8 65 -2 50 10 Z';

// Paths are designed to share edges and form a cohesive heart.
export const HEART_TEMPLATES = {
  4: [
    {
      id: 'tl',
      path: 'M50 10 C35 -2 12 6 14 30 C22 36 32 40 38 46 L50 42 Z',
      zIndex: 3,
    },
    {
      id: 'tr',
      path: 'M50 10 C65 -2 88 6 86 30 C78 36 68 40 62 46 L50 42 Z',
      zIndex: 3,
    },
    {
      id: 'bl',
      path: 'M14 30 C18 52 32 66 50 82 L50 42 L38 46 C32 40 22 36 14 30 Z',
      zIndex: 2,
    },
    {
      id: 'br',
      path: 'M86 30 C82 52 68 66 50 82 L50 42 L62 46 C68 40 78 36 86 30 Z',
      zIndex: 2,
    },
  ],
  6: [
    {
      id: 'tl',
      path: 'M50 10 C35 -2 12 6 14 30 C22 34 30 36 36 40 L50 36 Z',
      zIndex: 4,
    },
    {
      id: 'tr',
      path: 'M50 10 C65 -2 88 6 86 30 C78 34 70 36 64 40 L50 36 Z',
      zIndex: 4,
    },
    {
      id: 'ml',
      path: 'M14 30 C18 46 28 54 38 60 L50 52 L50 36 C44 36 36 34 28 30 Z',
      zIndex: 3,
    },
    {
      id: 'mr',
      path: 'M86 30 C82 46 72 54 62 60 L50 52 L50 36 C56 36 64 34 72 30 Z',
      zIndex: 3,
    },
    {
      id: 'bl',
      path: 'M38 60 L50 52 L50 82 C40 74 28 62 22 48 Z',
      zIndex: 2,
    },
    {
      id: 'br',
      path: 'M62 60 L50 52 L50 82 C60 74 72 62 78 48 Z',
      zIndex: 2,
    },
  ],
};
