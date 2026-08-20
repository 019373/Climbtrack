import type {
  ExerciseDefaults,
  ResistanceBandColor,
} from "../context/ClimbTrackContext";

// ─────────────────────────────────────────────────────────────────────────────
// Suivi des exercices
// ─────────────────────────────────────────────────────────────────────────────

export type TrackingType =
  | "duration+assistance"
  | "reps"
  | "weight"
  | "weight+duration"
  | "assistance"
  | "weight+reps"
  | "duration"
  | "none"
  | "dual-reps+dual-weight"
  | "dual-reps+weight"
  | "duration+band"
  | "reps+duration"
  | "weight+reps+duration"
  | "variant+weight+duration"
  | "variant+reps";

// ─────────────────────────────────────────────────────────────────────────────
// Muscles
// ─────────────────────────────────────────────────────────────────────────────

export type MuscleIntensity =
  | "low"
  | "medium"
  | "high";

export type RecoveryMuscleGroup =
  | "doigts"
  | "avant-bras"
  | "biceps"
  | "triceps"
  | "epaules"
  | "pectoraux"
  | "dorsaux"
  | "lombaires"
  | "abdominaux"
  | "obliques"
  | "fessiers"
  | "quadriceps"
  | "ischios"
  | "adducteurs"
  | "mollets"
  | "tibial"
  | "hanches"
  | "pieds";

export type MuscleRegion =
  | "main"
  | "avant-bras"
  | "bras"
  | "epaule"
  | "poitrine"
  | "dos"
  | "tronc"
  | "hanche"
  | "cuisse"
  | "jambe"
  | "pied";

export type MuscleId =
  | "flechisseurs-doigts"
  | "extenseurs-doigts"
  | "thenar"
  | "hypothenar"
  | "interosseux-main"
  | "lumbricaux-main"

  | "flechisseurs-poignet"
  | "extenseurs-poignet"
  | "brachioradial"
  | "pronateur-rond"
  | "pronateur-carre"
  | "supinateur"

  | "biceps-brachial"
  | "brachial"
  | "coraco-brachial"
  | "triceps-brachial"

  | "deltoide-anterieur"
  | "deltoide-lateral"
  | "deltoide-posterieur"
  | "supra-epineux"
  | "infra-epineux"
  | "petit-rond"
  | "sous-scapulaire"

  | "grand-pectoral-claviculaire"
  | "grand-pectoral-sternal"
  | "petit-pectoral"
  | "dentelé-anterieur"

  | "grand-dorsal"
  | "grand-rond"
  | "trapeze-superieur"
  | "trapeze-moyen"
  | "trapeze-inferieur"
  | "rhomboide-majeur"
  | "rhomboide-mineur"

  | "erecteurs-rachis"
  | "multifides"
  | "carre-lombes"
  | "droit-abdomen"
  | "oblique-externe"
  | "oblique-interne"
  | "transverse-abdomen"

  | "grand-fessier"
  | "moyen-fessier"
  | "petit-fessier"
  | "ilio-psoas"
  | "tenseur-fascia-lata"
  | "sartorius"

  | "pectine"
  | "long-adducteur"
  | "court-adducteur"
  | "grand-adducteur"
  | "gracile"

  | "droit-femoral"
  | "vaste-lateral"
  | "vaste-medial"
  | "vaste-intermediaire"

  | "biceps-femoral"
  | "semi-tendineux"
  | "semi-membraneux"

  | "gastrocnemien"
  | "soleaire"
  | "tibial-anterieur"
  | "tibial-posterieur"
  | "fibulaires"

  | "intrinseques-pied";

export interface MuscleDefinition {
  id: MuscleId;
  label: string;
  region: MuscleRegion;
  recoveryGroup: RecoveryMuscleGroup;
}

export interface ExerciseMuscleLoad {
  muscleId: MuscleId;
  intensity: MuscleIntensity;
}

