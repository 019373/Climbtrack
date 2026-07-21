export type BadgeLevel =
  | "bronze"
  | "silver"
  | "gold"
  | "diamond";

export const BADGE_LEVELS: BadgeLevel[] = [
  "bronze",
  "silver",
  "gold",
  "diamond",
];

export const BADGE_LEVEL_META: Record<
  BadgeLevel,
  {
    label: string;
    border: string;
    glow: string;
    shadow: string;
  }
> = {
  bronze: {
    label: "Bronze",
    border: "#CD7F32",
    glow: "rgba(205,127,50,0.35)",
    shadow: "rgba(205,127,50,0.6)",
  },

  silver: {
    label: "Argent",
    border: "#A8A8A8",
    glow: "rgba(168,168,168,0.35)",
    shadow: "rgba(168,168,168,0.6)",
  },

  gold: {
    label: "Or",
    border: "#FFD700",
    glow: "rgba(255,215,0,0.35)",
    shadow: "rgba(255,215,0,0.6)",
  },

  diamond: {
    label: "Diamant",
    border: "#67E8F9",
    glow: "rgba(103,232,249,0.35)",
    shadow: "rgba(103,232,249,0.6)",
  },
};

export type BadgeMetric =
  | "weight"
  | "duration"
  | "reps"
  | "sets"
  | "sessions"
  | "first"
  | "no-assistance-duration"
  | "assistance-min"
  | "sloper-duration"
  | "bilateral-jumps"
  | "records"
  | "kilter-angle"
  | "climbing-color";

export interface BadgeLevelDef {
  level: BadgeLevel;
  description: string;
  threshold: number;
  minSets?: number;
  angle?: 30 | 45;

  /**
   * Cotation exacte utilisée pour les badges Kilter.
   * Réussir une V5 ne débloque jamais V0 à V4.
   */
  grade?: number;
}

export type BadgeKind =
  | "standard"
  | "kilter"
  | "climbing-color";

export type ClimbingColor =
  | "rose"
  | "jaune"
  | "vert"
  | "turquoise"
  | "bleu"
  | "orange"
  | "rouge"
  | "noir"
  | "blanc";

export interface BadgeDef {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  category: string;
  exerciseId?: string;
  metric: BadgeMetric;
  unit: string;
  levels: BadgeLevelDef[];

  /**
   * Permet à la page des badges d’utiliser
   * un affichage particulier.
   */
  kind?: BadgeKind;

  /**
   * Couleur visuelle du badge de bloc.
   */
  visualColor?: string;

  /**
   * Couleur de bloc exacte à réussir.
   */
  climbingColor?: ClimbingColor;

