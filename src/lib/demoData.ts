import type { ParsedData, Piece, DataQuality } from '@/types/sage';

// ── Constants ──────────────────────────────────────────────────────────────────

const COMMERCIAUX = [
  'Marie Dupont',
  'Thomas Bernard',
  'Sophie Martin',
  'Lucas Petit',
  'Camille Rousseau',
];

const FAMILLES = ['Industrie', 'Tertiaire', 'Grande Distribution', 'Collectivités'];

const CLIENTS_BY_FAMILLE: Record<string, string[]> = {
  Industrie: ['ArcelorMittal France', 'Saint-Gobain Industries', 'Schneider Electric'],
  Tertiaire: ['BNP Paribas Immo', 'Bouygues Telecom', 'Capgemini Services'],
  'Grande Distribution': ['Carrefour Supply', 'Leroy Merlin Pro', 'Décathlon B2B'],
  Collectivités: ['Mairie de Lyon', 'CHU de Bordeaux', 'Région Nouvelle-Aquitaine'],
};

const ALL_CLIENTS = Object.values(CLIENTS_BY_FAMILLE).flat();

function getFamille(client: string): string {
  for (const [famille, clients] of Object.entries(CLIENTS_BY_FAMILLE)) {
    if (clients.includes(client)) return famille;
  }
  return 'Tertiaire';
}

function getCommercial(client: string): string {
  return COMMERCIAUX[ALL_CLIENTS.indexOf(client) % COMMERCIAUX.length];
}

function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

let _counter = 1;
function pid(prefix: string): string {
  return `${prefix}${String(_counter++).padStart(5, '0')}`;
}

function facture(
  date: Date,
  client: string,
  ht: number,
  ref?: string,
  extra?: Partial<Piece>
): Piece {
  const num = pid('FA');
  return {
    type: 'Facture',
    statut: 'Soldée',
    datePiece: date,
    totalHT: ht,
    totalTTC: Math.round(ht * 1.2 * 100) / 100,
    totalTVA: Math.round(ht * 0.2 * 100) / 100,
    soldeDu: 0,
    familleClients: getFamille(client),
    representant: getCommercial(client),
    client,
    ref: ref ?? null,
    numPiece: num,
    key: client + '|' + (ref ?? ''),
    poids: 0,
    dateDernierDevis: null,
    cycleJours: null,
    ...extra,
  };
}

function devis(
  date: Date,
  client: string,
  ht: number,
  statut: string,
  ref?: string,
  extra?: Partial<Piece>
): Piece {
  const num = pid('DE');
  return {
    type: 'Devis',
    statut,
    datePiece: date,
    totalHT: ht,
    totalTTC: Math.round(ht * 1.2 * 100) / 100,
    totalTVA: null,
    soldeDu: null,
    familleClients: getFamille(client),
    representant: getCommercial(client),
    client,
    ref: ref ?? null,
    numPiece: num,
    key: client + '|' + (ref ?? ''),
    poids: 0,
    dateDernierDevis: date,
    cycleJours: null,
    ...extra,
  };
}

function avoir(date: Date, client: string, ht: number, ref?: string): Piece {
  const num = pid('AV');
  return {
    type: 'Avoir',
    statut: 'Validé',
    datePiece: date,
    totalHT: -Math.abs(ht),
    totalTTC: -Math.round(Math.abs(ht) * 1.2 * 100) / 100,
    totalTVA: -Math.round(Math.abs(ht) * 0.2 * 100) / 100,
    soldeDu: 0,
    familleClients: getFamille(client),
    representant: getCommercial(client),
    client,
    ref: ref ?? null,
    numPiece: num,
    key: client + '|' + (ref ?? ''),
    poids: 0,
    dateDernierDevis: null,
    cycleJours: null,
  };
}

// ── Demo Pieces ────────────────────────────────────────────────────────────────

