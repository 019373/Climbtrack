import type {
  ExerciseMuscleLoad,
  MuscleId,
  MuscleIntensity,
} from "@/data/sessions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MuscleSuggestionConfidence =
  | "high"
  | "medium"
  | "low";

export type ExerciseMuscleLibraryEntry = {
  id: string;

  /*
   * IDs exacts des exercices natifs de ClimbTrack.
   * Cela garantit que tous les exercices déjà présents
   * obtiennent toujours les bons muscles, même si leur
   * nom change légèrement plus tard.
   */
  exerciseIds?: string[];

  names: string[];
  keywords?: string[];

  muscleLoads: ExerciseMuscleLoad[];
};

export type MuscleSuggestion = {
  matchedExerciseId: string | null;
  matchedName: string | null;
  confidence: MuscleSuggestionConfidence;
  score: number;
  muscleLoads: ExerciseMuscleLoad[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function load(
  muscleId: MuscleId,
  intensity: MuscleIntensity,
): ExerciseMuscleLoad {
  return {
    muscleId,
    intensity,
  };
}

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function tokenize(
  value: string,
): string[] {
  return normalizeText(
    value,
  )
    .split(" ")
    .filter(
      (token) =>
        token.length >= 2,
    );
}

function uniqueMuscleLoads(
  loads: ExerciseMuscleLoad[],
): ExerciseMuscleLoad[] {
  const intensityRank: Record<
    MuscleIntensity,
    number
  > = {
    low: 1,
    medium: 2,
    high: 3,
  };

  const byMuscle =
    new Map<
      MuscleId,
      ExerciseMuscleLoad
    >();

  loads.forEach(
    (current) => {
      const previous =
        byMuscle.get(
          current.muscleId,
        );

      if (
        !previous ||
        intensityRank[
          current.intensity
        ] >
          intensityRank[
            previous.intensity
          ]
      ) {
        byMuscle.set(
          current.muscleId,
          current,
        );
      }
    },
  );

  return Array.from(
    byMuscle.values(),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque
// ─────────────────────────────────────────────────────────────────────────────

export const EXERCISE_MUSCLE_LIBRARY: ExerciseMuscleLibraryEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ESCALADE / DOIGTS / HANGBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "hangboard-edge",
    exerciseIds: [
      "suspension-20mm",
      "dead-hang",
    ],
    names: [
      "suspension réglette",
      "suspension 20 mm",
      "suspension 25 mm",
      "dead hang réglette",
      "hangboard edge",
      "fingerboard edge",
      "edge hang",
      "half crimp hang",
      "semi arche",
      "suspension semi arche",
    ],
    keywords: [
      "reglette",
      "hangboard",
      "fingerboard",
      "suspension",
      "semi arche",
      "crimp",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "lumbricaux-main",
        "medium",
      ),
      load(
        "interosseux-main",
        "medium",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
      load(
        "brachioradial",
        "low",
      ),
      load(
        "grand-dorsal",
        "low",
      ),
      load(
        "trapeze-inferieur",
        "low",
      ),
      load(
        "dentelé-anterieur",
        "low",
      ),
    ],
  },

  {
    id: "hangboard-sloper",
    exerciseIds: [
      "suspension-slopers",
    ],
    names: [
      "suspension sur plats",
      "suspension slopers",
      "sloper hang",
      "sloper suspension",
      "hangboard sloper",
      "plat hangboard",
    ],
    keywords: [
      "sloper",
      "plat",
      "suspension",
      "hangboard",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "thenar",
        "medium",
      ),
      load(
        "hypothenar",
        "medium",
      ),
      load(
        "interosseux-main",
        "medium",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
      load(
        "extenseurs-poignet",
        "low",
      ),
      load(
        "grand-dorsal",
        "low",
      ),
      load(
        "trapeze-inferieur",
        "low",
      ),
    ],
  },

  {
    id: "repeaters",
    exerciseIds: [
      "repeaters-7-3",
    ],
    names: [
      "repeaters",
      "repeaters 7 3",
      "repeaters 7/3",
      "hangboard repeaters",
      "fingerboard repeaters",
      "intermittent hangs",
    ],
    keywords: [
      "repeaters",
      "7 3",
      "hangboard",
      "suspension intermittente",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "grand-dorsal",
        "low",
      ),
      load(
        "biceps-brachial",
        "low",
      ),
      load(
        "trapeze-inferieur",
        "low",
      ),
    ],
  },

  {
    id: "pinch",
    exerciseIds: [
      "pince-disque",
      "pince-large",
    ],
    names: [
      "pince disque",
      "petite pince",
      "grande pince",
      "pinch block",
      "pinch grip",
      "plate pinch",
      "pinch lift",
      "pinch hold",
    ],
    keywords: [
      "pince",
      "pinch",
      "pouce",
      "plate",
    ],
    muscleLoads: [
      load(
        "thenar",
        "high",
      ),
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "interosseux-main",
        "medium",
      ),
      load(
        "lumbricaux-main",
        "medium",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
      load(
        "extenseurs-poignet",
        "low",
      ),
    ],
  },

  {
    id: "dynamic-cross",
    exerciseIds: [
      "sauts-prise",
      "croise-dynamique-19-30",
    ],
    names: [
      "croisé dynamique",
      "croise dynamique",
      "saut pour prise",
      "dynamique prise",
      "dyno",
      "cross move climbing",
      "dynamic climbing move",
    ],
    keywords: [
      "croise",
      "dynamique",
      "dyno",
      "prise",
      "explosif",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
      load(
        "brachial",
        "medium",
      ),
      load(
        "deltoide-posterieur",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
      load(
        "oblique-externe",
        "medium",
      ),
      load(
        "grand-fessier",
        "medium",
      ),
      load(
        "quadriceps" as MuscleId,
        "medium",
      ),
    ].filter(
      (
        item,
      ): item is ExerciseMuscleLoad =>
        item.muscleId !==
        (
          "quadriceps" as MuscleId
        ),
    ).concat([
      load(
        "droit-femoral",
        "medium",
      ),
      load(
        "vaste-lateral",
        "medium",
      ),
      load(
        "vaste-medial",
        "medium",
      ),
    ]),
  },

  {
    id: "overhang-bouldering",
    exerciseIds: [
      "blocs-devers",
    ],
    names: [
      "blocs en dévers",
      "bloc devers",
      "overhang climbing",
      "overhang bouldering",
      "steep climbing",
      "steep bouldering",
    ],
    keywords: [
      "devers",
      "overhang",
      "steep",
      "bloc",
      "boulder",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "biceps-brachial",
        "high",
      ),
      load(
        "brachial",
        "medium",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "deltoide-posterieur",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "droit-abdomen",
        "high",
      ),
      load(
        "oblique-externe",
        "medium",
      ),
      load(
        "ilio-psoas",
        "medium",
      ),
      load(
        "grand-fessier",
        "medium",
      ),
    ],
  },

  {
    id: "climbing-traverse",
    exerciseIds: [
      "traversees-longues",
    ],
    names: [
      "traversée",
      "traversée longue",
      "climbing traverse",
      "long traverse",
      "wall traverse",
    ],
    keywords: [
      "traversee",
      "traverse",
      "grimpe",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
      load(
        "grand-dorsal",
        "medium",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
      load(
        "deltoide-posterieur",
        "medium",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
      load(
        "oblique-externe",
        "medium",
      ),
      load(
        "grand-fessier",
        "medium",
      ),
      load(
        "moyen-fessier",
        "medium",
      ),
      load(
        "droit-femoral",
        "low",
      ),
      load(
        "gastrocnemien",
        "low",
      ),
    ],
  },

  {
    id: "jug-hang",
    exerciseIds: [
      "suspension-facile",
    ],
    names: [
      "suspension longue sur bacs",
      "suspension sur bacs",
      "jug hang",
      "large hold hang",
      "easy dead hang",
    ],
    keywords: [
      "bac",
      "jug",
      "suspension",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "medium",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
      load(
        "grand-dorsal",
        "low",
      ),
      load(
        "trapeze-inferieur",
        "low",
      ),
      load(
        "dentelé-anterieur",
        "low",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRACTIONS / DOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "pullup",
    exerciseIds: [
      "tractions-endurance",
    ],
    names: [
      "traction",
      "tractions",
      "pull up",
      "pullup",
      "chin up",
      "chinup",
      "traction poids du corps",
    ],
    keywords: [
      "traction",
      "pull up",
      "chin up",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "grand-rond",
        "medium",
      ),
      load(
        "biceps-brachial",
        "high",
      ),
      load(
        "brachial",
        "high",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
    ],
  },

  {
    id: "weighted-pullup",
    exerciseIds: [
      "tractions-lestees",
    ],
    names: [
      "traction lestée",
      "tractions lestées",
      "weighted pull up",
      "weighted pullup",
      "weighted chin up",
    ],
    keywords: [
      "traction",
      "leste",
      "weighted",
      "pullup",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "grand-rond",
        "high",
      ),
      load(
        "biceps-brachial",
        "high",
      ),
      load(
        "brachial",
        "high",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
    ],
  },

  {
    id: "heavy-light-pullups",
    exerciseIds: [
      "lourd-leger",
    ],
    names: [
      "tractions lourd léger",
      "traction lourd léger",
      "heavy light pullups",
      "contrast pull ups",
      "contrast pullups",
    ],
    keywords: [
      "lourd leger",
      "heavy light",
      "contrast",
      "traction",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "grand-rond",
        "high",
      ),
      load(
        "biceps-brachial",
        "high",
      ),
      load(
        "brachial",
        "high",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
    ],
  },

  {
    id: "lockoff",
    exerciseIds: [
      "blocages",
    ],
    names: [
      "blocage traction",
      "blocages",
      "lock off",
      "lockoff",
      "isometric pullup",
      "isometric pull up",
    ],
    keywords: [
      "blocage",
      "lock off",
      "isometrique traction",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "biceps-brachial",
        "high",
      ),
      load(
        "brachial",
        "high",
      ),
      load(
        "brachioradial",
        "high",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
    ],
  },

  {
    id: "scapular-pullup",
    exerciseIds: [
      "scapular-pullups",
    ],
    names: [
      "scapular pull up",
      "scapular pullup",
      "traction scapulaire",
      "scapular pulls",
    ],
    keywords: [
      "scapular",
      "scapulaire",
      "omoplate",
    ],
    muscleLoads: [
      load(
        "trapeze-inferieur",
        "high",
      ),
      load(
        "trapeze-moyen",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "rhomboide-mineur",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
      load(
        "grand-dorsal",
        "low",
      ),
    ],
  },

  {
    id: "dumbbell-row",
    exerciseIds: [
      "rowing-haltere",
    ],
    names: [
      "rowing haltère",
      "rowing haltere",
      "rowing unilatéral",
      "tirage haltère",
      "tirage bucheron",
      "one arm dumbbell row",
      "single arm dumbbell row",
      "dumbbell row",
      "one arm row",
    ],
    keywords: [
      "rowing",
      "tirage",
      "haltere",
      "dumbbell row",
      "bucheron",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "grand-rond",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "high",
      ),
      load(
        "rhomboide-mineur",
        "medium",
      ),
      load(
        "trapeze-moyen",
        "high",
      ),
      load(
        "deltoide-posterieur",
        "medium",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
      load(
        "brachial",
        "medium",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "erecteurs-rachis",
        "low",
      ),
    ],
  },

  {
    id: "barbell-row",
    names: [
      "rowing barre",
      "barbell row",
      "bent over row",
      "pendlay row",
    ],
    keywords: [
      "rowing barre",
      "barbell row",
      "pendlay",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "rhomboide-majeur",
        "high",
      ),
      load(
        "trapeze-moyen",
        "high",
      ),
      load(
        "deltoide-posterieur",
        "medium",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
      load(
        "erecteurs-rachis",
        "medium",
      ),
      load(
        "grand-fessier",
        "low",
      ),
      load(
        "biceps-femoral",
        "low",
      ),
    ],
  },

  {
    id: "lat-pulldown",
    exerciseIds: [
      "lat-pulldown",
    ],
    names: [
      "lat pulldown",
      "tirage vertical",
      "tirage poitrine",
      "pulldown",
      "lat machine",
    ],
    keywords: [
      "lat pulldown",
      "tirage vertical",
      "pulldown",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "grand-rond",
        "medium",
      ),
      load(
        "biceps-brachial",
        "high",
      ),
      load(
        "brachial",
        "medium",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "deltoide-posterieur",
        "low",
      ),
    ],
  },

  {
    id: "seated-row",
    names: [
      "tirage horizontal",
      "seated row",
      "cable row",
      "rowing poulie",
      "rowing assis",
    ],
    keywords: [
      "tirage horizontal",
      "cable row",
      "seated row",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "high",
      ),
      load(
        "rhomboide-majeur",
        "high",
      ),
      load(
        "trapeze-moyen",
        "high",
      ),
      load(
        "deltoide-posterieur",
        "medium",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
      load(
        "brachioradial",
        "medium",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉPAULES / PECTORAUX / TRICEPS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "face-pull",
    exerciseIds: [
      "facepull",
    ],
    names: [
      "face pull",
      "facepull",
      "tirage visage",
      "rope face pull",
    ],
    keywords: [
      "face pull",
      "visage",
      "corde",
    ],
    muscleLoads: [
      load(
        "deltoide-posterieur",
        "high",
      ),
      load(
        "infra-epineux",
        "high",
      ),
      load(
        "petit-rond",
        "high",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "rhomboide-mineur",
        "medium",
      ),
      load(
        "trapeze-moyen",
        "medium",
      ),
      load(
        "trapeze-inferieur",
        "medium",
      ),
      load(
        "biceps-brachial",
        "low",
      ),
    ],
  },

  {
    id: "external-rotation",
    exerciseIds: [
      "rot-ext-epaule",
    ],
    names: [
      "rotation externe épaule",
      "rotation externe",
      "external shoulder rotation",
      "external rotation",
      "band external rotation",
    ],
    keywords: [
      "rotation externe",
      "external rotation",
      "coiffe",
    ],
    muscleLoads: [
      load(
        "infra-epineux",
        "high",
      ),
      load(
        "petit-rond",
        "high",
      ),
      load(
        "deltoide-posterieur",
        "low",
      ),
    ],
  },

  {
    id: "overhead-press",
    exerciseIds: [
      "developpe-militaire",
    ],
    names: [
      "développé militaire",
      "developpe militaire",
      "overhead press",
      "military press",
      "shoulder press",
      "développé épaules",
    ],
    keywords: [
      "militaire",
      "overhead press",
      "shoulder press",
    ],
    muscleLoads: [
      load(
        "deltoide-anterieur",
        "high",
      ),
      load(
        "deltoide-lateral",
        "high",
      ),
      load(
        "triceps-brachial",
        "high",
      ),
      load(
        "grand-pectoral-claviculaire",
        "medium",
      ),
      load(
        "trapeze-superieur",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
      load(
        "erecteurs-rachis",
        "low",
      ),
    ],
  },

  {
    id: "bench-press",
    exerciseIds: [
      "developpe-couche",
    ],
    names: [
      "développé couché",
      "developpe couche",
      "bench press",
      "barbell bench press",
      "dumbbell bench press",
    ],
    keywords: [
      "bench",
      "developpe couche",
    ],
    muscleLoads: [
      load(
        "grand-pectoral-sternal",
        "high",
      ),
      load(
        "grand-pectoral-claviculaire",
        "medium",
      ),
      load(
        "triceps-brachial",
        "high",
      ),
      load(
        "deltoide-anterieur",
        "high",
      ),
      load(
        "dentelé-anterieur",
        "low",
      ),
    ],
  },

  {
    id: "incline-bench",
    names: [
      "développé incliné",
      "developpe incline",
      "incline bench press",
      "incline dumbbell press",
    ],
    keywords: [
      "incline",
      "incline bench",
    ],
    muscleLoads: [
      load(
        "grand-pectoral-claviculaire",
        "high",
      ),
      load(
        "grand-pectoral-sternal",
        "medium",
      ),
      load(
        "deltoide-anterieur",
        "high",
      ),
      load(
        "triceps-brachial",
        "high",
      ),
    ],
  },

  {
    id: "dips",
    exerciseIds: [
      "dips",
    ],
    names: [
      "dips",
      "dip",
      "bar dips",
      "parallel bar dips",
    ],
    keywords: [
      "dips",
      "dip",
    ],
    muscleLoads: [
      load(
        "grand-pectoral-sternal",
        "high",
      ),
      load(
        "triceps-brachial",
        "high",
      ),
      load(
        "deltoide-anterieur",
        "medium",
      ),
      load(
        "petit-pectoral",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
    ],
  },

  {
    id: "triceps-extension",
    exerciseIds: [
      "triceps-elastique",
    ],
    names: [
      "extension triceps",
      "extension triceps élastique",
      "triceps pushdown",
      "triceps pressdown",
      "band triceps extension",
    ],
    keywords: [
      "triceps",
      "extension",
      "pushdown",
    ],
    muscleLoads: [
      load(
        "triceps-brachial",
        "high",
      ),
    ],
  },

  {
    id: "lateral-raise",
    names: [
      "élévation latérale",
      "elevation laterale",
      "lateral raise",
      "side raise",
    ],
    keywords: [
      "elevation laterale",
      "lateral raise",
    ],
    muscleLoads: [
      load(
        "deltoide-lateral",
        "high",
      ),
      load(
        "supra-epineux",
        "medium",
      ),
      load(
        "trapeze-superieur",
        "low",
      ),
    ],
  },

  {
    id: "rear-delt-fly",
    names: [
      "oiseau haltère",
      "oiseau haltere",
      "reverse fly",
      "rear delt fly",
      "reverse pec deck",
    ],
    keywords: [
      "rear delt",
      "oiseau",
      "reverse fly",
    ],
    muscleLoads: [
      load(
        "deltoide-posterieur",
        "high",
      ),
      load(
        "rhomboide-majeur",
        "medium",
      ),
      load(
        "trapeze-moyen",
        "medium",
      ),
      load(
        "infra-epineux",
        "low",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // POMPES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "pushup",
    exerciseIds: [
      "pompes-normales",
      "pompes-larges",
    ],
    names: [
      "pompes",
      "pompe",
      "push up",
      "pushup",
      "push ups",
      "wide push up",
      "pompes larges",
    ],
    keywords: [
      "pompe",
      "pushup",
      "push up",
    ],
    muscleLoads: [
      load(
        "grand-pectoral-sternal",
        "high",
      ),
      load(
        "triceps-brachial",
        "medium",
      ),
      load(
        "deltoide-anterieur",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
      load(
        "transverse-abdomen",
        "medium",
      ),
    ],
  },

  {
    id: "decline-pushup",
    exerciseIds: [
      "pompes-pieds-sureleves",
    ],
    names: [
      "pompes pieds surélevés",
      "decline push up",
      "decline pushup",
    ],
    keywords: [
      "pieds sureleves",
      "decline push",
    ],
    muscleLoads: [
      load(
        "grand-pectoral-claviculaire",
        "high",
      ),
      load(
        "deltoide-anterieur",
        "high",
      ),
      load(
        "triceps-brachial",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
    ],
  },

  {
    id: "diamond-pushup",
    exerciseIds: [
      "pompes-diamant",
      "pompes-coudes-serres",
    ],
    names: [
      "pompes diamant",
      "diamond push up",
      "diamond pushup",
      "pompes serrées",
      "pompes coudes serrés",
      "close grip pushup",
    ],
    keywords: [
      "diamant",
      "diamond",
      "serre",
      "close grip",
    ],
    muscleLoads: [
      load(
        "triceps-brachial",
        "high",
      ),
      load(
        "grand-pectoral-sternal",
        "high",
      ),
      load(
        "deltoide-anterieur",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
    ],
  },

  {
    id: "pike-pushup",
    exerciseIds: [
      "pompes-pike",
    ],
    names: [
      "pompes pike",
      "pike push up",
      "pike pushup",
    ],
    keywords: [
      "pike",
    ],
    muscleLoads: [
      load(
        "deltoide-anterieur",
        "high",
      ),
      load(
        "deltoide-lateral",
        "medium",
      ),
      load(
        "triceps-brachial",
        "high",
      ),
      load(
        "trapeze-superieur",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GAINAGE / TRONC
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "plank",
    exerciseIds: [
      "planche",
    ],
    names: [
      "planche",
      "planche avant bras",
      "plank",
      "forearm plank",
      "front plank",
    ],
    keywords: [
      "planche",
      "plank",
    ],
    muscleLoads: [
      load(
        "transverse-abdomen",
        "high",
      ),
      load(
        "droit-abdomen",
        "high",
      ),
      load(
        "oblique-interne",
        "medium",
      ),
      load(
        "oblique-externe",
        "medium",
      ),
      load(
        "grand-fessier",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "medium",
      ),
      load(
        "deltoide-anterieur",
        "low",
      ),
    ],
  },

  {
    id: "side-plank",
    exerciseIds: [
      "planche-laterale",
    ],
    names: [
      "planche latérale",
      "planche laterale",
      "side plank",
    ],
    keywords: [
      "side plank",
      "planche laterale",
    ],
    muscleLoads: [
      load(
        "oblique-externe",
        "high",
      ),
      load(
        "oblique-interne",
        "high",
      ),
      load(
        "carre-lombes",
        "high",
      ),
      load(
        "transverse-abdomen",
        "medium",
      ),
      load(
        "moyen-fessier",
        "high",
      ),
      load(
        "petit-fessier",
        "medium",
      ),
      load(
        "deltoide-lateral",
        "medium",
      ),
    ],
  },

  {
    id: "dead-bug",
    exerciseIds: [
      "dead-bug",
    ],
    names: [
      "dead bug",
      "deadbug",
    ],
    keywords: [
      "dead bug",
    ],
    muscleLoads: [
      load(
        "transverse-abdomen",
        "high",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
      load(
        "oblique-interne",
        "medium",
      ),
      load(
        "oblique-externe",
        "medium",
      ),
      load(
        "ilio-psoas",
        "medium",
      ),
    ],
  },

  {
    id: "pallof",
    exerciseIds: [
      "pallof-press",
    ],
    names: [
      "pallof press",
      "pallof",
      "anti rotation cable",
      "anti rotation band",
    ],
    keywords: [
      "pallof",
      "anti rotation",
    ],
    muscleLoads: [
      load(
        "oblique-externe",
        "high",
      ),
      load(
        "oblique-interne",
        "high",
      ),
      load(
        "transverse-abdomen",
        "high",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
      load(
        "moyen-fessier",
        "medium",
      ),
    ],
  },

  {
    id: "hanging-leg-raise",
    exerciseIds: [
      "releves-jambes",
    ],
    names: [
      "relevés de jambes suspendu",
      "hanging leg raise",
      "hanging leg raises",
    ],
    keywords: [
      "releve jambes",
      "hanging leg",
    ],
    muscleLoads: [
      load(
        "droit-abdomen",
        "high",
      ),
      load(
        "ilio-psoas",
        "high",
      ),
      load(
        "transverse-abdomen",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
      load(
        "grand-dorsal",
        "low",
      ),
    ],
  },

  {
    id: "hanging-knee-twist",
    exerciseIds: [
      "genoux-suspendus-twist",
    ],
    names: [
      "relevés de genoux suspendus avec twist",
      "hanging knee raise twist",
      "hanging knee twist",
    ],
    keywords: [
      "genoux suspendu",
      "twist",
    ],
    muscleLoads: [
      load(
        "droit-abdomen",
        "high",
      ),
      load(
        "oblique-externe",
        "high",
      ),
      load(
        "oblique-interne",
        "high",
      ),
      load(
        "ilio-psoas",
        "high",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
    ],
  },

  {
    id: "russian-twist",
    exerciseIds: [
      "rotations-russes",
    ],
    names: [
      "rotations russes",
      "russian twist",
      "russian twists",
    ],
    keywords: [
      "russe",
      "russian twist",
    ],
    muscleLoads: [
      load(
        "oblique-externe",
        "high",
      ),
      load(
        "oblique-interne",
        "high",
      ),
      load(
        "droit-abdomen",
        "medium",
      ),
      load(
        "transverse-abdomen",
        "medium",
      ),
      load(
        "ilio-psoas",
        "low",
      ),
    ],
  },

  {
    id: "superman",
    exerciseIds: [
      "superman-hold",
    ],
    names: [
      "superman",
      "superman hold",
      "extension lombaire au sol",
    ],
    keywords: [
      "superman",
    ],
    muscleLoads: [
      load(
        "erecteurs-rachis",
        "high",
      ),
      load(
        "multifides",
        "medium",
      ),
      load(
        "grand-fessier",
        "medium",
      ),
      load(
        "biceps-femoral",
        "low",
      ),
      load(
        "semi-tendineux",
        "low",
      ),
      load(
        "semi-membraneux",
        "low",
      ),
    ],
  },

  {
    id: "copenhagen",
    exerciseIds: [
      "copenhagen-plank",
    ],
    names: [
      "copenhagen plank",
      "copenhagen",
      "planche copenhagen",
    ],
    keywords: [
      "copenhagen",
    ],
    muscleLoads: [
      load(
        "long-adducteur",
        "high",
      ),
      load(
        "court-adducteur",
        "high",
      ),
      load(
        "grand-adducteur",
        "high",
      ),
      load(
        "gracile",
        "high",
      ),
      load(
        "pectine",
        "medium",
      ),
      load(
        "oblique-externe",
        "medium",
      ),
      load(
        "carre-lombes",
        "medium",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JAMBES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "squat",
    exerciseIds: [
      "squat",
    ],
    names: [
      "squat",
      "squat haltères",
      "squat halteres",
      "barbell squat",
      "back squat",
      "front squat",
      "goblet squat",
      "dumbbell squat",
    ],
    keywords: [
      "squat",
    ],
    muscleLoads: [
      load(
        "droit-femoral",
        "high",
      ),
      load(
        "vaste-lateral",
        "high",
      ),
      load(
        "vaste-medial",
        "high",
      ),
      load(
        "vaste-intermediaire",
        "high",
      ),
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "grand-adducteur",
        "medium",
      ),
      load(
        "biceps-femoral",
        "medium",
      ),
      load(
        "semi-tendineux",
        "medium",
      ),
      load(
        "semi-membraneux",
        "medium",
      ),
      load(
        "erecteurs-rachis",
        "medium",
      ),
      load(
        "transverse-abdomen",
        "medium",
      ),
    ],
  },

  {
    id: "bulgarian-split-squat",
    exerciseIds: [
      "fentes-bulgares",
    ],
    names: [
      "fentes bulgares",
      "fente bulgare",
      "bulgarian split squat",
      "bulgarian squat",
      "rear foot elevated split squat",
    ],
    keywords: [
      "bulgare",
      "bulgarian",
      "split squat",
    ],
    muscleLoads: [
      load(
        "droit-femoral",
        "high",
      ),
      load(
        "vaste-lateral",
        "high",
      ),
      load(
        "vaste-medial",
        "high",
      ),
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "moyen-fessier",
        "medium",
      ),
      load(
        "grand-adducteur",
        "medium",
      ),
      load(
        "biceps-femoral",
        "medium",
      ),
      load(
        "semi-tendineux",
        "medium",
      ),
      load(
        "semi-membraneux",
        "medium",
      ),
    ],
  },

  {
    id: "romanian-deadlift",
    exerciseIds: [
      "sdle-roumain",
    ],
    names: [
      "soulevé de terre roumain",
      "souleve de terre roumain",
      "romanian deadlift",
      "rdl",
      "stiff leg deadlift",
    ],
    keywords: [
      "roumain",
      "rdl",
      "romanian deadlift",
    ],
    muscleLoads: [
      load(
        "biceps-femoral",
        "high",
      ),
      load(
        "semi-tendineux",
        "high",
      ),
      load(
        "semi-membraneux",
        "high",
      ),
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "grand-adducteur",
        "medium",
      ),
      load(
        "erecteurs-rachis",
        "high",
      ),
      load(
        "multifides",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
    ],
  },

  {
    id: "deadlift",
    names: [
      "soulevé de terre",
      "souleve de terre",
      "deadlift",
      "conventional deadlift",
      "sumo deadlift",
    ],
    keywords: [
      "deadlift",
      "souleve de terre",
    ],
    muscleLoads: [
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "biceps-femoral",
        "high",
      ),
      load(
        "semi-tendineux",
        "high",
      ),
      load(
        "semi-membraneux",
        "high",
      ),
      load(
        "grand-adducteur",
        "high",
      ),
      load(
        "erecteurs-rachis",
        "high",
      ),
      load(
        "trapeze-superieur",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "flechisseurs-poignet",
        "medium",
      ),
    ],
  },

  {
    id: "step-up",
    exerciseIds: [
      "step-up",
    ],
    names: [
      "step up",
      "step-up",
      "montée sur box",
      "box step up",
    ],
    keywords: [
      "step up",
      "box",
    ],
    muscleLoads: [
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "droit-femoral",
        "high",
      ),
      load(
        "vaste-lateral",
        "high",
      ),
      load(
        "vaste-medial",
        "high",
      ),
      load(
        "moyen-fessier",
        "medium",
      ),
      load(
        "biceps-femoral",
        "medium",
      ),
      load(
        "gastrocnemien",
        "medium",
      ),
    ],
  },

  {
    id: "calf-raise",
    exerciseIds: [
      "mollets-debout",
    ],
    names: [
      "élévation mollets",
      "elevation mollets",
      "mollets debout",
      "calf raise",
      "standing calf raise",
    ],
    keywords: [
      "mollet",
      "calf raise",
    ],
    muscleLoads: [
      load(
        "gastrocnemien",
        "high",
      ),
      load(
        "soleaire",
        "high",
      ),
      load(
        "tibial-posterieur",
        "medium",
      ),
      load(
        "fibulaires",
        "low",
      ),
      load(
        "intrinseques-pied",
        "low",
      ),
    ],
  },

  {
    id: "tibialis-raise",
    exerciseIds: [
      "tibialis-raise",
      "tibialis-charge",
    ],
    names: [
      "tibialis raise",
      "tibialis raise poids",
      "tibial raise",
      "élévation tibial",
      "relevé pointe pied",
    ],
    keywords: [
      "tibialis",
      "tibial",
      "pointe pied",
    ],
    muscleLoads: [
      load(
        "tibial-anterieur",
        "high",
      ),
      load(
        "extenseurs-doigts",
        "low",
      ),
    ],
  },

  {
    id: "walking-lunge",
    names: [
      "fente avant",
      "fentes marchées",
      "walking lunge",
      "forward lunge",
      "reverse lunge",
    ],
    keywords: [
      "lunge",
      "fente",
    ],
    muscleLoads: [
      load(
        "droit-femoral",
        "high",
      ),
      load(
        "vaste-lateral",
        "high",
      ),
      load(
        "vaste-medial",
        "high",
      ),
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "moyen-fessier",
        "medium",
      ),
      load(
        "biceps-femoral",
        "medium",
      ),
      load(
        "grand-adducteur",
        "medium",
      ),
    ],
  },

  {
    id: "hip-thrust",
    names: [
      "hip thrust",
      "pont fessier lesté",
      "glute bridge",
      "barbell hip thrust",
    ],
    keywords: [
      "hip thrust",
      "glute bridge",
      "pont fessier",
    ],
    muscleLoads: [
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "moyen-fessier",
        "medium",
      ),
      load(
        "biceps-femoral",
        "medium",
      ),
      load(
        "semi-tendineux",
        "medium",
      ),
      load(
        "semi-membraneux",
        "medium",
      ),
      load(
        "grand-adducteur",
        "medium",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AVANT-BRAS / PRÉVENTION
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "finger-extension",
    exerciseIds: [
      "ext-doigts",
    ],
    names: [
      "extension des doigts",
      "finger extension",
      "finger extensor band",
      "rubber band finger extension",
    ],
    keywords: [
      "extension doigts",
      "finger extension",
    ],
    muscleLoads: [
      load(
        "extenseurs-doigts",
        "high",
      ),
      load(
        "extenseurs-poignet",
        "medium",
      ),
      load(
        "interosseux-main",
        "low",
      ),
    ],
  },

  {
    id: "wrist-curl",
    exerciseIds: [
      "flex-poignet",
    ],
    names: [
      "wrist curl",
      "wrist curls",
      "flexion poignet",
      "curl poignet",
    ],
    keywords: [
      "wrist curl",
      "flexion poignet",
    ],
    muscleLoads: [
      load(
        "flechisseurs-poignet",
        "high",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
    ],
  },

  {
    id: "reverse-wrist-curl",
    exerciseIds: [
      "ext-poignet",
    ],
    names: [
      "extension poignet",
      "extensions du poignet",
      "reverse wrist curl",
      "wrist extension",
    ],
    keywords: [
      "extension poignet",
      "wrist extension",
      "reverse wrist",
    ],
    muscleLoads: [
      load(
        "extenseurs-poignet",
        "high",
      ),
      load(
        "extenseurs-doigts",
        "medium",
      ),
    ],
  },

  {
    id: "pronation-supination",
    exerciseIds: [
      "pronation-supination",
    ],
    names: [
      "pronation supination",
      "pronation / supination",
      "forearm rotation",
      "hammer pronation supination",
    ],
    keywords: [
      "pronation",
      "supination",
      "marteau",
    ],
    muscleLoads: [
      load(
        "pronateur-rond",
        "high",
      ),
      load(
        "pronateur-carre",
        "high",
      ),
      load(
        "supinateur",
        "high",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
      load(
        "brachioradial",
        "medium",
      ),
    ],
  },

  {
    id: "single-leg-balance",
    exerciseIds: [
      "equilibre-jambe",
    ],
    names: [
      "équilibre une jambe",
      "equilibre une jambe",
      "single leg balance",
      "one leg balance",
    ],
    keywords: [
      "equilibre",
      "balance",
      "une jambe",
    ],
    muscleLoads: [
      load(
        "moyen-fessier",
        "medium",
      ),
      load(
        "petit-fessier",
        "medium",
      ),
      load(
        "tibial-anterieur",
        "medium",
      ),
      load(
        "tibial-posterieur",
        "medium",
      ),
      load(
        "fibulaires",
        "medium",
      ),
      load(
        "intrinseques-pied",
        "high",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILITÉ / SOUPLESSE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "active-knee-wall",
    exerciseIds: [
      "mobilite-genou-mur",
    ],
    names: [
      "montée de genou active contre le mur",
      "active knee drive wall",
      "wall knee drive",
    ],
    keywords: [
      "montee genou",
      "knee drive",
    ],
    muscleLoads: [
      load(
        "ilio-psoas",
        "medium",
      ),
      load(
        "droit-femoral",
        "medium",
      ),
      load(
        "sartorius",
        "medium",
      ),
      load(
        "transverse-abdomen",
        "low",
      ),
    ],
  },

  {
    id: "single-leg-bridge",
    exerciseIds: [
      "pont-talon-sureleve",
    ],
    names: [
      "pont une jambe",
      "single leg bridge",
      "single leg glute bridge",
    ],
    keywords: [
      "pont",
      "bridge",
      "talon sureleve",
    ],
    muscleLoads: [
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "biceps-femoral",
        "medium",
      ),
      load(
        "semi-tendineux",
        "medium",
      ),
      load(
        "semi-membraneux",
        "medium",
      ),
      load(
        "erecteurs-rachis",
        "low",
      ),
    ],
  },

  {
    id: "wrist-flexor-stretch",
    exerciseIds: [
      "stretch-poignet-paume-avant",
    ],
    names: [
      "étirement fléchisseurs poignet",
      "stretch wrist flexors",
      "wrist flexor stretch",
    ],
    keywords: [
      "poignet",
      "paume avant",
      "flexor stretch",
    ],
    muscleLoads: [
      load(
        "flechisseurs-poignet",
        "low",
      ),
      load(
        "flechisseurs-doigts",
        "low",
      ),
    ],
  },

  {
    id: "wrist-extensor-stretch",
    exerciseIds: [
      "stretch-poignet-paume-soi",
    ],
    names: [
      "étirement extenseurs poignet",
      "stretch wrist extensors",
      "wrist extensor stretch",
    ],
    keywords: [
      "poignet",
      "paume soi",
      "extensor stretch",
    ],
    muscleLoads: [
      load(
        "extenseurs-poignet",
        "low",
      ),
      load(
        "extenseurs-doigts",
        "low",
      ),
    ],
  },

  {
    id: "shoulder-bench-stretch",
    exerciseIds: [
      "stretch-epaules-chaise",
      "child-pose-epaules",
    ],
    names: [
      "étirement épaules banc",
      "épaules sur chaise",
      "child pose épaules",
      "lat stretch bench",
      "shoulder bench stretch",
      "child pose",
    ],
    keywords: [
      "epaule",
      "chaise",
      "child pose",
      "lat stretch",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "low",
      ),
      load(
        "grand-rond",
        "low",
      ),
      load(
        "triceps-brachial",
        "low",
      ),
      load(
        "grand-pectoral-claviculaire",
        "low",
      ),
    ],
  },

  {
    id: "side-stretch",
    exerciseIds: [
      "stretch-lateral-debout",
    ],
    names: [
      "étirement latéral debout",
      "side bend stretch",
      "standing side stretch",
    ],
    keywords: [
      "lateral",
      "side stretch",
    ],
    muscleLoads: [
      load(
        "grand-dorsal",
        "low",
      ),
      load(
        "oblique-externe",
        "low",
      ),
      load(
        "carre-lombes",
        "low",
      ),
    ],
  },

  {
    id: "triceps-shoulder-stretch",
    exerciseIds: [
      "stretch-triceps-epaule",
    ],
    names: [
      "étirement triceps épaule",
      "overhead triceps stretch",
    ],
    keywords: [
      "triceps",
      "etirement",
    ],
    muscleLoads: [
      load(
        "triceps-brachial",
        "low",
      ),
      load(
        "grand-dorsal",
        "low",
      ),
    ],
  },

  {
    id: "cat-cow",
    exerciseIds: [
      "dos-rond-dos-creux",
    ],
    names: [
      "dos rond dos creux",
      "cat cow",
      "cat camel",
    ],
    keywords: [
      "dos rond",
      "cat cow",
    ],
    muscleLoads: [
      load(
        "erecteurs-rachis",
        "low",
      ),
      load(
        "multifides",
        "low",
      ),
      load(
        "droit-abdomen",
        "low",
      ),
    ],
  },

  {
    id: "deep-lunge-stretch",
    exerciseIds: [
      "fente-profonde",
    ],
    names: [
      "fente profonde",
      "hip flexor lunge stretch",
      "deep lunge stretch",
    ],
    keywords: [
      "fente profonde",
      "hip flexor",
    ],
    muscleLoads: [
      load(
        "ilio-psoas",
        "low",
      ),
      load(
        "droit-femoral",
        "low",
      ),
      load(
        "grand-adducteur",
        "low",
      ),
    ],
  },

  {
    id: "butterfly-stretch",
    exerciseIds: [
      "papillon",
      "grenouille",
    ],
    names: [
      "papillon",
      "butterfly stretch",
      "grenouille",
      "frog stretch",
      "frog pose",
      "adductor stretch",
    ],
    keywords: [
      "papillon",
      "grenouille",
      "frog",
      "adducteur",
    ],
    muscleLoads: [
      load(
        "long-adducteur",
        "low",
      ),
      load(
        "court-adducteur",
        "low",
      ),
      load(
        "grand-adducteur",
        "low",
      ),
      load(
        "gracile",
        "low",
      ),
      load(
        "pectine",
        "low",
      ),
    ],
  },

  {
    id: "glute-stretch",
    exerciseIds: [
      "stretch-fessier-allonge",
      "stretch-fessier-assis",
    ],
    names: [
      "étirement fessier",
      "figure four stretch",
      "glute stretch",
      "piriformis stretch",
    ],
    keywords: [
      "fessier",
      "figure four",
      "glute stretch",
    ],
    muscleLoads: [
      load(
        "grand-fessier",
        "low",
      ),
      load(
        "moyen-fessier",
        "low",
      ),
      load(
        "petit-fessier",
        "low",
      ),
    ],
  },

  {
    id: "quad-stretch",
    exerciseIds: [
      "stretch-quadriceps-debout",
    ],
    names: [
      "étirement quadriceps",
      "quad stretch",
      "standing quad stretch",
    ],
    keywords: [
      "quadriceps",
      "quad stretch",
    ],
    muscleLoads: [
      load(
        "droit-femoral",
        "low",
      ),
      load(
        "vaste-lateral",
        "low",
      ),
      load(
        "vaste-medial",
        "low",
      ),
    ],
  },

  {
    id: "hamstring-stretch",
    exerciseIds: [
      "ischios-debout-assis",
      "stretch-arriere-jambe-assis",
    ],
    names: [
      "étirement ischio",
      "hamstring stretch",
      "ischios debout",
      "ischios assis",
      "étirement arrière jambe",
    ],
    keywords: [
      "ischio",
      "hamstring",
      "arriere jambe",
    ],
    muscleLoads: [
      load(
        "biceps-femoral",
        "low",
      ),
      load(
        "semi-tendineux",
        "low",
      ),
      load(
        "semi-membraneux",
        "low",
      ),
    ],
  },

  {
    id: "calf-stretch",
    exerciseIds: [
      "stretch-mollet-mur",
    ],
    names: [
      "étirement mollet",
      "calf stretch",
      "gastrocnemius stretch",
    ],
    keywords: [
      "mollet",
      "calf stretch",
    ],
    muscleLoads: [
      load(
        "gastrocnemien",
        "low",
      ),
      load(
        "soleaire",
        "low",
      ),
    ],
  },

  {
    id: "soleus-stretch",
    exerciseIds: [
      "stretch-mollet-jambe-pliee",
    ],
    names: [
      "étirement soléaire",
      "soleus stretch",
      "bent knee calf stretch",
    ],
    keywords: [
      "soleaire",
      "jambe pliee",
      "bent knee calf",
    ],
    muscleLoads: [
      load(
        "soleaire",
        "low",
      ),
    ],
  },

  {
    id: "ankle-mobility",
    exerciseIds: [
      "mobilite-cheville-chapeau-mexicain",
    ],
    names: [
      "mobilité cheville",
      "ankle mobility",
      "ankle circles",
      "cheville équilibre",
    ],
    keywords: [
      "cheville",
      "ankle mobility",
    ],
    muscleLoads: [
      load(
        "tibial-anterieur",
        "low",
      ),
      load(
        "tibial-posterieur",
        "low",
      ),
      load(
        "fibulaires",
        "low",
      ),
      load(
        "gastrocnemien",
        "low",
      ),
      load(
        "soleaire",
        "low",
      ),
      load(
        "intrinseques-pied",
        "low",
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTRES EXERCICES COURANTS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "biceps-curl",
    names: [
      "curl biceps",
      "biceps curl",
      "dumbbell curl",
      "hammer curl",
      "curl haltère",
    ],
    keywords: [
      "curl",
      "biceps",
    ],
    muscleLoads: [
      load(
        "biceps-brachial",
        "high",
      ),
      load(
        "brachial",
        "high",
      ),
      load(
        "brachioradial",
        "medium",
      ),
      load(
        "flechisseurs-poignet",
        "low",
      ),
    ],
  },

  {
    id: "hammer-curl",
    names: [
      "curl marteau",
      "hammer curl",
      "neutral grip curl",
    ],
    keywords: [
      "marteau",
      "hammer curl",
    ],
    muscleLoads: [
      load(
        "brachioradial",
        "high",
      ),
      load(
        "brachial",
        "high",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
    ],
  },

  {
    id: "shrug",
    names: [
      "shrug",
      "shrugs",
      "haussement épaules",
      "barbell shrug",
      "dumbbell shrug",
    ],
    keywords: [
      "shrug",
      "haussement",
    ],
    muscleLoads: [
      load(
        "trapeze-superieur",
        "high",
      ),
      load(
        "trapeze-moyen",
        "medium",
      ),
      load(
        "flechisseurs-doigts",
        "medium",
      ),
    ],
  },

  {
    id: "farmer-walk",
    names: [
      "farmer walk",
      "farmer carry",
      "marche fermier",
      "farmer's walk",
    ],
    keywords: [
      "farmer",
      "carry",
    ],
    muscleLoads: [
      load(
        "flechisseurs-doigts",
        "high",
      ),
      load(
        "flechisseurs-poignet",
        "high",
      ),
      load(
        "trapeze-superieur",
        "high",
      ),
      load(
        "erecteurs-rachis",
        "medium",
      ),
      load(
        "transverse-abdomen",
        "medium",
      ),
      load(
        "grand-fessier",
        "medium",
      ),
      load(
        "droit-femoral",
        "medium",
      ),
      load(
        "gastrocnemien",
        "medium",
      ),
    ],
  },

  {
    id: "leg-press",
    names: [
      "leg press",
      "presse à cuisses",
      "presse jambes",
    ],
    keywords: [
      "leg press",
      "presse",
    ],
    muscleLoads: [
      load(
        "droit-femoral",
        "high",
      ),
      load(
        "vaste-lateral",
        "high",
      ),
      load(
        "vaste-medial",
        "high",
      ),
      load(
        "grand-fessier",
        "high",
      ),
      load(
        "grand-adducteur",
        "medium",
      ),
      load(
        "biceps-femoral",
        "medium",
      ),
    ],
  },

  {
    id: "leg-extension",
    names: [
      "leg extension",
      "extension quadriceps",
      "extension jambes machine",
    ],
    keywords: [
      "leg extension",
      "quadriceps machine",
    ],
    muscleLoads: [
      load(
        "droit-femoral",
        "high",
      ),
      load(
        "vaste-lateral",
        "high",
      ),
      load(
        "vaste-medial",
        "high",
      ),
      load(
        "vaste-intermediaire",
        "high",
      ),
    ],
  },

  {
    id: "leg-curl",
    names: [
      "leg curl",
      "curl ischio",
      "hamstring curl",
      "lying leg curl",
      "seated leg curl",
    ],
    keywords: [
      "leg curl",
      "hamstring curl",
    ],
    muscleLoads: [
      load(
        "biceps-femoral",
        "high",
      ),
      load(
        "semi-tendineux",
        "high",
      ),
      load(
        "semi-membraneux",
        "high",
      ),
      load(
        "gastrocnemien",
        "low",
      ),
    ],
  },

  {
    id: "chest-fly",
    names: [
      "écarté pectoraux",
      "ecarte pectoraux",
      "chest fly",
      "dumbbell fly",
      "pec deck",
    ],
    keywords: [
      "fly",
      "ecarte",
      "pec deck",
    ],
    muscleLoads: [
      load(
        "grand-pectoral-sternal",
        "high",
      ),
      load(
        "grand-pectoral-claviculaire",
        "medium",
      ),
      load(
        "deltoide-anterieur",
        "low",
      ),
    ],
  },

  {
    id: "cable-fly",
    names: [
      "cable fly",
      "crossover poulie",
      "cable crossover",
      "écarté poulie",
    ],
    keywords: [
      "crossover",
      "cable fly",
      "ecarte poulie",
    ],
    muscleLoads: [
      load(
        "grand-pectoral-sternal",
        "high",
      ),
      load(
        "grand-pectoral-claviculaire",
        "medium",
      ),
      load(
        "dentelé-anterieur",
        "low",
      ),
    ],
  },

  {
    id: "upright-row",
    names: [
      "tirage menton",
      "upright row",
      "rowing menton",
    ],
    keywords: [
      "upright row",
      "tirage menton",
    ],
    muscleLoads: [
      load(
        "deltoide-lateral",
        "high",
      ),
      load(
        "trapeze-superieur",
        "high",
      ),
      load(
        "biceps-brachial",
        "medium",
      ),
      load(
        "brachioradial",
        "medium",
      ),
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Recherche exacte par ID
// ─────────────────────────────────────────────────────────────────────────────

export function getMuscleLoadsForExerciseId(
  exerciseId: string,
): ExerciseMuscleLoad[] | null {
  const entry =
    EXERCISE_MUSCLE_LIBRARY.find(
      (current) =>
        current.exerciseIds?.includes(
          exerciseId,
        ),
    );

  if (
    !entry
  ) {
    return null;
  }

  return uniqueMuscleLoads(
    entry.muscleLoads,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring texte
// ─────────────────────────────────────────────────────────────────────────────

function scoreEntry(
  entry: ExerciseMuscleLibraryEntry,
  name: string,
  description: string,
): number {
  const normalizedName =
    normalizeText(
      name,
    );

  const normalizedDescription =
    normalizeText(
      description,
    );

  const combined =
    `${normalizedName} ${normalizedDescription}`.trim();

  if (
    !combined
  ) {
    return 0;
  }

  let score = 0;

  /*
   * Correspondance exacte du nom :
   * très forte confiance.
   */
  entry.names.forEach(
    (candidate) => {
      const normalizedCandidate =
        normalizeText(
          candidate,
        );

      if (
        !normalizedCandidate
      ) {
        return;
      }

      if (
        normalizedName ===
        normalizedCandidate
      ) {
        score += 100;
        return;
      }

      if (
        normalizedName.includes(
          normalizedCandidate,
        )
      ) {
        score += 65;
        return;
      }

      if (
        combined.includes(
          normalizedCandidate,
        )
      ) {
        score += 45;
      }
    },
  );

  /*
   * Mots-clés.
   */
  (
    entry.keywords ??
    []
  ).forEach(
    (keyword) => {
      const normalizedKeyword =
        normalizeText(
          keyword,
        );

      if (
        normalizedName.includes(
          normalizedKeyword,
        )
      ) {
        score += 22;
      } else if (
        normalizedDescription.includes(
          normalizedKeyword,
        )
      ) {
        score += 12;
      }
    },
  );

  /*
   * Similarité par mots.
   *
   * Utile pour des formulations comme :
   * "tirage haltère à un bras"
   * alors que la bibliothèque contient
   * "rowing haltère".
   */
  const inputTokens =
    new Set(
      tokenize(
        combined,
      ),
    );

  const entryTokens =
    new Set(
      tokenize(
        [
          ...entry.names,
          ...(entry.keywords ??
            []),
        ].join(
          " ",
        ),
      ),
    );

  let commonTokens = 0;

  entryTokens.forEach(
    (token) => {
      if (
        inputTokens.has(
          token,
        )
      ) {
        commonTokens += 1;
      }
    },
  );

  score +=
    commonTokens * 5;

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion automatique
// ─────────────────────────────────────────────────────────────────────────────

export function suggestMusclesForExercise(
  name: string,
  description = "",
): MuscleSuggestion {
  const scored =
    EXERCISE_MUSCLE_LIBRARY.map(
      (entry) => ({
        entry,
        score:
          scoreEntry(
            entry,
            name,
            description,
          ),
      }),
    )
      .filter(
        (result) =>
          result.score >
          0,
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.score -
          first.score,
      );

  const best =
    scored[0];

  if (
    !best ||
    best.score < 15
  ) {
    return {
      matchedExerciseId:
        null,

      matchedName:
        null,

      confidence:
        "low",

      score:
        best?.score ??
        0,

      muscleLoads:
        [],
    };
  }

  const second =
    scored[1];

  const difference =
    second
      ? best.score -
        second.score
      : best.score;

  let confidence:
    MuscleSuggestionConfidence =
      "low";

  if (
    best.score >=
      65 &&
    difference >=
      15
  ) {
    confidence =
      "high";
  } else if (
    best.score >=
      30 &&
    difference >=
      5
  ) {
    confidence =
      "medium";
  }

  /*
   * En confiance faible, on ne remplit pas
   * automatiquement les muscles.
   *
   * L'interface pourra afficher :
   * "Je ne suis pas sûr"
   * et laisser l'utilisateur choisir.
   */
  if (
    confidence ===
    "low"
  ) {
    return {
      matchedExerciseId:
        best.entry.id,

      matchedName:
        best.entry.names[0] ??
        null,

      confidence,

      score:
        best.score,

      muscleLoads:
        [],
    };
  }

  return {
    matchedExerciseId:
      best.entry.id,

    matchedName:
      best.entry.names[0] ??
      null,

    confidence,

    score:
      best.score,

    muscleLoads:
      uniqueMuscleLoads(
        best.entry.muscleLoads,
      ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper principal utilisé par l'application
// ─────────────────────────────────────────────────────────────────────────────

export function resolveExerciseMuscleLoads({
  exerciseId,
  name,
  description,
  savedMuscleLoads,
}: {
  exerciseId?: string;
  name: string;
  description?: string;
  savedMuscleLoads?: ExerciseMuscleLoad[];
}): ExerciseMuscleLoad[] {
  /*
   * 1. Un choix enregistré manuellement a toujours priorité.
   */
  if (
    savedMuscleLoads &&
    savedMuscleLoads.length >
      0
  ) {
    return uniqueMuscleLoads(
      savedMuscleLoads,
    );
  }

  /*
   * 2. Exercice natif connu.
   */
  if (
    exerciseId
  ) {
    const exact =
      getMuscleLoadsForExerciseId(
        exerciseId,
      );

    if (
      exact &&
      exact.length >
        0
    ) {
      return exact;
    }
  }

  /*
   * 3. Exercice personnalisé :
   * essayer de reconnaître le mouvement.
   */
  const suggestion =
    suggestMusclesForExercise(
      name,
      description ??
        "",
    );

  if (
    suggestion.confidence ===
      "low"
  ) {
    return [];
  }

  return suggestion.muscleLoads;
}