  /**
   * Les badges de couleurs ne doivent pas afficher
   * Bronze, Argent, Or ou Diamant.
   */
  hideLevelLabel?: boolean;
}

  const STANDARD_BADGES: BadgeDef[] = [
  {
    id: "suspension-20mm",
    name: "Suspension 20 mm",
    subtitle: "Réglette 20 mm sans assistance",
    icon: "fingerboard-20",
    category: "Force doigts",
    exerciseId: "suspension-20mm",
    metric: "no-assistance-duration",
    unit: "s",

    levels: [
      {
        level: "bronze",
        description: "15 secondes sans assistance",
        threshold: 15,
      },
      {
        level: "silver",
        description: "25 secondes sans assistance",
        threshold: 25,
      },
      {
        level: "gold",
        description: "35 secondes sans assistance",
        threshold: 35,
      },
      {
        level: "diamond",
        description: "50 secondes sans assistance",
        threshold: 50,
      },
    ],
  },

  {
    id: "dead-hang",
    name: "Suspension 25 mm",
    subtitle: "Suspension bras tendus sur une prise de 25 mm",
    icon: "fingerboard-25",
    category: "Force doigts",
    exerciseId: "dead-hang",
    metric: "duration",
    unit: "s",

    levels: [
      {
        level: "bronze",
        description: "30 secondes",
        threshold: 30,
      },
      {
        level: "silver",
        description: "45 secondes",
        threshold: 45,
      },
      {
        level: "gold",
        description: "60 secondes",
        threshold: 60,
      },
      {
        level: "diamond",
        description: "90 secondes",
        threshold: 90,
      },
    ],
  },

  {
    id: "suspension-slopers",
    name: "Suspensions sur slopers",
    subtitle: "Suspension sur prises arrondies",
    icon: "sloper",
    category: "Force doigts",
    exerciseId: "suspension-slopers",
    metric: "sloper-duration",
    unit: "s",

    levels: [
      {
        level: "bronze",
        description:
          "6 séries de 15 secondes sur 30°",
        threshold: 15,
        minSets: 6,
        angle: 30,
      },
      {
        level: "silver",
        description:
          "6 séries de 30 secondes sur 30°",
        threshold: 30,
        minSets: 6,
        angle: 30,
      },
      {
        level: "gold",
        description:
          "6 séries de 20 secondes sur 45°",
        threshold: 20,
        minSets: 6,
        angle: 45,
      },
      {
        level: "diamond",
        description:
          "6 séries de 40 secondes sur 45°",
        threshold: 40,
        minSets: 6,
        angle: 45,
      },
    ],
  },

  {
    id: "pince-disque",
    name: "Pince disque",
    subtitle: "Maintenir un disque en pince",
    icon: "pinch",
    category: "Force doigts",
    exerciseId: "pince-disque",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "25 kg",
        threshold: 25,
      },
      {
        level: "silver",
        description: "30 kg",
        threshold: 30,
      },
      {
        level: "gold",
        description: "40 kg",
        threshold: 40,
      },
      {
        level: "diamond",
        description: "50 kg",
        threshold: 50,
      },
    ],
  },

  {
    id: "repeaters",
    name: "Repeaters",
    subtitle:
      "7 secondes suspendu / 3 secondes de repos",
    icon: "repeaters",
    category: "Force doigts",
    exerciseId: "repeaters-7-3",
    metric: "sets",
    unit: "séries",

    levels: [
      {
        level: "bronze",
        description: "3 séries",
        threshold: 3,
      },
      {
        level: "silver",
        description: "5 séries",
        threshold: 5,
      },
      {
        level: "gold",
        description: "7 séries",
        threshold: 7,
      },
      {
        level: "diamond",
        description: "10 séries",
        threshold: 10,
      },
    ],
  },

  {
    id: "sauts",
    name: "Sauts pour prise",
    subtitle:
      "Monter de prise en prise avec chaque main",
    icon: "jump",
    category: "Force doigts",
    exerciseId: "sauts-prise",
    metric: "bilateral-jumps",
    unit: "prises",

    levels: [
      {
        level: "bronze",
        description:
          "Sauter 4 prises avec chaque main",
        threshold: 4,
      },
      {
        level: "silver",
        description:
          "Sauter 5 prises avec chaque main",
        threshold: 5,
      },
      {
        level: "gold",
        description:
          "Sauter 6 prises avec chaque main",
        threshold: 6,
      },
      {
        level: "diamond",
        description:
          "Sauter 7 prises avec chaque main",
        threshold: 7,
      },
    ],
  },

  {
    id: "lourd-leger",
    name: "Lourd-léger",
    subtitle:
      "Tractions lourdes puis explosives",
    icon: "heavy-light",
    category: "Force doigts",
    exerciseId: "lourd-leger",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "+20 kg de lest",
        threshold: 20,
      },
      {
        level: "silver",
        description: "+30 kg de lest",
        threshold: 30,
      },
      {
        level: "gold",
        description: "+40 kg de lest",
        threshold: 40,
      },
      {
        level: "diamond",
        description: "+50 kg de lest",
        threshold: 50,
      },
    ],
  },

  {
    id: "tractions-lestees",
    name: "Tractions lestées",
    subtitle:
      "Tractions avec un poids supplémentaire",
    icon: "pullup",
    category: "Tractions",
    exerciseId: "tractions-lestees",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "+12,5 kg",
        threshold: 12.5,
      },
      {
        level: "silver",
        description: "+20 kg",
        threshold: 20,
      },
      {
        level: "gold",
        description: "+30 kg",
        threshold: 30,
      },
      {
        level: "diamond",
        description: "+40 kg",
        threshold: 40,
      },
    ],
  },

  {
    id: "developpe-militaire",
    name: "Développé militaire",
    subtitle:
      "Barre poussée au-dessus de la tête",
    icon: "barbell",
    category: "Musculation",
    exerciseId: "developpe-militaire",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "30 kg",
        threshold: 30,
      },
      {
        level: "silver",
        description: "40 kg",
        threshold: 40,
      },
      {
        level: "gold",
        description: "50 kg",
        threshold: 50,
      },
      {
        level: "diamond",
        description: "60 kg",
        threshold: 60,
      },
    ],
  },

  {
    id: "rowing",
    name: "Rowing haltère",
    subtitle:
      "Tirage unilatéral avec haltère",
    icon: "dumbbell",
    category: "Musculation",
    exerciseId: "rowing-haltere",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "20 kg",
        threshold: 20,
      },
      {
        level: "silver",
        description: "25 kg",
        threshold: 25,
      },
      {
        level: "gold",
        description: "32,5 kg",
        threshold: 32.5,
      },
      {
        level: "diamond",
        description: "40 kg",
        threshold: 40,
      },
    ],
  },

  {
    id: "face-pull",
    name: "Face Pull",
    subtitle:
      "Tirage à la poulie vers le visage",
    icon: "pulley",
    category: "Musculation",
    exerciseId: "facepull",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "40 kg",
        threshold: 40,
      },
      {
        level: "silver",
        description: "50 kg",
        threshold: 50,
      },
      {
        level: "gold",
        description: "60 kg",
        threshold: 60,
      },
      {
        level: "diamond",
        description: "70 kg",
        threshold: 70,
      },
    ],
  },

  {
    id: "planche",
    name: "Planche",
    subtitle:
      "Gainage sur les avant-bras",
    icon: "plank",
    category: "Gainage",
    exerciseId: "planche",
    metric: "duration",
    unit: "s",

    levels: [
      {
        level: "bronze",
        description: "1 minute 30",
        threshold: 90,
      },
      {
        level: "silver",
        description: "2 minutes 30",
        threshold: 150,
      },
      {
        level: "gold",
        description: "4 minutes",
        threshold: 240,
      },
      {
        level: "diamond",
        description: "6 minutes",
        threshold: 360,
      },
    ],
  },

  {
    id: "planche-laterale",
    name: "Planche latérale",
    subtitle:
      "Gainage latéral des obliques",
    icon: "side-plank",
    category: "Gainage",
    exerciseId: "planche-laterale",
    metric: "duration",
    unit: "s",

    levels: [
      {
        level: "bronze",
        description: "1 minute 15",
        threshold: 75,
      },
      {
        level: "silver",
        description: "2 minutes",
        threshold: 120,
      },
      {
        level: "gold",
        description: "3 minutes",
        threshold: 180,
      },
      {
        level: "diamond",
        description: "4 minutes",
        threshold: 240,
      },
    ],
  },

  {
    id: "squat",
    name: "Squat",
    subtitle: "Squats au poids du corps",
    icon: "squat",
    category: "Jambes",
    exerciseId: "squat",
    metric: "reps",
    unit: "rép./série",

    levels: [
      {
        level: "bronze",
        description:
          "3 séries de 15 répétitions",
        threshold: 15,
        minSets: 3,
      },
      {
        level: "silver",
        description:
          "3 séries de 30 répétitions",
        threshold: 30,
        minSets: 3,
      },
      {
        level: "gold",
        description:
          "3 séries de 50 répétitions",
        threshold: 50,
        minSets: 3,
      },
      {
        level: "diamond",
        description:
          "3 séries de 65 répétitions",
        threshold: 65,
        minSets: 3,
      },
    ],
  },

  {
    id: "fentes-bulgares",
    name: "Fentes bulgares",
    subtitle:
      "Fentes avec le pied arrière surélevé",
    icon: "lunge",
    category: "Jambes",
    exerciseId: "fentes-bulgares",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "18 kg",
        threshold: 18,
      },
      {
        level: "silver",
        description: "24 kg",
        threshold: 24,
      },
      {
        level: "gold",
        description: "30 kg",
        threshold: 30,
      },
      {
        level: "diamond",
        description: "36 kg",
        threshold: 36,
      },
    ],
  },

  {
    id: "mollets",
    name: "Élévations mollets",
    subtitle:
      "Extension sur la pointe des pieds",
    icon: "calf",
    category: "Jambes",
    exerciseId: "mollets-debout",
    metric: "weight",
    unit: "kg",

    levels: [
      {
        level: "bronze",
        description: "15 kg",
        threshold: 15,
      },
      {
        level: "silver",
        description: "25 kg",
        threshold: 25,
      },
      {
        level: "gold",
        description: "35 kg",
        threshold: 35,
      },
      {
        level: "diamond",
        description: "50 kg",
        threshold: 50,
      },
    ],
  },

  {
    id: "progression-generale",
    name: "Progression",
    subtitle:
      "Records personnels battus",
    icon: "chart",
    category: "Global",
    metric: "records",
    unit: "PR",

    levels: [
      {
        level: "bronze",
        description:
          "10 records personnels battus",
        threshold: 10,
      },
      {
        level: "silver",
        description:
          "25 records personnels battus",
        threshold: 25,
      },
      {
        level: "gold",
        description:
          "50 records personnels battus",
        threshold: 50,
      },
      {
        level: "diamond",
        description:
          "100 records personnels battus",
        threshold: 100,
      },
    ],
  },
];
const CLIMBING_COLOR_BADGES: BadgeDef[] = [
  {
    id: "bloc-rose",
    name: "Bloc rose",
    subtitle: "Réussir au moins un bloc rose",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "rose",
    visualColor: "#EC4899",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc rose",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-jaune",
    name: "Bloc jaune",
    subtitle: "Réussir au moins un bloc jaune",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "jaune",
    visualColor: "#FACC15",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc jaune",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-vert",
    name: "Bloc vert",
    subtitle: "Réussir au moins un bloc vert",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "vert",
    visualColor: "#22C55E",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc vert",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-turquoise",
    name: "Bloc turquoise",
    subtitle: "Réussir au moins un bloc turquoise",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "turquoise",
    visualColor: "#2DD4BF",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc turquoise",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-bleu",
    name: "Bloc bleu",
    subtitle: "Réussir au moins un bloc bleu",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "bleu",
    visualColor: "#3B82F6",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc bleu",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-orange",
    name: "Bloc orange",
    subtitle: "Réussir au moins un bloc orange",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "orange",
    visualColor: "#F97316",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc orange",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-rouge",
    name: "Bloc rouge",
    subtitle: "Réussir au moins un bloc rouge",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "rouge",
    visualColor: "#EF4444",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc rouge",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-noir",
    name: "Bloc noir",
    subtitle: "Réussir au moins un bloc noir",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "noir",
    visualColor: "#171717",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc noir",
        threshold: 1,
      },
    ],
  },

  {
    id: "bloc-blanc",
    name: "Bloc blanc",
    subtitle: "Réussir au moins un bloc blanc",
    icon: "climbing-hold",
    category: "Couleurs de blocs",
    metric: "climbing-color",
    unit: "bloc",
    kind: "climbing-color",
    climbingColor: "blanc",
    visualColor: "#F5F5F5",
    hideLevelLabel: true,

    levels: [
      {
        level: "diamond",
        description: "Réussir un bloc blanc",
        threshold: 1,
      },
    ],
  },
];