export const MUSCLE_CATALOG: MuscleDefinition[] = [
  {
    id: "flechisseurs-doigts",
    label: "Fléchisseurs des doigts",
    region: "main",
    recoveryGroup: "doigts",
  },
  {
    id: "extenseurs-doigts",
    label: "Extenseurs des doigts",
    region: "main",
    recoveryGroup: "doigts",
  },
  {
    id: "thenar",
    label: "Éminence thénar",
    region: "main",
    recoveryGroup: "doigts",
  },
  {
    id: "hypothenar",
    label: "Éminence hypothénar",
    region: "main",
    recoveryGroup: "doigts",
  },
  {
    id: "interosseux-main",
    label: "Interosseux de la main",
    region: "main",
    recoveryGroup: "doigts",
  },
  {
    id: "lumbricaux-main",
    label: "Lombricaux de la main",
    region: "main",
    recoveryGroup: "doigts",
  },

  {
    id: "flechisseurs-poignet",
    label: "Fléchisseurs du poignet",
    region: "avant-bras",
    recoveryGroup: "avant-bras",
  },
  {
    id: "extenseurs-poignet",
    label: "Extenseurs du poignet",
    region: "avant-bras",
    recoveryGroup: "avant-bras",
  },
  {
    id: "brachioradial",
    label: "Brachio-radial",
    region: "avant-bras",
    recoveryGroup: "avant-bras",
  },
  {
    id: "pronateur-rond",
    label: "Pronateur rond",
    region: "avant-bras",
    recoveryGroup: "avant-bras",
  },
  {
    id: "pronateur-carre",
    label: "Pronateur carré",
    region: "avant-bras",
    recoveryGroup: "avant-bras",
  },
  {
    id: "supinateur",
    label: "Supinateur",
    region: "avant-bras",
    recoveryGroup: "avant-bras",
  },

  {
    id: "biceps-brachial",
    label: "Biceps brachial",
    region: "bras",
    recoveryGroup: "biceps",
  },
  {
    id: "brachial",
    label: "Brachial",
    region: "bras",
    recoveryGroup: "biceps",
  },
  {
    id: "coraco-brachial",
    label: "Coraco-brachial",
    region: "bras",
    recoveryGroup: "biceps",
  },
  {
    id: "triceps-brachial",
    label: "Triceps brachial",
    region: "bras",
    recoveryGroup: "triceps",
  },

  {
    id: "deltoide-anterieur",
    label: "Deltoïde antérieur",
    region: "epaule",
    recoveryGroup: "epaules",
  },
  {
    id: "deltoide-lateral",
    label: "Deltoïde latéral",
    region: "epaule",
    recoveryGroup: "epaules",
  },
  {
    id: "deltoide-posterieur",
    label: "Deltoïde postérieur",
    region: "epaule",
    recoveryGroup: "epaules",
  },
  {
    id: "supra-epineux",
    label: "Supra-épineux",
    region: "epaule",
    recoveryGroup: "epaules",
  },
  {
    id: "infra-epineux",
    label: "Infra-épineux",
    region: "epaule",
    recoveryGroup: "epaules",
  },
  {
    id: "petit-rond",
    label: "Petit rond",
    region: "epaule",
    recoveryGroup: "epaules",
  },
  {
    id: "sous-scapulaire",
    label: "Sous-scapulaire",
    region: "epaule",
    recoveryGroup: "epaules",
  },

  {
    id: "grand-pectoral-claviculaire",
    label: "Grand pectoral — portion claviculaire",
    region: "poitrine",
    recoveryGroup: "pectoraux",
  },
  {
    id: "grand-pectoral-sternal",
    label: "Grand pectoral — portion sternale",
    region: "poitrine",
    recoveryGroup: "pectoraux",
  },
  {
    id: "petit-pectoral",
    label: "Petit pectoral",
    region: "poitrine",
    recoveryGroup: "pectoraux",
  },
  {
    id: "dentelé-anterieur",
    label: "Dentelé antérieur",
    region: "poitrine",
    recoveryGroup: "pectoraux",
  },

  {
    id: "grand-dorsal",
    label: "Grand dorsal",
    region: "dos",
    recoveryGroup: "dorsaux",
  },
  {
    id: "grand-rond",
    label: "Grand rond",
    region: "dos",
    recoveryGroup: "dorsaux",
  },
  {
    id: "trapeze-superieur",
    label: "Trapèze supérieur",
    region: "dos",
    recoveryGroup: "dorsaux",
  },
  {
    id: "trapeze-moyen",
    label: "Trapèze moyen",
    region: "dos",
    recoveryGroup: "dorsaux",
  },
  {
    id: "trapeze-inferieur",
    label: "Trapèze inférieur",
    region: "dos",
    recoveryGroup: "dorsaux",
  },
  {
    id: "rhomboide-majeur",
    label: "Rhomboïde majeur",
    region: "dos",
    recoveryGroup: "dorsaux",
  },
  {
    id: "rhomboide-mineur",
    label: "Rhomboïde mineur",
    region: "dos",
    recoveryGroup: "dorsaux",
  },

  {
    id: "erecteurs-rachis",
    label: "Érecteurs du rachis",
    region: "tronc",
    recoveryGroup: "lombaires",
  },
  {
    id: "multifides",
    label: "Multifides",
    region: "tronc",
    recoveryGroup: "lombaires",
  },
  {
    id: "carre-lombes",
    label: "Carré des lombes",
    region: "tronc",
    recoveryGroup: "lombaires",
  },
  {
    id: "droit-abdomen",
    label: "Droit de l’abdomen",
    region: "tronc",
    recoveryGroup: "abdominaux",
  },
  {
    id: "oblique-externe",
    label: "Oblique externe",
    region: "tronc",
    recoveryGroup: "obliques",
  },
  {
    id: "oblique-interne",
    label: "Oblique interne",
    region: "tronc",
    recoveryGroup: "obliques",
  },
  {
    id: "transverse-abdomen",
    label: "Transverse de l’abdomen",
    region: "tronc",
    recoveryGroup: "abdominaux",
  },

  {
    id: "grand-fessier",
    label: "Grand fessier",
    region: "hanche",
    recoveryGroup: "fessiers",
  },
  {
    id: "moyen-fessier",
    label: "Moyen fessier",
    region: "hanche",
    recoveryGroup: "fessiers",
  },
  {
    id: "petit-fessier",
    label: "Petit fessier",
    region: "hanche",
    recoveryGroup: "fessiers",
  },
  {
    id: "ilio-psoas",
    label: "Ilio-psoas",
    region: "hanche",
    recoveryGroup: "hanches",
  },
  {
    id: "tenseur-fascia-lata",
    label: "Tenseur du fascia lata",
    region: "hanche",
    recoveryGroup: "hanches",
  },
  {
    id: "sartorius",
    label: "Sartorius",
    region: "cuisse",
    recoveryGroup: "hanches",
  },

  {
    id: "pectine",
    label: "Pectiné",
    region: "cuisse",
    recoveryGroup: "adducteurs",
  },
  {
    id: "long-adducteur",
    label: "Long adducteur",
    region: "cuisse",
    recoveryGroup: "adducteurs",
  },
  {
    id: "court-adducteur",
    label: "Court adducteur",
    region: "cuisse",
    recoveryGroup: "adducteurs",
  },
  {
    id: "grand-adducteur",
    label: "Grand adducteur",
    region: "cuisse",
    recoveryGroup: "adducteurs",
  },
  {
    id: "gracile",
    label: "Gracile",
    region: "cuisse",
    recoveryGroup: "adducteurs",
  },

  {
    id: "droit-femoral",
    label: "Droit fémoral",
    region: "cuisse",
    recoveryGroup: "quadriceps",
  },
  {
    id: "vaste-lateral",
    label: "Vaste latéral",
    region: "cuisse",
    recoveryGroup: "quadriceps",
  },
  {
    id: "vaste-medial",
    label: "Vaste médial",
    region: "cuisse",
    recoveryGroup: "quadriceps",
  },
  {
    id: "vaste-intermediaire",
    label: "Vaste intermédiaire",
    region: "cuisse",
    recoveryGroup: "quadriceps",
  },

  {
    id: "biceps-femoral",
    label: "Biceps fémoral",
    region: "cuisse",
    recoveryGroup: "ischios",
  },
  {
    id: "semi-tendineux",
    label: "Semi-tendineux",
    region: "cuisse",
    recoveryGroup: "ischios",
  },
  {
    id: "semi-membraneux",
    label: "Semi-membraneux",
    region: "cuisse",
    recoveryGroup: "ischios",
  },

  {
    id: "gastrocnemien",
    label: "Gastrocnémien",
    region: "jambe",
    recoveryGroup: "mollets",
  },
  {
    id: "soleaire",
    label: "Soléaire",
    region: "jambe",
    recoveryGroup: "mollets",
  },
  {
    id: "tibial-anterieur",
    label: "Tibial antérieur",
    region: "jambe",
    recoveryGroup: "tibial",
  },
  {
    id: "tibial-posterieur",
    label: "Tibial postérieur",
    region: "jambe",
    recoveryGroup: "mollets",
  },
  {
    id: "fibulaires",
    label: "Fibulaires",
    region: "jambe",
    recoveryGroup: "mollets",
  },

  {
    id: "intrinseques-pied",
    label: "Muscles intrinsèques du pied",
    region: "pied",
    recoveryGroup: "pieds",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Exercices / séances
// ─────────────────────────────────────────────────────────────────────────────

export interface ExerciseDef {
  id: string;
  name: string;
  description: string;
  category: string;
  tracking: TrackingType;
  defaultValues: ExerciseDefaults;

  assistanceOptions?: string[];
  isHangboard?: boolean;
  variantOptions?: string[];
  bandOptions?: ResistanceBandColor[];
  totalWeight?: boolean;
  perSide?: boolean;

  primaryRepsLabel?: string;
  secondaryRepsLabel?: string;
  primaryWeightLabel?: string;
  secondaryWeightLabel?: string;

  sessionIds?: string[];

  muscleLoads?: ExerciseMuscleLoad[];
}

export interface SessionDef {
  id: string;
  name: string;
  moment: string;
  exercises: ExerciseDef[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────

export const ASSISTANCE_OPTIONS = [
  "Deux pieds au sol, appui fort",
  "Deux pieds au sol, appui moyen",
  "Deux pieds au sol, appui léger",
  "Un pied au sol",
  "Pointes des pieds",
  "Sans assistance",
  "Lesté",
];

export const RESISTANCE_BAND_OPTIONS: {
  id: ResistanceBandColor;
  label: string;
  indication: string;
}[] = [
  {
    id: "jaune",
    label: "Jaune",
    indication: "Très léger — 0 à 5 kg",
  },
  {
    id: "rouge",
    label: "Rouge",
    indication: "Très léger — 5 à 15 kg",
  },
  {
    id: "noir",
    label: "Noir",
    indication: "Léger — 15 à 25 kg",
  },
  {
    id: "violet",
    label: "Violet",
    indication: "Moyen — 25 à 35 kg",
  },
  {
    id: "vert",
    label: "Vert",
    indication: "Fort — 35 à 55 kg",
  },
  {
    id: "bleu",
    label: "Bleu",
    indication: "Très fort — 55 à 80 kg",
  },
  {
    id: "orange",
    label: "Orange",
    indication: "Ultra-fort — 80 à 105 kg",
  },
];

export const SLOPER_ANGLES = [
  35,
  38,
  43,
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Séances
// ─────────────────────────────────────────────────────────────────────────────

export const SESSIONS: SessionDef[] = [
  // ── Force doigts ────────────────────────────────────────────────────────────

  {
    id: "s1-force-doigts",
    name: "Force doigts",
    moment: "Force maximale · doigts · puissance",
    exercises: [
      {
        id: "suspension-20mm",
        name: "Suspension 20 mm",
        description:
          "Suspension contrôlée sur réglette de 20 mm. Garder les épaules actives et arrêter en cas de douleur aux doigts.",
        category: "Doigts",
        tracking: "duration+assistance",
        isHangboard: true,
        defaultValues: {
          sets: 6,
          duration: 10,
          assistance: "Sans assistance",
          restSeconds: 180,
        },
      },

      {
        id: "suspension-slopers",
        name: "Suspension sur plats",
        description:
          "Suspensions sur plats avec inclinaison progressive.",
        category: "Doigts",
        tracking: "duration",
        isHangboard: true,
        defaultValues: {
          sets: 6,
          duration: 15,
          progressionValue: 35,
          restSeconds: 150,
        },
      },

      {
        id: "sauts-prise",
        name: "Sauts sur prise",
        description:
          "Mouvement dynamique explosif vers une prise cible. Noter séparément le meilleur résultat gauche et droite.",
        category: "Puissance",
        tracking: "reps",
        defaultValues: {
          sets: 5,
          reps: 3,
          restSeconds: 150,
        },
      },

      {
        id: "croise-dynamique-19-30",
        name: "Croisé dynamique 19 → 30",
        description:
          "Croisé dynamique vers une prise cible. Prioriser la qualité du mouvement et la précision.",
        category: "Puissance",
        tracking: "reps",
        defaultValues: {
          sets: 5,
          reps: 3,
          progressionValue: 5,
          restSeconds: 150,
        },
      },

      {
        id: "lourd-leger",
        name: "Lourd / léger",
        description:
          "Alterner une série lourde et une série plus légère en conservant une exécution explosive.",
        category: "Dos",
        tracking: "dual-reps+dual-weight",
        primaryRepsLabel: "Répétitions lourdes",
        secondaryRepsLabel: "Répétitions légères",
        primaryWeightLabel: "Charge lourde (kg)",
        secondaryWeightLabel: "Charge légère (kg)",
        defaultValues: {
          sets: 4,
          reps: 3,
          secondaryReps: 5,
          weight: 20,
          secondaryWeight: 10,
          restSeconds: 180,
        },
      },

      {
        id: "pince-disque",
        name: "Pince disque",
        description:
          "Tenir un disque en pince avec le pouce opposé aux doigts.",
        category: "Doigts",
        tracking: "weight+duration",
        perSide: true,
        defaultValues: {
          sets: 4,
          weight: 15,
          duration: 10,
          restSeconds: 120,
        },
      },

      {
        id: "pince-large",
        name: "Pince large",
        description:
          "Travail de pince large et de force du pouce.",
        category: "Doigts",
        tracking: "weight+duration",
        perSide: true,
        defaultValues: {
          sets: 4,
          weight: 10,
          duration: 10,
          restSeconds: 120,
        },
      },
    ],
  },

  // ── Résistance ──────────────────────────────────────────────────────────────

  {
    id: "s2-resistance",
    name: "Résistance",
    moment: "Endurance de force · continuité · avant-bras",
    exercises: [
      {
        id: "repeaters-7-3",
        name: "Repeaters 7/3",
        description:
          "7 secondes de suspension puis 3 secondes de repos à l’intérieur de chaque série.",
        category: "Résistance",
        tracking: "reps+duration",
        isHangboard: true,
        primaryRepsLabel: "Répétitions par série",
        defaultValues: {
          sets: 5,
          reps: 6,
          duration: 7,
          restSeconds: 180,
        },
      },

      {
        id: "blocs-devers",
        name: "Blocs en dévers",
        description:
          "Enchaîner plusieurs blocs en dévers avec repos limité pour développer l’endurance de force.",
        category: "Résistance",
        tracking: "reps",
        defaultValues: {
          sets: 4,
          reps: 3,
          restSeconds: 180,
        },
      },

      {
        id: "traversees-longues",
        name: "Traversées longues",
        description:
          "Traversée continue à intensité modérée en gardant une bonne technique.",
        category: "Résistance",
        tracking: "duration",
        defaultValues: {
          sets: 3,
          duration: 180,
          restSeconds: 180,
        },
      },

      {
        id: "tractions-endurance",
        name: "Tractions endurance",
        description:
          "Séries longues de tractions propres, sans aller jusqu’à l’échec dès les premières séries.",
        category: "Dos",
        tracking: "reps",
        defaultValues: {
          sets: 4,
          reps: 10,
          restSeconds: 120,
        },
      },

      {
        id: "suspension-facile",
        name: "Suspension facile",
        description:
          "Suspension sur prise confortable à intensité modérée.",
        category: "Résistance",
        tracking: "duration",
        isHangboard: true,
        defaultValues: {
          sets: 4,
          duration: 30,
          restSeconds: 90,
        },
      },

      {
        id: "dead-hang",
        name: "Dead hang",
        description:
          "Suspension relâchée contrôlée sur grosse prise ou barre.",
        category: "Dos",
        tracking: "duration",
        defaultValues: {
          sets: 3,
          duration: 30,
          restSeconds: 90,
        },
      },
    ],
  },

  // ── Dos / épaules ───────────────────────────────────────────────────────────

  {
    id: "s3-dos-epaules",
    name: "Dos / épaules",
    moment: "Force du haut du corps · tirage · poussée",
    exercises: [
      {
        id: "tractions-lestees",
        name: "Tractions lestées",
        description:
          "Tractions strictes avec charge supplémentaire.",
        category: "Dos",
        tracking: "weight+reps",
        defaultValues: {
          sets: 4,
          reps: 5,
          weight: 10,
          restSeconds: 180,
        },
      },

      {
        id: "blocages",
        name: "Blocages",
        description:
          "Maintenir une position de traction à angle fixe en gardant les omoplates actives.",
        category: "Dos",
        tracking: "duration",
        defaultValues: {
          sets: 4,
          duration: 10,
          restSeconds: 120,
        },
      },

      {
        id: "rowing-haltere",
        name: "Rowing haltère",
        description:
          "Tirage unilatéral avec contrôle de l’omoplate et du tronc.",
        category: "Dos",
        tracking: "weight+reps",
        perSide: true,
        defaultValues: {
          sets: 4,
          reps: 8,
          weight: 20,
          restSeconds: 120,
        },
      },

      {
        id: "lat-pulldown",
        name: "Lat pulldown",
        description:
          "Tirage vertical vers le haut de la poitrine avec contrôle des épaules.",
        category: "Dos",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 4,
          reps: 8,
          weight: 40,
          restSeconds: 120,
        },
      },

      {
        id: "facepull",
        name: "Face Pull",
        description:
          "Tirer la corde vers le visage en ouvrant les épaules et en contrôlant les omoplates.",
        category: "Épaules",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 20,
          restSeconds: 90,
        },
      },

      {
        id: "triceps-elastique",
        name: "Extension triceps élastique",
        description:
          "Extension du coude contrôlée à l’élastique.",
        category: "Bras",
        tracking: "duration+band",
        defaultValues: {
          sets: 3,
          duration: 30,
          bandColor: "jaune",
          bandStretch: 1,
          restSeconds: 60,
        },
      },

      {
        id: "developpe-militaire",
        name: "Développé militaire",
        description:
          "Poussée verticale avec gainage du tronc.",
        category: "Épaules",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 4,
          reps: 6,
          weight: 30,
          restSeconds: 150,
        },
      },

      {
        id: "developpe-couche",
        name: "Développé couché",
        description:
          "Développé couché avec contrôle de la descente et poussée stable.",
        category: "Pectoraux",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 4,
          reps: 6,
          weight: 50,
          restSeconds: 150,
        },
      },

      {
        id: "dips",
        name: "Dips",
        description:
          "Descendre de manière contrôlée puis repousser sans perdre la position des épaules.",
        category: "Pectoraux",
        tracking: "reps",
        defaultValues: {
          sets: 4,
          reps: 8,
          restSeconds: 120,
        },
      },
    ],
  },

  // ── Gainage ─────────────────────────────────────────────────────────────────

  {
    id: "s4-gainage",
    name: "Gainage",
    moment: "Tronc · stabilité · transfert de force",
    exercises: [
      {
        id: "dead-bug",
        name: "Dead bug",
        description:
          "Maintenir les lombaires stables pendant l’extension opposée bras/jambe.",
        category: "Gainage",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 3,
          reps: 10,
          restSeconds: 60,
        },
      },

      {
        id: "planche",
        name: "Planche",
        description:
          "Gainage frontal avec bassin neutre et respiration contrôlée.",
        category: "Gainage",
        tracking: "duration",
        defaultValues: {
          sets: 3,
          duration: 60,
          restSeconds: 60,
        },
      },

      {
        id: "planche-laterale",
        name: "Planche latérale",
        description:
          "Gainage latéral avec alignement épaule-bassin-cheville.",
        category: "Gainage",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 3,
          duration: 45,
          restSeconds: 60,
        },
      },

      {
        id: "pallof-press",
        name: "Pallof press",
        description:
          "Résister à la rotation du tronc face à une résistance latérale.",
        category: "Gainage",
        tracking: "duration+band",
        perSide: true,
        defaultValues: {
          sets: 3,
          duration: 20,
          bandColor: "rouge",
          bandStretch: 1,
          restSeconds: 60,
        },
      },

      {
        id: "releves-jambes",
        name: "Relevés de jambes suspendus",
        description:
          "Monter les jambes sans balancer et contrôler la descente.",
        category: "Gainage",
        tracking: "reps",
        defaultValues: {
          sets: 3,
          reps: 10,
          restSeconds: 75,
        },
      },

      {
        id: "genoux-suspendus-twist",
        name: "Genoux suspendus avec twist",
        description:
          "Monter les genoux en ajoutant une rotation contrôlée du bassin.",
        category: "Gainage",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 3,
          reps: 8,
          restSeconds: 75,
        },
      },

      {
        id: "rotations-russes",
        name: "Rotations russes",
        description:
          "Rotation contrôlée du tronc sans accélération excessive.",
        category: "Gainage",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 3,
          reps: 16,
          weight: 5,
          restSeconds: 60,
        },
      },

      {
        id: "superman-hold",
        name: "Superman hold",
        description:
          "Maintien en extension légère du tronc et des hanches.",
        category: "Gainage",
        tracking: "duration",
        defaultValues: {
          sets: 3,
          duration: 30,
          restSeconds: 60,
        },
      },

      {
        id: "copenhagen-plank",
        name: "Copenhagen plank",
        description:
          "Planche latérale avec la jambe supérieure soutenue pour renforcer les adducteurs.",
        category: "Gainage",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 3,
          duration: 20,
          restSeconds: 75,
        },
      },
    ],
  },

  // ── Souplesse ────────────────────────────────────────────────────────────────

  {
    id: "s5-souplesse",
    name: "Souplesse / mobilité",
    moment: "Mobilité · amplitude · récupération",
    exercises: [
      {
        id: "etirement-poignet-paume",
        name: "Étirement poignet — paume vers l’avant",
        description:
          "Étirement doux des fléchisseurs du poignet.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },

      {
        id: "etirement-poignet-dos-main",
        name: "Étirement poignet — dos de la main",
        description:
          "Étirement doux des extenseurs du poignet.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },

      {
        id: "epaules-chaise",
        name: "Épaules sur chaise ou banc",
        description:
          "Ouvrir progressivement les épaules sans forcer les lombaires.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        defaultValues: {
          sets: 2,
          duration: 40,
          restSeconds: 10,
        },
      },

      {
        id: "rotation-thoracique",
        name: "Rotation thoracique",
        description:
          "Rotation contrôlée du haut du dos.",
        category: "Souplesse / mobilité",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 2,
          reps: 8,
          restSeconds: 10,
        },
      },

      {
        id: "dos-rond-dos-creux",
        name: "Dos rond / dos creux",
        description:
          "Mobiliser doucement la colonne vertébrale.",
        category: "Souplesse / mobilité",
        tracking: "reps",
        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 10,
        },
      },

      {
        id: "child-pose",
        name: "Position de l’enfant",
        description:
          "Relâcher le dos et les épaules.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        defaultValues: {
          sets: 2,
          duration: 45,
          restSeconds: 10,
        },
      },

      {
        id: "papillon",
        name: "Papillon",
        description:
          "Mobilité douce des adducteurs et des hanches.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        defaultValues: {
          sets: 2,
          duration: 45,
          restSeconds: 10,
        },
      },

      {
        id: "grenouille",
        name: "Grenouille",
        description:
          "Ouverture progressive des hanches et des adducteurs.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        defaultValues: {
          sets: 2,
          duration: 40,
          restSeconds: 10,
        },
      },

      {
        id: "fente-hanche",
        name: "Fente — ouverture de hanche",
        description:
          "Mobiliser les fléchisseurs de hanche.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },

      {
        id: "pigeon",
        name: "Pigeon",
        description:
          "Mobilité de hanche et des fessiers.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 35,
          restSeconds: 10,
        },
      },

      {
        id: "ischios-jambe-tendue",
        name: "Ischio-jambiers — jambe tendue",
        description:
          "Étirement contrôlé de l’arrière de la cuisse.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },

      {
        id: "quadriceps-debout",
        name: "Quadriceps debout",
        description:
          "Étirement doux du quadriceps.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },

      {
        id: "mollet-mur",
        name: "Étirement mollet contre un mur",
        description:
          "Étirement du mollet avec talon au sol.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },

      {
        id: "mobilite-genou-mur",
        name: "Montée de genou active contre le mur",
        description:
          "Mobilité active de hanche et contrôle du genou.",
        category: "Souplesse / mobilité",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 10,
        },
      },

      {
        id: "mobilite-cheville",
        name: "Mobilité cheville",
        description:
          "Avancer le genou sans décoller le talon.",
        category: "Souplesse / mobilité",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 2,
          reps: 12,
          restSeconds: 10,
        },
      },

      {
        id: "rotation-cheville",
        name: "Rotations de cheville",
        description:
          "Mobiliser doucement la cheville dans toutes les directions.",
        category: "Souplesse / mobilité",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 10,
        },
      },

      {
        id: "pont-talon-sureleve",
        name: "Pont une jambe — talon surélevé",
        description:
          "Activation douce des ischio-jambiers et des fessiers.",
        category: "Souplesse / mobilité",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 30,
        },
      },

      {
        id: "rotation-cervicale",
        name: "Rotation cervicale douce",
        description:
          "Mobiliser le cou sans aller dans la douleur.",
        category: "Souplesse / mobilité",
        tracking: "reps",
        perSide: true,
        defaultValues: {
          sets: 1,
          reps: 6,
          restSeconds: 10,
        },
      },

      {
        id: "ouverture-pectoraux",
        name: "Ouverture des pectoraux",
        description:
          "Étirement doux de la poitrine et de l’avant des épaules.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },

      {
        id: "squat-profond-mobilite",
        name: "Squat profond — mobilité",
        description:
          "Maintenir un squat profond confortable pour mobiliser chevilles, genoux et hanches.",
        category: "Souplesse / mobilité",
        tracking: "duration",
        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 10,
        },
      },
    ],
  },

  // ── Jambes ──────────────────────────────────────────────────────────────────

  {
    id: "s6-jambes",
    name: "Jambes",
    moment: "Force · stabilité · chaîne postérieure",
    exercises: [
      {
        id: "squat",
        name: "Squat",
        description:
          "Squat contrôlé en gardant le tronc stable et les genoux dans l’axe.",
        category: "Jambes",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 4,
          reps: 8,
          weight: 40,
          restSeconds: 150,
        },
      },

      {
        id: "fentes-bulgares",
        name: "Fentes bulgares",
        description:
          "Fente unilatérale avec pied arrière surélevé.",
        category: "Jambes",
        tracking: "weight+reps",
        perSide: true,
        defaultValues: {
          sets: 3,
          reps: 8,
          weight: 10,
          restSeconds: 120,
        },
      },

      {
        id: "sdle-roumain",
        name: "Soulevé de terre roumain",
        description:
          "Charnière de hanche avec tension contrôlée des ischio-jambiers.",
        category: "Jambes",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 4,
          reps: 8,
          weight: 40,
          restSeconds: 150,
        },
      },

      {
        id: "step-up",
        name: "Step-up",
        description:
          "Monter sur un banc ou une box en contrôlant la poussée de la jambe de travail.",
        category: "Jambes",
        tracking: "weight+reps",
        perSide: true,
        defaultValues: {
          sets: 3,
          reps: 10,
          weight: 10,
          restSeconds: 90,
        },
      },

      {
        id: "mollets-debout",
        name: "Mollets debout",
        description:
          "Montée complète sur la pointe des pieds puis descente contrôlée.",
        category: "Jambes",
        tracking: "weight+reps",
        totalWeight: true,
        defaultValues: {
          sets: 4,
          reps: 15,
          weight: 20,
          restSeconds: 75,
        },
      },

      {
        id: "tibialis-raise",
        name: "Tibialis raise",
        description:
          "Relever l’avant du pied en gardant les talons au sol.",
        category: "Jambes",
        tracking: "reps",
        defaultValues: {
          sets: 3,
          reps: 20,
          restSeconds: 60,
        },
      },

      {
        id: "tibialis-charge",
        name: "Tibialis chargé",
        description:
          "Travail du tibial antérieur avec résistance supplémentaire.",
        category: "Jambes",
        tracking: "weight+reps",
        defaultValues: {
          sets: 3,
          reps: 15,
          weight: 5,
          restSeconds: 60,
        },
      },
    ],
  },

  // ── Prévention ──────────────────────────────────────────────────────────────

  {
    id: "s7-prevention",
    name: "Prévention blessures",
    moment: "Épaules · poignets · doigts · stabilité",
    exercises: [
      {
        id: "rot-ext-epaule",
        name: "Rotation externe épaule",
        description:
          "Rotation externe légère et contrôlée, coude proche du corps.",
        category: "Prévention",
        tracking: "duration+band",
        perSide: true,
        defaultValues: {
          sets: 3,
          duration: 25,
          bandColor: "jaune",
          bandStretch: 1,
          restSeconds: 45,
        },
      },

      {
        id: "scapular-pullups",
        name: "Scapular pull-ups",
        description:
          "Dépression et élévation contrôlée des omoplates sans plier les coudes.",
        category: "Prévention",
        tracking: "reps",
        defaultValues: {
          sets: 3,
          reps: 10,
          restSeconds: 60,
        },
      },

      {
        id: "ext-doigts",
        name: "Extension des doigts",
        description:
          "Ouvrir les doigts contre un petit élastique pour travailler les extenseurs.",
        category: "Prévention",
        tracking: "reps",
        defaultValues: {
          sets: 3,
          reps: 20,
          restSeconds: 45,
        },
      },

      {
        id: "flex-poignet",
        name: "Flexion du poignet",
        description:
          "Flexion contrôlée du poignet avec charge légère.",
        category: "Prévention",
        tracking: "weight+reps",
        perSide: true,
        defaultValues: {
          sets: 3,
          reps: 15,
          weight: 3,
          restSeconds: 45,
        },
      },

      {
        id: "ext-poignet",
        name: "Extension du poignet",
        description:
          "Extension contrôlée du poignet avec charge légère.",
        category: "Prévention",
        tracking: "weight+reps",
        perSide: true,
        defaultValues: {
          sets: 3,
          reps: 15,
          weight: 3,
          restSeconds: 45,
        },
      },

      {
        id: "pronation-supination",
        name: "Pronation / supination",
        description:
          "Rotation lente de l’avant-bras avec charge légère.",
        category: "Prévention",
        tracking: "weight+reps",
        perSide: true,
        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 2,
          restSeconds: 45,
        },
      },

      {
        id: "equilibre-jambe",
        name: "Équilibre une jambe",
        description:
          "Maintien stable sur une jambe avec pied actif.",
        category: "Prévention",
        tracking: "duration",
        perSide: true,
        defaultValues: {
          sets: 3,
          duration: 30,
          restSeconds: 30,
        },
      },
    ],
  },

  // ── Pompes / activation ─────────────────────────────────────────────────────

  {
    id: "s8-pompes-activation",
    name: "Pompes / activation",
    moment: "Activation courte · poussée · épaules",
    exercises: [
      {
        id: "pompes-normales",
        name: "Pompes normales",
        description:
          "Pompes classiques avec tronc gainé.",
        category: "Pectoraux",
        tracking: "reps",
        defaultValues: {
          sets: 2,
          reps: 12,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-pieds-sureleves",
        name: "Pompes pieds surélevés",
        description:
          "Pompes avec pieds surélevés pour augmenter le travail du haut du corps.",
        category: "Pectoraux",
        tracking: "reps",
        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-diamant",
        name: "Pompes diamant",
        description:
          "Pompes mains rapprochées avec accent sur les triceps.",
        category: "Bras",
        tracking: "reps",
        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-larges",
        name: "Pompes larges",
        description:
          "Pompes avec prise légèrement plus large.",
        category: "Pectoraux",
        tracking: "reps",
        defaultValues: {
          sets: 2,
          reps: 12,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-pike",
        name: "Pompes Pike",
        description:
          "Pompes en position pike avec accent sur les épaules.",
        category: "Épaules",
        tracking: "reps",
        defaultValues: {
          sets: 2,
          reps: 8,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-coudes-serres",
        name: "Pompes coudes serrés",
        description:
          "Pompes en gardant les coudes proches du corps.",
        category: "Bras",
        tracking: "reps",
        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 45,
        },
      },
    ],
  },

  // ── Grimpe libre ────────────────────────────────────────────────────────────

  {
    id: "grimpe-libre",
    name: "Grimpe libre",
    moment: "Bloc libre",
    exercises: [],
  },
];