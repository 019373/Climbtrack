import type {
  RouteGrade,
} from "@/context/ClimbTrackContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type BadgeLevel =
  | "bronze"
  | "silver"
  | "gold"

  /*
   * Conservé uniquement pour la compatibilité
   * avec d'anciennes sauvegardes.
   *
   * Aucun badge actuel ne génère de niveau Platine.
   */
  | "platinum"

  | "diamond";

export type BadgeKind =
  | "standard"
  | "climbing-color"
  | "kilter"
  | "route";

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

export type BadgeMetric =
  | "first"
  | "weight"
  | "duration"
  | "reps"
  | "sets"
  | "sets-reps"
  | "assistance"
  | "progression"
  | "records"
  | "left-right"
  | "climbing-color"
  | "kilter-grade"
  | "kilter-angle"
  | "route-grade"
  | "dips-reps";

export type BadgeLevelDefinition = {
  level: BadgeLevel;

  threshold: number;

  description: string;

  /**
   * Cotation Kilter précise.
   */
  grade?: number;

  /**
   * Angle précis.
   */
  angle?: number;

  /**
   * Cotation précise de voie.
   */
  routeGrade?: RouteGrade;

  /**
   * Mode nécessaire pour le badge de voie.
   */
  routeMode?:
    | "moulinette"
    | "tete";

  /**
   * Assistance éventuellement exigée.
   *
   * Exemple :
   * les badges 20 mm doivent être réalisés
   * sans assistance.
   */
  requiredAssistance?: string;

  /**
   * Nombre minimum de séries nécessaire.
   */
  minimumSets?: number;
};