const KILTER_BADGES: BadgeDef[] = Array.from(
  {
    length: 18,
  },
  (_, grade) => ({
    id: `kilter-v${grade}`,

    name: `Kilter V${grade}`,

    subtitle: `Meilleure inclinaison réussie en V${grade}`,

    icon: "kilter-hold",

    category: "Kilterboard",

    metric: "kilter-angle" as const,

    unit: "°",

    kind: "kilter" as const,

    levels: [
      {
        level: "bronze" as const,

        description: `Réussir une V${grade} à 30°`,

        threshold: 30,

        grade,
      },

      {
        level: "silver" as const,

        description: `Réussir une V${grade} à 35°`,

        threshold: 35,

        grade,
      },

      {
        level: "gold" as const,

        description: `Réussir une V${grade} à 40°`,

        threshold: 40,

        grade,
      },

      {
        level: "diamond" as const,

        description: `Réussir une V${grade} à 45°`,

        threshold: 45,

        grade,
      },
    ],
  }),
);

export const BADGES: BadgeDef[] = [
  ...STANDARD_BADGES,
  ...CLIMBING_COLOR_BADGES,
  ...KILTER_BADGES,
];
export const BADGE_BY_ID: Record<
  string,
  BadgeDef
> = Object.fromEntries(
  BADGES.map((badge) => [
    badge.id,
    badge,
  ]),
);

export const BADGE_CATEGORIES: string[] = [
  ...new Set(
    BADGES.map(
      (badge) => badge.category,
    ),
  ),
];