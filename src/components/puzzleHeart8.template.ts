export const HEART_OUTLINE_D = `
M50 16
C37 2 12 12 12 36
C12 57 30 73 50 92
C70 73 88 57 88 36
C88 12 63 2 50 16
Z
`.trim();

export const PUZZLE_PIECES_8: Array<{
  id: string;
  clipD: string;
  z: number;
}> = [
  {
    id: 'p0',
    z: 2,
    clipD: `
M0 0
H55
V24
C40 22 30 24 24 34
C18 43 18 50 22 58
L0 66
Z
`.trim(),
  },
  {
    id: 'p1',
    z: 3,
    clipD: `
M55 0
H0
V66
L22 58
C18 50 18 43 24 34
C30 24 40 22 55 24
Z
`.trim(),
  },
  {
    id: 'p2',
    z: 3,
    clipD: `
M45 0
H100
V66
L78 58
C82 50 82 43 76 34
C70 24 60 22 45 24
Z
`.trim(),
  },
  {
    id: 'p3',
    z: 2,
    clipD: `
M100 0
H45
V24
C60 22 70 24 76 34
C82 43 82 50 78 58
L100 66
Z
`.trim(),
  },
  {
    id: 'p4',
    z: 4,
    clipD: `
M0 56
L22 58
C30 66 36 72 40 80
C44 88 46 94 50 100
H0
Z
`.trim(),
  },
  {
    id: 'p5',
    z: 4,
    clipD: `
M100 56
L78 58
C70 66 64 72 60 80
C56 88 54 94 50 100
H100
Z
`.trim(),
  },
  {
    id: 'p6',
    z: 6,
    clipD: `
M0 78
H52
C48 86 46 92 50 100
H0
Z
`.trim(),
  },
  {
    id: 'p7',
    z: 6,
    clipD: `
M48 78
H100
V100
H50
C54 92 52 86 48 78
Z
`.trim(),
  },
];

export const PUZZLE_SEAMS_D: string[] = [
  'M50 18 C48 34 52 54 50 92',
  'M16 44 C30 36 40 40 50 46 C60 52 70 52 84 44',
  'M28 54 C38 62 44 72 50 92',
  'M72 54 C62 62 56 72 50 92',
  'M34 20 C28 28 26 34 30 44',
  'M66 20 C72 28 74 34 70 44',
];
