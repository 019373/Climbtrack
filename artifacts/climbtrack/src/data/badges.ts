// ─── Types ───────────────────────────────────────────────────────────────────

export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'diamond';

export const BADGE_LEVELS: BadgeLevel[] = ['bronze', 'silver', 'gold', 'diamond'];

export const BADGE_LEVEL_META: Record<BadgeLevel, { label: string; border: string; glow: string; shadow: string }> = {
  bronze:  { label: 'Bronze',  border: '#CD7F32', glow: 'rgba(205,127,50,0.35)',  shadow: 'rgba(205,127,50,0.6)' },
  silver:  { label: 'Argent',  border: '#A8A8A8', glow: 'rgba(168,168,168,0.35)', shadow: 'rgba(168,168,168,0.6)' },
  gold:    { label: 'Or',      border: '#FFD700', glow: 'rgba(255,215,0,0.35)',   shadow: 'rgba(255,215,0,0.6)'  },
  diamond: { label: 'Diamant', border: '#67E8F9', glow: 'rgba(103,232,249,0.35)', shadow: 'rgba(103,232,249,0.6)' },
};

/**
 * Metric types:
 * - 'weight'              : max weight (kg) ever logged for exerciseId (completed=true)
 * - 'duration'            : max duration (s) ever logged
 * - 'reps'                : max reps ever logged
 * - 'first'               : threshold=1 → any completed log
 * - 'no-assistance-duration' : max duration among logs where assistance ∈ ['Sans assistance', 'Lesté']
 *                              threshold=1 = "first no-assistance"
 * - 'assistance-min'      : max "assistance level index" ever achieved (lower assistance = higher index)
 *                            0=appui fort … 5=sans assistance, 6=lesté
 *                            threshold = min index required
 * - 'weighted-reps'       : max sum of (weight * reps) per session — proxy for "total load"
 * - 'records'             : cumulative PR count across all exercises
 */
export type BadgeMetric =
  | 'weight'
  | 'duration'
  | 'reps'
  | 'first'
  | 'no-assistance-duration'
  | 'assistance-min'
  | 'records';

export interface BadgeLevelDef {
  level: BadgeLevel;
  description: string;
  /** Numeric threshold. The badge is earned when computed metric >= threshold. */
  threshold: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  /** Brief subtitle shown on the page */
  subtitle: string;
  /** Key for the SVG illustration component */
  icon: string;
  category: string;
  exerciseId?: string;
  metric: BadgeMetric;
  unit: string;
  levels: BadgeLevelDef[];
}

// ─── Badge definitions ────────────────────────────────────────────────────────
// Thresholds are the MINIMUM value to unlock that level.
// Levels are CUMULATIVE: reaching a higher threshold also unlocks all lower ones.
// ─────────────────────────────────────────────────────────────────────────────