export type BadgeDefinition = {
  id: string;

  name: string;

  subtitle: string;

  category: string;

  icon: string;

  kind: BadgeKind;

  metric: BadgeMetric;

  exerciseId?: string;

  unit?: string;

  climbingColor?: ClimbingColor;

  visualColor?: string;

  /**
   * Angle spécifique à tout le badge.
   *
   * Utile pour les trois badges 35 / 38 / 43°.
   */
  targetAngle?: number;

  levels: BadgeLevelDefinition[];

  /**
   * Ne pas afficher Bronze / Argent / Or / Diamant
   * sous les badges à objectif unique.
   */
  hideLevelLabel?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Niveaux
// ─────────────────────────────────────────────────────────────────────────────

/*
 * Ordre ACTUEL.
 *
 * Platine n'en fait plus partie.
 */
export const BADGE_LEVEL_ORDER: BadgeLevel[] = [
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
  }
> = {
  bronze: {
    label:
      "Bronze",

    border:
      "#CD7F32",

    glow:
      "#CD7F32",
  },

  silver: {
    label:
      "Argent",

    border:
      "#C7CCD3",

    glow:
      "#C7CCD3",
  },

  gold: {
    label:
      "Or",

    border:
      "#FFD700",

    glow:
      "#FFD700",
  },

  /*
   * Compatibilité uniquement.
   *
   * Ne fait plus partie de BADGE_LEVEL_ORDER
   * et n'est utilisé par aucun badge actuel.
   */
  platinum: {
    label:
      "Platine",

    border:
      "#D9F3F5",

    glow:
      "#A7F3F7",
  },

  diamond: {
    label:
      "Diamant",

    border:
      "#67E8F9",

    glow:
      "#67E8F9",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper quatre niveaux
// ─────────────────────────────────────────────────────────────────────────────

const STANDARD_LEVELS = (
  values: [
    number,
    number,
    number,
    number,
  ],

  descriptions: [
    string,
    string,
    string,
    string,
  ],
): BadgeLevelDefinition[] => [
  {
    level:
      "bronze",

    threshold:
      values[0],

    description:
      descriptions[0],
  },

  {
    level:
      "silver",

    threshold:
      values[1],

    description:
      descriptions[1],
  },

  {
    level:
      "gold",

    threshold:
      values[2],

    description:
      descriptions[2],
  },

  {
    level:
      "diamond",

    threshold:
      values[3],

    description:
      descriptions[3],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Couleurs de blocs
// ─────────────────────────────────────────────────────────────────────────────

const CLIMBING_COLOR_META: Record<
  ClimbingColor,
  {
    label: string;
    color: string;
  }
> = {
  rose: {
    label:
      "Rose",

    color:
      "#EC4899",
  },

  jaune: {
    label:
      "Jaune",

    color:
      "#FACC15",
  },

  vert: {
    label:
      "Vert",

    color:
      "#22C55E",
  },

  turquoise: {
    label:
      "Turquoise",

    color:
      "#2DD4BF",
  },

  bleu: {
    label:
      "Bleu",

    color:
      "#3B82F6",
  },

  orange: {
    label:
      "Orange",

    color:
      "#F97316",
  },

  rouge: {
    label:
      "Rouge",

    color:
      "#EF4444",
  },

  noir: {
    label:
      "Noir",

    color:
      "#171717",
  },

  blanc: {
    label:
      "Blanc",

    color:
      "#F5F5F5",
  },
};

const CLIMBING_COLOR_BADGES: BadgeDefinition[] =
  (
    Object.keys(
      CLIMBING_COLOR_META,
    ) as ClimbingColor[]
  ).map(
    (
      color,
    ) => {
      const metadata =
        CLIMBING_COLOR_META[
          color
        ];

      return {
        id:
          `bloc-${color}`,

        name:
          `Bloc ${metadata.label}`,

        subtitle:
          `Réussir au moins un bloc ${metadata.label.toLowerCase()}`,

        category:
          "Couleurs de blocs",

        icon:
          "hold",

        kind:
          "climbing-color",

        metric:
          "climbing-color",

        climbingColor:
          color,

        visualColor:
          metadata.color,

        hideLevelLabel:
          true,

        levels: [
          {
            level:
              "gold",

            threshold:
              1,

            description:
              `Réussir au moins un bloc ${metadata.label.toLowerCase()}.`,
          },
        ],
      };
    },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Kilterboard
// ─────────────────────────────────────────────────────────────────────────────

/*
 * Même fonctionnement que dans la version de base :
 *
 * chaque cotation V0 → V17 possède son propre badge.
 *
 * Bronze  : 30°
 * Argent  : 35°
 * Or      : 40°
 * Diamant : 45°
 */
const KILTER_BADGES: BadgeDefinition[] =
  Array.from(
    {
      length:
        18,
    },

    (
      _,
      grade,
    ) => ({
      id:
        `kilter-v${grade}`,

      name:
        `Kilter V${grade}`,

      subtitle:
        `Réussir V${grade} à différentes inclinaisons`,

      category:
        "Kilterboard",

      icon:
        "kilter",

      kind:
        "kilter" as const,

      metric:
        "kilter-angle" as const,

      unit:
        "°",

      levels: [
        {
          level:
            "bronze" as const,

          threshold:
            30,

          grade,

          angle:
            30,

          description:
            `Réussir exactement un bloc V${grade} à 30°.`,
        },

        {
          level:
            "silver" as const,

          threshold:
            35,

          grade,

          angle:
            35,

          description:
            `Réussir exactement un bloc V${grade} à 35°.`,
        },

        {
          level:
            "gold" as const,

          threshold:
            40,

          grade,

          angle:
            40,

          description:
            `Réussir exactement un bloc V${grade} à 40°.`,
        },

        {
          level:
            "diamond" as const,

          threshold:
            45,

          grade,

          angle:
            45,

          description:
            `Réussir exactement un bloc V${grade} à 45°.`,
        },
      ],
    }),
  );

// ─────────────────────────────────────────────────────────────────────────────
// Voies
// ─────────────────────────────────────────────────────────────────────────────

const ROUTE_GRADES: RouteGrade[] = [
  "3a",
  "3a+",
  "3b",
  "3b+",
  "3c",
  "3c+",

  "4a",
  "4a+",
  "4b",
  "4b+",
  "4c",
  "4c+",

  "5a",
  "5a+",
  "5b",
  "5b+",
  "5c",
  "5c+",

  "6a",
  "6a+",
  "6b",
  "6b+",
  "6c",
  "6c+",

  "7a",
  "7a+",
  "7b",
  "7b+",
  "7c",
  "7c+",

  "8a",
  "8a+",
  "8b",
  "8b+",
  "8c",
  "8c+",

  "9a",
  "9a+",
  "9b",
  "9b+",
  "9c",
];

const ROUTE_BADGES: BadgeDefinition[] =
  ROUTE_GRADES.map(
    (
      grade,
    ) => ({
      id:
        `voie-${grade}`,

      name:
        `Voie ${grade}`,

      subtitle:
        `Réussir précisément une voie ${grade}`,

      category:
        "Escalade en voie",

      icon:
        "route-wall",

      kind:
        "route",

      metric:
        "route-grade",

      levels: [
        {
          level:
            "gold",

          threshold:
            1,

          routeGrade:
            grade,

          routeMode:
            "moulinette",

          description:
            `Réussir exactement une voie ${grade} en moulinette ou en tête.`,
        },

        {
          level:
            "diamond",

          threshold:
            1,

          routeGrade:
            grade,

          routeMode:
            "tete",

          description:
            `Réussir exactement une voie ${grade} en tête.`,
        },
      ],
    }),
  );

// ─────────────────────────────────────────────────────────────────────────────
// Badges
// ─────────────────────────────────────────────────────────────────────────────

export const BADGES: BadgeDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE DOIGTS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id:
      "suspension-20mm",

    name:
      "Suspension 20 mm",

    subtitle:
      "Suspension sans assistance",

    category:
      "Force doigts",

    icon:
      "fingerboard-20",

    kind:
      "standard",

    metric:
      "duration",

    exerciseId:
      "suspension-20mm",

    unit:
      "s",

    levels: [
      {
        level:
          "bronze",

        threshold:
          15,

        requiredAssistance:
          "Sans assistance",

        description:
          "Tenir 15 secondes sans assistance.",
      },

      {
        level:
          "silver",

        threshold:
          25,

        requiredAssistance:
          "Sans assistance",

        description:
          "Tenir 25 secondes sans assistance.",
      },

      {
        level:
          "gold",

        threshold:
          35,

        requiredAssistance:
          "Sans assistance",

        description:
          "Tenir 35 secondes sans assistance.",
      },

      {
        level:
          "diamond",

        threshold:
          50,

        requiredAssistance:
          "Sans assistance",

        description:
          "Tenir 50 secondes sans assistance.",
      },
    ],
  },

  {
    id:
      "suspension-25mm",

    name:
      "Suspension 25 mm",

    subtitle:
      "Suspension bras tendus sur une prise de 25 mm",

    category:
      "Force doigts",

    icon:
      "fingerboard-25",

    kind:
      "standard",

    metric:
      "duration",

    exerciseId:
      "dead-hang",

    unit:
      "s",

    levels:
      STANDARD_LEVELS(
        [
          30,
          45,
          60,
          90,
        ],

        [
          "Tenir 30 secondes.",
          "Tenir 45 secondes.",
          "Tenir 60 secondes.",
          "Tenir 90 secondes.",
        ],
      ),
  },

  /*
   * Le nouvel exercice utilise 35 / 38 / 43°.
   *
   * On sépare les trois angles pour ne jamais
   * comparer une durée facile à une durée plus difficile.
   *
   * Les seuils sont volontairement plus exigeants
   * que les premières valeurs utilisées précédemment.
   */

  {
    id:
      "sloper-35",

    name:
      "Sloper 35°",

    subtitle:
      "Maîtriser le plat à 35°",

    category:
      "Force doigts",

    icon:
      "sloper",

    kind:
      "standard",

    metric:
      "duration",

    exerciseId:
      "suspension-slopers",

    targetAngle:
      35,

    unit:
      "s",

    levels:
      STANDARD_LEVELS(
        [
          15,
          25,
          35,
          50,
        ],

        [
          "Tenir 15 secondes sur le sloper 35°.",
          "Tenir 25 secondes sur le sloper 35°.",
          "Tenir 35 secondes sur le sloper 35°.",
          "Tenir 50 secondes sur le sloper 35°.",
        ],
      ),
  },

  {
    id:
      "sloper-38",

    name:
      "Sloper 38°",

    subtitle:
      "Maîtriser le plat à 38°",

    category:
      "Force doigts",

    icon:
      "sloper",

    kind:
      "standard",

    metric:
      "duration",

    exerciseId:
      "suspension-slopers",

    targetAngle:
      38,

    unit:
      "s",

    levels:
      STANDARD_LEVELS(
        [
          12,
          20,
          30,
          40,
        ],

        [
          "Tenir 12 secondes sur le sloper 38°.",
          "Tenir 20 secondes sur le sloper 38°.",
          "Tenir 30 secondes sur le sloper 38°.",
          "Tenir 40 secondes sur le sloper 38°.",
        ],
      ),
  },

  {
    id:
      "sloper-43",

    name:
      "Sloper 43°",

    subtitle:
      "Maîtriser le plat à 43°",

    category:
      "Force doigts",

    icon:
      "sloper",

    kind:
      "standard",

    metric:
      "duration",

    exerciseId:
      "suspension-slopers",

    targetAngle:
      43,

    unit:
      "s",

    levels:
      STANDARD_LEVELS(
        [
          8,
          15,
          25,
          35,
        ],

        [
          "Tenir 8 secondes sur le sloper 43°.",
          "Tenir 15 secondes sur le sloper 43°.",
          "Tenir 25 secondes sur le sloper 43°.",
          "Tenir 35 secondes sur le sloper 43°.",
        ],
      ),
  },

  {
    id:
      "pince-disque",

    name:
      "Pince disque",

    subtitle:
      "Maintenir un disque en pince",

    category:
      "Force doigts",

    icon:
      "pinch",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "pince-disque",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          25,
          30,
          40,
          50,
        ],

        [
          "Maintenir 25 kg.",
          "Maintenir 30 kg.",
          "Maintenir 40 kg.",
          "Maintenir 50 kg.",
        ],
      ),
  },

  {
    id:
      "repeaters-7-3",

    name:
      "Repeaters",

    subtitle:
      "Compléter davantage de séries",

    category:
      "Force doigts",

    icon:
      "repeaters",

    kind:
      "standard",

    metric:
      "sets",

    exerciseId:
      "repeaters-7-3",

    unit:
      "séries",

    levels:
      STANDARD_LEVELS(
        [
          3,
          5,
          7,
          10,
        ],

        [
          "Compléter 3 séries.",
          "Compléter 5 séries.",
          "Compléter 7 séries.",
          "Compléter 10 séries.",
        ],
      ),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRACTIONS / PUISSANCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id:
      "lourd-leger",

    name:
      "Lourd-léger",

    subtitle:
      "Tractions lourdes puis explosives",

    category:
      "Tractions",

    icon:
      "pullup",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "lourd-leger",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          20,
          30,
          40,
          50,
        ],

        [
          "Réaliser le lourd-léger avec +20 kg de lest.",
          "Réaliser le lourd-léger avec +30 kg de lest.",
          "Réaliser le lourd-léger avec +40 kg de lest.",
          "Réaliser le lourd-léger avec +50 kg de lest.",
        ],
      ),
  },

  {
    id:
      "sauts-prise",

    name:
      "Sauts pour prise",

    subtitle:
      "Monter de prise en prise avec chaque main",

    category:
      "Tractions",

    icon:
      "jump",

    kind:
      "standard",

    metric:
      "left-right",

    exerciseId:
      "sauts-prise",

    unit:
      "prises",

    levels:
      STANDARD_LEVELS(
        [
          4,
          5,
          6,
          7,
        ],

        [
          "Sauter 4 prises avec chaque main.",
          "Sauter 5 prises avec chaque main.",
          "Sauter 6 prises avec chaque main.",
          "Sauter 7 prises avec chaque main.",
        ],
      ),
  },

  {
    id:
      "tractions-lestees",

    name:
      "Tractions lestées",

    subtitle:
      "Augmenter la charge ajoutée",

    category:
      "Tractions",

    icon:
      "pullup",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "tractions-lestees",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          12.5,
          20,
          30,
          40,
        ],

        [
          "Réaliser les séries avec +12,5 kg.",
          "Réaliser les séries avec +20 kg.",
          "Réaliser les séries avec +30 kg.",
          "Réaliser les séries avec +40 kg.",
        ],
      ),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSCULATION
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id:
      "developpe-militaire",

    name:
      "Développé militaire",

    subtitle:
      "Augmenter la charge",

    category:
      "Musculation",

    icon:
      "barbell",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "developpe-militaire",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          30,
          40,
          50,
          60,
        ],

        [
          "Réaliser les séries à 30 kg.",
          "Réaliser les séries à 40 kg.",
          "Réaliser les séries à 50 kg.",
          "Réaliser les séries à 60 kg.",
        ],
      ),
  },

  {
    id:
      "rowing-haltere",

    name:
      "Rowing haltère",

    subtitle:
      "Augmenter la charge",

    category:
      "Musculation",

    icon:
      "barbell",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "rowing-haltere",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          20,
          25,
          32.5,
          40,
        ],

        [
          "Réaliser les séries à 20 kg.",
          "Réaliser les séries à 25 kg.",
          "Réaliser les séries à 32,5 kg.",
          "Réaliser les séries à 40 kg.",
        ],
      ),
  },

  {
    id:
      "facepull",

    name:
      "Face Pull",

    subtitle:
      "Augmenter la charge",

    category:
      "Musculation",

    icon:
      "barbell",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "facepull",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          40,
          50,
          60,
          70,
        ],

        [
          "Réaliser les séries à 40 kg.",
          "Réaliser les séries à 50 kg.",
          "Réaliser les séries à 60 kg.",
          "Réaliser les séries à 70 kg.",
        ],
      ),
  },

  /*
   * Nouvel objectif conservé pour le développé couché.
   *
   * Le réglage de base étant déjà 30 kg,
   * le premier badge ne se débloque pas automatiquement.
   */
  {
    id:
      "developpe-couche",

    name:
      "Développé couché",

    subtitle:
      "Augmenter la charge totale",

    category:
      "Musculation",

    icon:
      "barbell",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "developpe-couche",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          40,
          50,
          60,
          75,
        ],

        [
          "Réaliser les séries à 40 kg.",
          "Réaliser les séries à 50 kg.",
          "Réaliser les séries à 60 kg.",
          "Réaliser les séries à 75 kg.",
        ],
      ),
  },

  {
    id:
      "dips",

    name:
      "Dips",

    subtitle:
      "Réaliser au moins trois séries",

    category:
      "Musculation",

    icon:
      "dips",

    kind:
      "standard",

    metric:
      "dips-reps",

    exerciseId:
      "dips",

    unit:
      "reps",

    levels: [
      {
        level:
          "bronze",

        threshold:
          8,

        minimumSets:
          3,

        description:
          "Réussir au moins 3 séries de 8 dips.",
      },

      {
        level:
          "silver",

        threshold:
          12,

        minimumSets:
          3,

        description:
          "Réussir au moins 3 séries de 12 dips.",
      },

      {
        level:
          "gold",

        threshold:
          16,

        minimumSets:
          3,

        description:
          "Réussir au moins 3 séries de 16 dips.",
      },

      {
        level:
          "diamond",

        threshold:
          20,

        minimumSets:
          3,

        description:
          "Réussir au moins 3 séries de 20 dips.",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GAINAGE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id:
      "planche",

    name:
      "Planche",

    subtitle:
      "Gainage sur les avant-bras",

    category:
      "Gainage",

    icon:
      "chart",

    kind:
      "standard",

    metric:
      "duration",

    exerciseId:
      "planche",

    unit:
      "s",

    levels:
      STANDARD_LEVELS(
        [
          90,
          150,
          240,
          360,
        ],

        [
          "Tenir 1 minute 30.",
          "Tenir 2 minutes 30.",
          "Tenir 4 minutes.",
          "Tenir 6 minutes.",
        ],
      ),
  },

  {
    id:
      "planche-laterale",

    name:
      "Planche latérale",

    subtitle:
      "Gainage latéral des obliques",

    category:
      "Gainage",

    icon:
      "chart",

    kind:
      "standard",

    metric:
      "duration",

    exerciseId:
      "planche-laterale",

    unit:
      "s",

    levels:
      STANDARD_LEVELS(
        [
          75,
          120,
          180,
          240,
        ],

        [
          "Tenir 1 minute 15.",
          "Tenir 2 minutes.",
          "Tenir 3 minutes.",
          "Tenir 4 minutes.",
        ],
      ),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JAMBES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id:
      "squat",

    name:
      "Squat",

    subtitle:
      "Squats au poids du corps",

    category:
      "Jambes",

    icon:
      "lunge",

    kind:
      "standard",

    metric:
      "sets-reps",

    exerciseId:
      "squat",

    unit:
      "reps/série",

    levels: [
      {
        level:
          "bronze",

        threshold:
          15,

        minimumSets:
          3,

        description:
          "Réaliser 3 séries de 15 répétitions.",
      },

      {
        level:
          "silver",

        threshold:
          30,

        minimumSets:
          3,

        description:
          "Réaliser 3 séries de 30 répétitions.",
      },

      {
        level:
          "gold",

        threshold:
          50,

        minimumSets:
          3,

        description:
          "Réaliser 3 séries de 50 répétitions.",
      },

      {
        level:
          "diamond",

        threshold:
          65,

        minimumSets:
          3,

        description:
          "Réaliser 3 séries de 65 répétitions.",
      },
    ],
  },

  {
    id:
      "fentes-bulgares",

    name:
      "Fentes bulgares",

    subtitle:
      "Augmenter la charge totale",

    category:
      "Jambes",

    icon:
      "lunge",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "fentes-bulgares",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          18,
          24,
          30,
          36,
        ],

        [
          "Réaliser les séries avec 18 kg au total.",
          "Réaliser les séries avec 24 kg au total.",
          "Réaliser les séries avec 30 kg au total.",
          "Réaliser les séries avec 36 kg au total.",
        ],
      ),
  },

  {
    id:
      "mollets",

    name:
      "Élévations mollets",

    subtitle:
      "Extension sur la pointe des pieds",

    category:
      "Jambes",

    icon:
      "calf",

    kind:
      "standard",

    metric:
      "weight",

    exerciseId:
      "mollets-debout",

    unit:
      "kg",

    levels:
      STANDARD_LEVELS(
        [
          15,
          25,
          35,
          50,
        ],

        [
          "Réaliser les séries avec 15 kg.",
          "Réaliser les séries avec 25 kg.",
          "Réaliser les séries avec 35 kg.",
          "Réaliser les séries avec 50 kg.",
        ],
      ),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROGRESSION GLOBALE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id:
      "progression-records",

    name:
      "Progression",

    subtitle:
      "Records personnels battus",

    category:
      "Progression",

    icon:
      "chart",

    kind:
      "standard",

    metric:
      "records",

    unit:
      "PR",

    levels:
      STANDARD_LEVELS(
        [
          10,
          25,
          50,
          100,
        ],

        [
          "Battre 10 records personnels.",
          "Battre 25 records personnels.",
          "Battre 50 records personnels.",
          "Battre 100 records personnels.",
        ],
      ),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ESCALADE
  // ═══════════════════════════════════════════════════════════════════════════

  ...CLIMBING_COLOR_BADGES,

  ...KILTER_BADGES,

  ...ROUTE_BADGES,
];

// ─────────────────────────────────────────────────────────────────────────────
// Catégories
// ─────────────────────────────────────────────────────────────────────────────

export const BADGE_CATEGORIES = [
  "Force doigts",
  "Tractions",
  "Musculation",
  "Gainage",
  "Jambes",
  "Progression",
  "Couleurs de blocs",
  "Kilterboard",
  "Escalade en voie",
];

// ─────────────────────────────────────────────────────────────────────────────
// Accès rapide par ID
// ─────────────────────────────────────────────────────────────────────────────

export const BADGE_BY_ID: Record<
  string,
  BadgeDefinition
> = Object.fromEntries(
  BADGES.map(
    (
      badge,
    ) => [
      badge.id,
      badge,
    ],
  ),
);