const PIECES: Piece[] = [
  // ── JANVIER ──────────────────────────────────────────────────────────────────
  facture(d(2024, 1, 8),  'ArcelorMittal France',    18_400, 'REF-2023-041'),
  facture(d(2024, 1, 10), 'Saint-Gobain Industries',  9_800, 'REF-2023-038'),
  facture(d(2024, 1, 12), 'Schneider Electric',       14_200, 'REF-2023-042'),
  facture(d(2024, 1, 15), 'BNP Paribas Immo',         7_500, 'REF-2023-035'),
  facture(d(2024, 1, 18), 'Bouygues Telecom',          5_200, 'REF-2023-036'),
  facture(d(2024, 1, 22), 'Carrefour Supply',         11_900, 'REF-2023-039'),
  facture(d(2024, 1, 25), 'Décathlon B2B',             6_350, 'REF-2023-040'),
  facture(d(2024, 1, 29), 'Mairie de Lyon',            3_800, 'REF-2023-037'),
  devis(d(2024, 1, 5),   'Capgemini Services',        22_000, 'En-cours',  'REF-2024-001'),
  devis(d(2024, 1, 11),  'CHU de Bordeaux',           16_500, 'A envoyer', 'REF-2024-002'),
  devis(d(2024, 1, 19),  'Leroy Merlin Pro',           8_700, 'A relancer','REF-2024-003'),

  // ── FEVRIER ──────────────────────────────────────────────────────────────────
  facture(d(2024, 2, 2),  'ArcelorMittal France',    21_600, 'REF-2024-004'),
  facture(d(2024, 2, 6),  'BNP Paribas Immo',         9_200, 'REF-2023-043'),
  facture(d(2024, 2, 9),  'Capgemini Services',       25_800, 'REF-2024-001'),
  facture(d(2024, 2, 14), 'Schneider Electric',       11_400, 'REF-2024-005'),
  facture(d(2024, 2, 16), 'Région Nouvelle-Aquitaine',4_600, 'REF-2024-006'),
  facture(d(2024, 2, 22), 'Leroy Merlin Pro',          8_100, 'REF-2024-007'),
  devis(d(2024, 2, 5),   'Saint-Gobain Industries',  19_500, 'Accepté',   'REF-2024-008'),
  devis(d(2024, 2, 13),  'Décathlon B2B',             7_200, 'En-cours',  'REF-2024-009'),
  devis(d(2024, 2, 20),  'Mairie de Lyon',            12_800, 'A envoyer', 'REF-2024-010'),
  avoir(d(2024, 2, 28),  'ArcelorMittal France',      2_200, 'REF-2024-004'),

  // ── MARS ──────────────────────────────────────────────────────────────────────
  facture(d(2024, 3, 1),  'Saint-Gobain Industries',  19_500, 'REF-2024-008'),
  facture(d(2024, 3, 4),  'Bouygues Telecom',          8_300, 'REF-2024-011'),
  facture(d(2024, 3, 7),  'Carrefour Supply',         13_700, 'REF-2024-012'),
  facture(d(2024, 3, 11), 'CHU de Bordeaux',          22_400, 'REF-2024-013'),
  facture(d(2024, 3, 14), 'ArcelorMittal France',     16_900, 'REF-2024-014'),
  facture(d(2024, 3, 19), 'Schneider Electric',        9_600, 'REF-2024-015'),
  facture(d(2024, 3, 22), 'Décathlon B2B',             6_800, 'REF-2024-009'),
  facture(d(2024, 3, 26), 'BNP Paribas Immo',         11_500, 'REF-2024-016'),
  facture(d(2024, 3, 28), 'Leroy Merlin Pro',         10_200, 'REF-2024-017'),
  devis(d(2024, 3, 6),   'Région Nouvelle-Aquitaine', 28_000, 'Accepté',   'REF-2024-018'),
  devis(d(2024, 3, 12),  'Capgemini Services',        15_000, 'En-cours',  'REF-2024-019'),
  devis(d(2024, 3, 18),  'Mairie de Lyon',            12_800, 'A relancer','REF-2024-010'),
  devis(d(2024, 3, 25),  'Carrefour Supply',           9_500, 'A envoyer', 'REF-2024-020'),

  // ── AVRIL ──────────────────────────────────────────────────────────────────────
  facture(d(2024, 4, 2),  'Région Nouvelle-Aquitaine',28_000, 'REF-2024-018'),
  facture(d(2024, 4, 5),  'ArcelorMittal France',     13_200, 'REF-2024-021'),
  facture(d(2024, 4, 8),  'Capgemini Services',       15_000, 'REF-2024-019'),
  facture(d(2024, 4, 11), 'Saint-Gobain Industries',  11_800, 'REF-2024-022'),
  facture(d(2024, 4, 15), 'Bouygues Telecom',          6_900, 'REF-2024-023'),
  facture(d(2024, 4, 18), 'Mairie de Lyon',            8_400, 'REF-2024-024'),
  facture(d(2024, 4, 22), 'Schneider Electric',       17_300, 'REF-2024-025'),
  avoir(d(2024, 4, 10),  'Capgemini Services',         1_500, 'REF-2024-019'),
  devis(d(2024, 4, 4),   'CHU de Bordeaux',           34_000, 'Accepté',   'REF-2024-026'),
  devis(d(2024, 4, 9),   'Décathlon B2B',              5_800, 'En-cours',  'REF-2024-027'),
  devis(d(2024, 4, 16),  'Leroy Merlin Pro',          13_600, 'A relancer','REF-2024-028'),
  devis(d(2024, 4, 23),  'BNP Paribas Immo',          18_500, 'A envoyer', 'REF-2024-029'),

  // ── MAI ──────────────────────────────────────────────────────────────────────
  facture(d(2024, 5, 2),  'CHU de Bordeaux',          34_000, 'REF-2024-026'),
  facture(d(2024, 5, 6),  'Carrefour Supply',         15_200, 'REF-2024-030'),
  facture(d(2024, 5, 9),  'ArcelorMittal France',     22_700, 'REF-2024-031'),
  facture(d(2024, 5, 13), 'Leroy Merlin Pro',          9_800, 'REF-2024-032'),
  facture(d(2024, 5, 16), 'Schneider Electric',       12_500, 'REF-2024-033'),
  facture(d(2024, 5, 20), 'BNP Paribas Immo',         18_500, 'REF-2024-029'),
  facture(d(2024, 5, 23), 'Bouygues Telecom',          7_200, 'REF-2024-034'),
  facture(d(2024, 5, 27), 'Décathlon B2B',             5_800, 'REF-2024-027'),
  devis(d(2024, 5, 7),   'Région Nouvelle-Aquitaine', 19_000, 'Accepté',   'REF-2024-035'),
  devis(d(2024, 5, 14),  'Saint-Gobain Industries',  24_500, 'En-cours',  'REF-2024-036'),
  devis(d(2024, 5, 21),  'Mairie de Lyon',             6_200, 'A envoyer', 'REF-2024-037'),
  avoir(d(2024, 5, 30),  'Carrefour Supply',           3_100, 'REF-2024-030'),

  // ── JUIN ──────────────────────────────────────────────────────────────────────
  facture(d(2024, 6, 3),  'Région Nouvelle-Aquitaine',19_000, 'REF-2024-035'),
  facture(d(2024, 6, 6),  'Saint-Gobain Industries',  24_500, 'REF-2024-036'),
  facture(d(2024, 6, 10), 'ArcelorMittal France',     29_300, 'REF-2024-038'),
  facture(d(2024, 6, 13), 'Capgemini Services',       18_200, 'REF-2024-039'),
  facture(d(2024, 6, 17), 'CHU de Bordeaux',          11_600, 'REF-2024-040'),
  facture(d(2024, 6, 20), 'Carrefour Supply',          8_900, 'REF-2024-041'),
  facture(d(2024, 6, 24), 'Schneider Electric',       14_700, 'REF-2024-042'),
  facture(d(2024, 6, 27), 'Mairie de Lyon',            6_200, 'REF-2024-037'),
  devis(d(2024, 6, 5),   'BNP Paribas Immo',         42_000, 'Accepté',   'REF-2024-043'),
  devis(d(2024, 6, 12),  'Leroy Merlin Pro',          17_800, 'En-cours',  'REF-2024-044'),
  devis(d(2024, 6, 19),  'Bouygues Telecom',          11_400, 'A relancer','REF-2024-045'),
  devis(d(2024, 6, 26),  'Décathlon B2B',              8_300, 'A envoyer', 'REF-2024-046'),

  // ── JUILLET ──────────────────────────────────────────────────────────────────
  facture(d(2024, 7, 2),  'BNP Paribas Immo',         42_000, 'REF-2024-043'),
  facture(d(2024, 7, 5),  'ArcelorMittal France',     16_800, 'REF-2024-047'),
  facture(d(2024, 7, 9),  'Leroy Merlin Pro',         17_800, 'REF-2024-044'),
  facture(d(2024, 7, 12), 'Schneider Electric',       20_100, 'REF-2024-048'),
  facture(d(2024, 7, 16), 'Région Nouvelle-Aquitaine',8_400, 'REF-2024-049'),
  facture(d(2024, 7, 19), 'Bouygues Telecom',         11_400, 'REF-2024-045'),
  facture(d(2024, 7, 23), 'Mairie de Lyon',            5_900, 'REF-2024-050'),
  avoir(d(2024, 7, 15),  'BNP Paribas Immo',          2_800, 'REF-2024-043'),
  devis(d(2024, 7, 4),   'Saint-Gobain Industries',  31_200, 'Accepté',   'REF-2024-051'),
  devis(d(2024, 7, 10),  'CHU de Bordeaux',          27_500, 'En-cours',  'REF-2024-052'),
  devis(d(2024, 7, 17),  'Carrefour Supply',          14_000, 'A relancer','REF-2024-053'),
  devis(d(2024, 7, 24),  'Capgemini Services',        19_800, 'A envoyer', 'REF-2024-054'),

  // ── AOUT ──────────────────────────────────────────────────────────────────────
  facture(d(2024, 8, 1),  'Saint-Gobain Industries',  31_200, 'REF-2024-051'),
  facture(d(2024, 8, 5),  'Décathlon B2B',             7_100, 'REF-2024-055'),
  facture(d(2024, 8, 8),  'ArcelorMittal France',     18_500, 'REF-2024-056'),
  facture(d(2024, 8, 12), 'Carrefour Supply',         14_000, 'REF-2024-053'),
  facture(d(2024, 8, 16), 'BNP Paribas Immo',         11_200, 'REF-2024-057'),
  facture(d(2024, 8, 20), 'Schneider Electric',        9_800, 'REF-2024-058'),
  devis(d(2024, 8, 6),   'Région Nouvelle-Aquitaine', 45_000, 'Accepté',   'REF-2024-059'),
  devis(d(2024, 8, 13),  'Bouygues Telecom',           8_600, 'En-cours',  'REF-2024-060'),
  devis(d(2024, 8, 20),  'Mairie de Lyon',            14_300, 'A envoyer', 'REF-2024-061'),
  avoir(d(2024, 8, 22),  'Saint-Gobain Industries',   1_800, 'REF-2024-051'),

  // ── SEPTEMBRE ────────────────────────────────────────────────────────────────
  facture(d(2024, 9, 2),  'Région Nouvelle-Aquitaine',45_000, 'REF-2024-059'),
  facture(d(2024, 9, 5),  'CHU de Bordeaux',          27_500, 'REF-2024-052'),
  facture(d(2024, 9, 9),  'ArcelorMittal France',     24_600, 'REF-2024-062'),
  facture(d(2024, 9, 12), 'Capgemini Services',       19_800, 'REF-2024-054'),
  facture(d(2024, 9, 16), 'Leroy Merlin Pro',         12_400, 'REF-2024-063'),
  facture(d(2024, 9, 19), 'Bouygues Telecom',          8_600, 'REF-2024-060'),
  facture(d(2024, 9, 23), 'Saint-Gobain Industries',  16_300, 'REF-2024-064'),
  facture(d(2024, 9, 26), 'Schneider Electric',       22_900, 'REF-2024-065'),
  devis(d(2024, 9, 4),   'BNP Paribas Immo',         38_500, 'Accepté',   'REF-2024-066'),
  devis(d(2024, 9, 11),  'Carrefour Supply',          21_000, 'En-cours',  'REF-2024-067'),
  devis(d(2024, 9, 18),  'Décathlon B2B',              9_400, 'A relancer','REF-2024-068'),
  devis(d(2024, 9, 25),  'Mairie de Lyon',            14_300, 'A relancer','REF-2024-061'),
  avoir(d(2024, 9, 30),  'Région Nouvelle-Aquitaine', 3_500, 'REF-2024-059'),

  // ── OCTOBRE ──────────────────────────────────────────────────────────────────
  facture(d(2024, 10, 1), 'BNP Paribas Immo',         38_500, 'REF-2024-066'),
  facture(d(2024, 10, 4), 'ArcelorMittal France',     31_200, 'REF-2024-069'),
  facture(d(2024, 10, 7), 'Schneider Electric',       18_700, 'REF-2024-070'),
  facture(d(2024, 10, 10),'Carrefour Supply',         21_000, 'REF-2024-067'),
  facture(d(2024, 10, 14),'CHU de Bordeaux',          15_800, 'REF-2024-071'),
  facture(d(2024, 10, 17),'Mairie de Lyon',           14_300, 'REF-2024-061'),
  facture(d(2024, 10, 21),'Saint-Gobain Industries',  27_400, 'REF-2024-072'),
  facture(d(2024, 10, 24),'Capgemini Services',       11_900, 'REF-2024-073'),
  facture(d(2024, 10, 28),'Décathlon B2B',             9_400, 'REF-2024-068'),
  devis(d(2024, 10, 3),  'Région Nouvelle-Aquitaine', 52_000, 'Accepté',   'REF-2024-074'),
  devis(d(2024, 10, 9),  'Leroy Merlin Pro',          16_800, 'En-cours',  'REF-2024-075'),
  devis(d(2024, 10, 15), 'Bouygues Telecom',          13_200, 'A envoyer', 'REF-2024-076'),
  avoir(d(2024, 10, 20), 'ArcelorMittal France',       4_100, 'REF-2024-069'),

  // ── NOVEMBRE ──────────────────────────────────────────────────────────────────
  facture(d(2024, 11, 4), 'Région Nouvelle-Aquitaine',52_000, 'REF-2024-074'),
  facture(d(2024, 11, 7), 'ArcelorMittal France',     26_800, 'REF-2024-077'),
  facture(d(2024, 11, 11),'BNP Paribas Immo',         14_200, 'REF-2024-078'),
  facture(d(2024, 11, 14),'Saint-Gobain Industries',  21_600, 'REF-2024-079'),
  facture(d(2024, 11, 18),'Leroy Merlin Pro',         16_800, 'REF-2024-075'),
  facture(d(2024, 11, 21),'CHU de Bordeaux',          19_400, 'REF-2024-080'),
  facture(d(2024, 11, 25),'Schneider Electric',       12_300, 'REF-2024-081'),
  facture(d(2024, 11, 28),'Carrefour Supply',          8_700, 'REF-2024-082'),
  devis(d(2024, 11, 6),  'Capgemini Services',        44_000, 'Accepté',   'REF-2024-083'),
  devis(d(2024, 11, 13), 'Décathlon B2B',             11_500, 'En-cours',  'REF-2024-084'),
  devis(d(2024, 11, 20), 'Bouygues Telecom',          13_200, 'En-cours',  'REF-2024-076'),
  devis(d(2024, 11, 27), 'Mairie de Lyon',             9_800, 'A relancer','REF-2024-085'),
  avoir(d(2024, 11, 30), 'CHU de Bordeaux',            2_400, 'REF-2024-080'),

  // ── DECEMBRE ──────────────────────────────────────────────────────────────────
  facture(d(2024, 12, 2), 'Capgemini Services',       44_000, 'REF-2024-083'),
  facture(d(2024, 12, 5), 'ArcelorMittal France',     38_500, 'REF-2024-086'),
  facture(d(2024, 12, 9), 'Saint-Gobain Industries',  17_900, 'REF-2024-087'),
  facture(d(2024, 12, 12),'Schneider Electric',       24_600, 'REF-2024-088'),
  facture(d(2024, 12, 16),'BNP Paribas Immo',         22_100, 'REF-2024-089'),
  facture(d(2024, 12, 19),'Région Nouvelle-Aquitaine',16_700, 'REF-2024-090'),
  facture(d(2024, 12, 23),'Carrefour Supply',         11_400, 'REF-2024-091'),
  facture(d(2024, 12, 27),'Mairie de Lyon',            9_800, 'REF-2024-085'),
  avoir(d(2024, 12, 20), 'Capgemini Services',         5_200, 'REF-2024-083'),
  // Pipeline ouvert en fin d'année
  devis(d(2024, 12, 3),  'Bouygues Telecom',          28_000, 'A envoyer', 'REF-2024-092'),
  devis(d(2024, 12, 10), 'Leroy Merlin Pro',          22_400, 'A relancer','REF-2024-093'),
  devis(d(2024, 12, 17), 'CHU de Bordeaux',           38_000, 'En-cours',  'REF-2024-094'),
  devis(d(2024, 12, 23), 'Décathlon B2B',             11_500, 'A envoyer', 'REF-2024-095'),
];

// ── Build ParsedData ───────────────────────────────────────────────────────────

function buildDemoData(): ParsedData {
  const commerciaux = [...new Set(PIECES.map(p => p.representant).filter(Boolean) as string[])].sort();
  const familles = [...new Set(PIECES.map(p => p.familleClients).filter(Boolean) as string[])].sort();
  const clients = [...new Set(PIECES.map(p => p.client))].sort();

  const dataQuality: DataQuality = {
    totalPieces: PIECES.length,
    datesInvalides: 0,
    refsVides: PIECES.filter(p => !p.ref).length,
    facturesSansDevis: 0,
    devisSansClient: 0,
    champsManquants: [],
  };

  return {
    pieces: PIECES,
    commerciaux,
    familles,
    clients,
    dataQuality,
  };
}

export const DEMO_DATA: ParsedData = buildDemoData();

export const DEMO_SETTINGS_MARGES = FAMILLES.map((famille, i) => ({
  famille,
  tauxMarge: [32, 28, 22, 35][i],
}));