export const BADGES: BadgeDef[] = [

  // ── Force doigts ────────────────────────────────────────────────────────────

  {
    id: 'suspension-20mm',
    name: 'Suspension 20 mm',
    subtitle: 'Réglette 20 mm sans assistance',
    icon: 'fingerboard-20',
    category: 'Force doigts',
    exerciseId: 'suspension-20mm',
    metric: 'no-assistance-duration',
    unit: 's',
    levels: [
      { level: 'bronze',  description: 'Première suspension sans assistance',   threshold: 1  },
      { level: 'silver',  description: '20 secondes sans assistance',           threshold: 20 },
      { level: 'gold',    description: '30 secondes sans assistance',           threshold: 30 },
      { level: 'diamond', description: '45 secondes sans assistance',           threshold: 45 },
    ],
  },

  {
    id: 'dead-hang',
    name: 'Dead hang 25 mm',
    subtitle: 'Bras tendus sur bac',
    icon: 'dead-hang',
    category: 'Force doigts',
    exerciseId: 'dead-hang',
    metric: 'duration',
    unit: 's',
    levels: [
      { level: 'bronze',  description: '20 secondes',  threshold: 20 },
      { level: 'silver',  description: '30 secondes',  threshold: 30 },
      { level: 'gold',    description: '45 secondes',  threshold: 45 },
      { level: 'diamond', description: '60 secondes',  threshold: 60 },
    ],
  },

  {
    id: 'pince-disque',
    name: 'Pince disque',
    subtitle: 'Main pinçant un disque',
    icon: 'pinch',
    category: 'Force doigts',
    exerciseId: 'pince-disque',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '15 kg',  threshold: 15 },
      { level: 'silver',  description: '20 kg',  threshold: 20 },
      { level: 'gold',    description: '25 kg',  threshold: 25 },
      { level: 'diamond', description: '30 kg',  threshold: 30 },
    ],
  },

  {
    id: 'repeaters',
    name: 'Repeaters',
    subtitle: 'Endurance musculaire doigts',
    icon: 'repeaters',
    category: 'Force doigts',
    exerciseId: 'repeaters-7-3',
    metric: 'assistance-min',
    unit: '',
    levels: [
      { level: 'bronze',  description: 'Première séance',     threshold: 0 },
      { level: 'silver',  description: 'Sans assistance',     threshold: 5 },
      { level: 'gold',    description: 'Sans assistance — 3 séances', threshold: 50 }, // index 50 = "Sans assistance × 3 sessions" via special encoding
      { level: 'diamond', description: 'Avec lest',          threshold: 6 },
    ],
  },

  {
    id: 'sauts',
    name: 'Sauts pour prise',
    subtitle: 'Explosivité sur board',
    icon: 'jump',
    category: 'Force doigts',
    exerciseId: 'sauts-prise',
    metric: 'first',
    unit: '',
    levels: [
      { level: 'bronze',  description: 'Première séance', threshold: 1 },
    ],
  },

  {
    id: 'lourd-leger',
    name: 'Lourd-léger',
    subtitle: 'Force et explosivité',
    icon: 'heavy-light',
    category: 'Force doigts',
    exerciseId: 'lourd-leger',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '+5 kg de lest',   threshold: 5  },
      { level: 'silver',  description: '+10 kg de lest',  threshold: 10 },
      { level: 'gold',    description: '+15 kg de lest',  threshold: 15 },
      { level: 'diamond', description: '+20 kg de lest',  threshold: 20 },
    ],
  },

  // ── Tractions ────────────────────────────────────────────────────────────────

  {
    id: 'tractions-lestees',
    name: 'Tractions lestées',
    subtitle: 'Barre avec disque',
    icon: 'pullup',
    category: 'Tractions',
    exerciseId: 'tractions-lestees',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '+1 kg',   threshold: 1  },
      { level: 'silver',  description: '+10 kg',  threshold: 10 },
      { level: 'gold',    description: '+20 kg',  threshold: 20 },
      { level: 'diamond', description: '+35 kg',  threshold: 35 },
    ],
  },

  // ── Musculation ──────────────────────────────────────────────────────────────

  {
    id: 'developpe-militaire',
    name: 'Développé militaire',
    subtitle: 'Barre au-dessus de la tête',
    icon: 'military-press',
    category: 'Musculation',
    exerciseId: 'developpe-militaire',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '20 kg',  threshold: 20 },
      { level: 'silver',  description: '30 kg',  threshold: 30 },
      { level: 'gold',    description: '40 kg',  threshold: 40 },
      { level: 'diamond', description: '50 kg',  threshold: 50 },
    ],
  },

  {
    id: 'rowing',
    name: 'Rowing haltère',
    subtitle: 'Tirage unilatéral',
    icon: 'dumbbell',
    category: 'Musculation',
    exerciseId: 'rowing-haltere',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '12,5 kg',  threshold: 12 },
      { level: 'silver',  description: '20 kg',    threshold: 20 },
      { level: 'gold',    description: '30 kg',    threshold: 30 },
      { level: 'diamond', description: '40 kg',    threshold: 40 },
    ],
  },

  {
    id: 'face-pull',
    name: 'Face Pull',
    subtitle: 'Coiffe des rotateurs',
    icon: 'pulley',
    category: 'Musculation',
    exerciseId: 'facepull',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '10 kg',  threshold: 10 },
      { level: 'silver',  description: '15 kg',  threshold: 15 },
      { level: 'gold',    description: '20 kg',  threshold: 20 },
      { level: 'diamond', description: '25 kg',  threshold: 25 },
    ],
  },

  // ── Gainage ──────────────────────────────────────────────────────────────────

  {
    id: 'planche',
    name: 'Planche',
    subtitle: 'Gainage avant-bras',
    icon: 'plank',
    category: 'Gainage',
    exerciseId: 'planche',
    metric: 'duration',
    unit: 's',
    levels: [
      { level: 'bronze',  description: '1 minute',  threshold: 60  },
      { level: 'silver',  description: '2 minutes', threshold: 120 },
      { level: 'gold',    description: '3 minutes', threshold: 180 },
      { level: 'diamond', description: '5 minutes', threshold: 300 },
    ],
  },

  {
    id: 'planche-laterale',
    name: 'Planche latérale',
    subtitle: 'Gainage obliques',
    icon: 'side-plank',
    category: 'Gainage',
    exerciseId: 'planche-laterale',
    metric: 'duration',
    unit: 's',
    levels: [
      { level: 'bronze',  description: '50 secondes',     threshold: 50  },
      { level: 'silver',  description: '1 min 30',        threshold: 90  },
      { level: 'gold',    description: '2 minutes',       threshold: 120 },
      { level: 'diamond', description: '3 minutes',       threshold: 180 },
    ],
  },

  // ── Jambes ───────────────────────────────────────────────────────────────────

  {
    id: 'squat',
    name: 'Squat',
    subtitle: 'Flexion des jambes',
    icon: 'squat',
    category: 'Jambes',
    exerciseId: 'squat',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '40 kg',   threshold: 40  },
      { level: 'silver',  description: '60 kg',   threshold: 60  },
      { level: 'gold',    description: '80 kg',   threshold: 80  },
      { level: 'diamond', description: '100 kg',  threshold: 100 },
    ],
  },

  {
    id: 'fentes-bulgares',
    name: 'Fentes bulgares',
    subtitle: 'Fentes avec haltères',
    icon: 'lunge',
    category: 'Jambes',
    exerciseId: 'fentes-bulgares',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '6 kg',   threshold: 6  },
      { level: 'silver',  description: '12 kg',  threshold: 12 },
      { level: 'gold',    description: '18 kg',  threshold: 18 },
      { level: 'diamond', description: '24 kg',  threshold: 24 },
    ],
  },

  {
    id: 'mollets',
    name: 'Élévations mollets',
    subtitle: 'Extension pointe des pieds',
    icon: 'calf',
    category: 'Jambes',
    exerciseId: 'mollets-debout',
    metric: 'weight',
    unit: 'kg',
    levels: [
      { level: 'bronze',  description: '7 kg',   threshold: 7  },
      { level: 'silver',  description: '15 kg',  threshold: 15 },
      { level: 'gold',    description: '25 kg',  threshold: 25 },
      { level: 'diamond', description: '40 kg',  threshold: 40 },
    ],
  },

  // ── Global ───────────────────────────────────────────────────────────────────

  {
    id: 'progression-generale',
    name: 'Progression',
    subtitle: 'Records personnels battus',
    icon: 'chart',
    category: 'Global',
    exerciseId: undefined,
    metric: 'records',
    unit: 'PR',
    levels: [
      { level: 'bronze',  description: '10 records battus',  threshold: 10  },
      { level: 'silver',  description: '25 records battus',  threshold: 25  },
      { level: 'gold',    description: '50 records battus',  threshold: 50  },
      { level: 'diamond', description: '100 records battus', threshold: 100 },
    ],
  },
];

export const BADGE_BY_ID = Object.fromEntries(BADGES.map(b => [b.id, b]));

/** All unique categories in display order */
export const BADGE_CATEGORIES = [...new Set(BADGES.map(b => b.category))];
