import {
  SESSIONS,
} from "@/data/sessions";

import type {
  ExerciseDef,
  ExerciseMuscleLoad,
  TrackingType,
} from "@/data/sessions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ExerciseOverrideLike = {
  hidden?: boolean;

  name?: string;
  description?: string;
  category?: string;
  tracking?: TrackingType;

  sessionIds?: string[];

  /*
   * Profil musculaire personnalisé.
   *
   * [] est volontairement accepté :
   * cela signifie qu'aucun muscle n'est
   * actuellement attribué à l'exercice.
   */
  muscleLoads?: ExerciseMuscleLoad[];

  assistanceOptions?: ExerciseDef["assistanceOptions"];

  isHangboard?: boolean;

  variantOptions?: ExerciseDef["variantOptions"];

  bandOptions?: ExerciseDef["bandOptions"];

  totalWeight?: boolean;

  perSide?: boolean;

  primaryRepsLabel?: string;
  secondaryRepsLabel?: string;

  primaryWeightLabel?: string;
  secondaryWeightLabel?: string;
};

type ExerciseDataLike = {
  customExercises?: ExerciseDef[];

  exerciseOverrides?: Record<
    string,
    ExerciseOverrideLike | undefined
  >;

  customCategories?: string[];

  exerciseCategoryOrder?: Record<
    string,
    string[] | undefined
  >;
};

// ─────────────────────────────────────────────────────────────────────────────
// Types de suivi
// ─────────────────────────────────────────────────────────────────────────────

export const TRACKING_TYPES: TrackingType[] = [
  "none",
  "reps",
  "duration",
  "weight",
  "weight+reps",
  "weight+duration",
  "reps+duration",
  "weight+reps+duration",
  "assistance",
  "duration+assistance",
  "duration+band",
  "dual-reps+weight",
  "dual-reps+dual-weight",
  "variant+reps",
  "variant+weight+duration",
];

export const TRACKING_LABELS: Record<
  TrackingType,
  string
> = {
  none:
    "Aucun suivi",

  reps:
    "Répétitions",

  duration:
    "Durée",

  weight:
    "Charge",

  "weight+reps":
    "Charge + répétitions",

  "weight+duration":
    "Charge + durée",

  "reps+duration":
    "Répétitions + durée",

  "weight+reps+duration":
    "Charge + répétitions + durée",

  assistance:
    "Assistance + répétitions + durée",

  "duration+assistance":
    "Durée + assistance",

  "duration+band":
    "Durée + élastique",

  "dual-reps+weight":
    "Deux répétitions + une charge",

  "dual-reps+dual-weight":
    "Deux répétitions + deux charges",

  "variant+reps":
    "Variante + répétitions",

  "variant+weight+duration":
    "Variante + charge + durée",
};

// ─────────────────────────────────────────────────────────────────────────────
// Catégories
// ─────────────────────────────────────────────────────────────────────────────

export const BUILTIN_CATEGORIES: string[] = [
  "Doigts",
  "Puissance",
  "Résistance",
  "Dos",
  "Épaules",
  "Pectoraux",
  "Bras",
  "Gainage",
  "Jambes",
  "Prévention",
  "Souplesse / mobilité",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function uniqueById(
  exercises: ExerciseDef[],
): ExerciseDef[] {
  const result =
    new Map<
      string,
      ExerciseDef
    >();

  exercises.forEach(
    (
      exercise,
    ) => {
      /*
       * Le dernier exercice portant cet ID gagne.
       *
       * Cela évite les doublons tout en conservant
       * le même identifiant historique.
       */
      result.set(
        exercise.id,
        exercise,
      );
    },
  );

  return Array.from(
    result.values(),
  );
}

function cloneMuscleLoads(
  muscleLoads:
    | ExerciseMuscleLoad[]
    | undefined,
): ExerciseMuscleLoad[] | undefined {
  if (
    muscleLoads ===
    undefined
  ) {
    return undefined;
  }

  return muscleLoads.map(
    (
      muscleLoad,
    ) => ({
      ...muscleLoad,
    }),
  );
}

/**
 * Appliquer les modifications enregistrées
 * sans perdre les propriétés de l'exercice original.
 *
 * L'ID n'est volontairement jamais présent
 * dans les overrides.
 */
function applyOverride(
  exercise: ExerciseDef,
  override?: ExerciseOverrideLike,
): ExerciseDef {
  if (
    !override
  ) {
    return exercise;
  }

  return {
    ...exercise,

    /*
     * Pour le nom et la catégorie,
     * ignorer une chaîne vide accidentelle.
     */
    name:
      typeof override.name ===
        "string" &&
      override.name.trim()
        ? override.name.trim()
        : exercise.name,

    /*
     * Une description vide est autorisée.
     */
    description:
      typeof override.description ===
        "string"
        ? override.description
        : exercise.description,

    category:
      typeof override.category ===
        "string" &&
      override.category.trim()
        ? override.category.trim()
        : exercise.category,

    tracking:
      override.tracking ??
      exercise.tracking,

    /*
     * [] est une valeur valide :
     * cela signifie volontairement
     * "aucune séance".
     */
    sessionIds:
      override.sessionIds !==
      undefined
        ? [
            ...override.sessionIds,
          ]
        : exercise.sessionIds,

    /*
     * Même principe pour les muscles :
     *
     * undefined = garder le profil précédent ;
     * []        = aucun muscle attribué ;
     * tableau   = utiliser exactement ce profil.
     */
    muscleLoads:
      override.muscleLoads !==
      undefined
        ? cloneMuscleLoads(
            override.muscleLoads,
          )
        : cloneMuscleLoads(
            exercise.muscleLoads,
          ),

    assistanceOptions:
      override.assistanceOptions !==
      undefined
        ? [
            ...override.assistanceOptions,
          ]
        : exercise.assistanceOptions,

    isHangboard:
      override.isHangboard !==
      undefined
        ? override.isHangboard
        : exercise.isHangboard,

    variantOptions:
      override.variantOptions !==
      undefined
        ? [
            ...override.variantOptions,
          ]
        : exercise.variantOptions,

    bandOptions:
      override.bandOptions !==
      undefined
        ? [
            ...override.bandOptions,
          ]
        : exercise.bandOptions,

    totalWeight:
      override.totalWeight !==
      undefined
        ? override.totalWeight
        : exercise.totalWeight,

    perSide:
      override.perSide !==
      undefined
        ? override.perSide
        : exercise.perSide,

    /*
     * Les labels peuvent volontairement être
     * supprimés : chaîne vide = aucun label.
     */
    primaryRepsLabel:
      override.primaryRepsLabel !==
      undefined
        ? override.primaryRepsLabel
        : exercise.primaryRepsLabel,

    secondaryRepsLabel:
      override.secondaryRepsLabel !==
      undefined
        ? override.secondaryRepsLabel
        : exercise.secondaryRepsLabel,

    primaryWeightLabel:
      override.primaryWeightLabel !==
      undefined
        ? override.primaryWeightLabel
        : exercise.primaryWeightLabel,

    secondaryWeightLabel:
      override.secondaryWeightLabel !==
      undefined
        ? override.secondaryWeightLabel
        : exercise.secondaryWeightLabel,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exercices intégrés
// ─────────────────────────────────────────────────────────────────────────────

export function getBuiltinExercises(): ExerciseDef[] {
  return uniqueById(
    SESSIONS.flatMap(
      (
        session,
      ) =>
        session.exercises,
    ),
  );
}

/*
 * Alias conservé pour compatibilité
 * avec les anciens imports.
 */
export function getBuiltInExercises(): ExerciseDef[] {
  return getBuiltinExercises();
}

export const BUILTIN_EXERCISES =
  getBuiltinExercises();

// ─────────────────────────────────────────────────────────────────────────────
// Tous les exercices gérés
// ─────────────────────────────────────────────────────────────────────────────

export function getAllManagedExercises(
  data: ExerciseDataLike,
): ExerciseDef[] {
  const overrides =
    data.exerciseOverrides ??
    {};

  const builtinExercises =
    getBuiltinExercises().map(
      (
        exercise,
      ) =>
        applyOverride(
          exercise,
          overrides[
            exercise.id
          ],
        ),
    );

  const customExercises =
    (
      data.customExercises ??
      []
    ).map(
      (
        exercise,
      ) =>
        applyOverride(
          exercise,
          overrides[
            exercise.id
          ],
        ),
    );

  return uniqueById([
    ...builtinExercises,
    ...customExercises,
  ]);
}

export function getAllExercises(
  data: ExerciseDataLike,
): ExerciseDef[] {
  return getAllManagedExercises(
    data,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Catégories disponibles
// ─────────────────────────────────────────────────────────────────────────────

export function getAllCategories(
  data: ExerciseDataLike,
): string[] {
  const categories =
    new Set<string>(
      BUILTIN_CATEGORIES,
    );

  (
    data.customCategories ??
    []
  ).forEach(
    (
      category,
    ) => {
      const trimmed =
        category.trim();

      if (
        trimmed
      ) {
        categories.add(
          trimmed,
        );
      }
    },
  );

  /*
   * Inclure également les catégories obtenues
   * après application des overrides.
   */
  getAllManagedExercises(
    data,
  ).forEach(
    (
      exercise,
    ) => {
      const category =
        exercise.category.trim();

      if (
        category
      ) {
        categories.add(
          category,
        );
      }
    },
  );

  /*
   * Conserver une catégorie qui possède
   * encore un ordre personnalisé sauvegardé.
   */
  Object.keys(
    data.exerciseCategoryOrder ??
      {},
  ).forEach(
    (
      category,
    ) => {
      const trimmed =
        category.trim();

      if (
        trimmed
      ) {
        categories.add(
          trimmed,
        );
      }
    },
  );

  return Array.from(
    categories,
  );
}

export function getExerciseCategories(
  data: ExerciseDataLike,
): string[] {
  return getAllCategories(
    data,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visibilité
// ─────────────────────────────────────────────────────────────────────────────

export function isExerciseHidden(
  exerciseId: string,
  data: ExerciseDataLike,
): boolean {
  return (
    data.exerciseOverrides?.[
      exerciseId
    ]?.hidden ===
    true
  );
}

export function getVisibleExercises(
  data: ExerciseDataLike,
): ExerciseDef[] {
  return getAllManagedExercises(
    data,
  ).filter(
    (
      exercise,
    ) =>
      !isExerciseHidden(
        exercise.id,
        data,
      ),
  );
}

export function getHiddenExercises(
  data: ExerciseDataLike,
): ExerciseDef[] {
  return getAllManagedExercises(
    data,
  ).filter(
    (
      exercise,
    ) =>
      isExerciseHidden(
        exercise.id,
        data,
      ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Séances associées
// ─────────────────────────────────────────────────────────────────────────────

export function getExerciseSessionIds(
  exerciseId: string,
  data: ExerciseDataLike,
): string[] {
  const override =
    data.exerciseOverrides?.[
      exerciseId
    ];

  /*
   * Ne surtout pas écrire :
   *
   * if (override?.sessionIds)
   *
   * car [] est volontairement une valeur valide :
   * aucune séance.
   */
  if (
    override?.sessionIds !==
    undefined
  ) {
    return [
      ...override.sessionIds,
    ];
  }

  const customExercise =
    (
      data.customExercises ??
      []
    ).find(
      (
        exercise,
      ) =>
        exercise.id ===
        exerciseId,
    );

  if (
    customExercise
  ) {
    return [
      ...(
        customExercise.sessionIds ??
        []
      ),
    ];
  }

  /*
   * Pour les exercices intégrés,
   * reconstruire leurs séances d'origine
   * directement depuis SESSIONS.
   */
  return SESSIONS.filter(
    (
      session,
    ) =>
      session.exercises.some(
        (
          exercise,
        ) =>
          exercise.id ===
          exerciseId,
      ),
  ).map(
    (
      session,
    ) =>
      session.id,
  );
}

export function getSessionIdsForExercise(
  exerciseId: string,
  data: ExerciseDataLike,
): string[] {
  return getExerciseSessionIds(
    exerciseId,
    data,
  );
}

/*
 * Source unique pour déterminer ce qui appartient
 * réellement à une séance.
 *
 * Utiliser cette fonction partout où l'application
 * doit reconstruire une séance avec les modifications
 * locales de l'utilisateur.
 */
export function getExercisesForSession(
  sessionId: string,
  data: ExerciseDataLike,
): ExerciseDef[] {
  return getAllManagedExercises(
    data,
  ).filter(
    (
      exercise,
    ) => {
      if (
        isExerciseHidden(
          exercise.id,
          data,
        )
      ) {
        return false;
      }

      return getExerciseSessionIds(
        exercise.id,
        data,
      ).includes(
        sessionId,
      );
    },
  );
}

export function getSessionExercises(
  sessionId: string,
  data: ExerciseDataLike,
): ExerciseDef[] {
  return getExercisesForSession(
    sessionId,
    data,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recherche d'un exercice
// ─────────────────────────────────────────────────────────────────────────────

export function getExerciseById(
  exerciseId: string,
  data: ExerciseDataLike,
): ExerciseDef | undefined {
  return getAllManagedExercises(
    data,
  ).find(
    (
      exercise,
    ) =>
      exercise.id ===
      exerciseId,
  );
}

export function findExerciseById(
  exerciseId: string,
  data: ExerciseDataLike,
): ExerciseDef | undefined {
  return getExerciseById(
    exerciseId,
    data,
  );
}

export function isBuiltinExercise(
  exerciseId: string,
): boolean {
  return BUILTIN_EXERCISES.some(
    (
      exercise,
    ) =>
      exercise.id ===
      exerciseId,
  );
}

export function isBuiltInExercise(
  exerciseId: string,
): boolean {
  return isBuiltinExercise(
    exerciseId,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Identifiants
// ─────────────────────────────────────────────────────────────────────────────

export function createExerciseId(
  name: string,
): string {
  const normalized =
    name
      .trim()
      .toLowerCase()
      .normalize(
        "NFD",
      )
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );

  return (
    normalized ||
    `exercice-${Date.now()}`
  );
}

export function makeExerciseId(
  name: string,
): string {
  return createExerciseId(
    name,
  );
}

export function createUniqueExerciseId(
  name: string,
  existingExercises: ExerciseDef[],
): string {
  const baseId =
    createExerciseId(
      name,
    );

  const ids =
    new Set(
      existingExercises.map(
        (
          exercise,
        ) =>
          exercise.id,
      ),
    );

  if (
    !ids.has(
      baseId,
    )
  ) {
    return baseId;
  }

  let suffix =
    2;

  while (
    ids.has(
      `${baseId}-${suffix}`,
    )
  ) {
    suffix +=
      1;
  }

  return `${baseId}-${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recherche textuelle
// ─────────────────────────────────────────────────────────────────────────────

export function searchExercises(
  exercises: ExerciseDef[],
  query: string,
): ExerciseDef[] {
  const normalizedQuery =
    query
      .trim()
      .toLowerCase()
      .normalize(
        "NFD",
      )
      .replace(
        /[\u0300-\u036f]/g,
        "",
      );

  if (
    !normalizedQuery
  ) {
    return exercises;
  }

  return exercises.filter(
    (
      exercise,
    ) => {
      const searchable =
        `${exercise.name} ${exercise.description} ${exercise.category}`
          .toLowerCase()
          .normalize(
            "NFD",
          )
          .replace(
            /[\u0300-\u036f]/g,
            "",
          );

      return searchable.includes(
        normalizedQuery,
      );
    },
  );
}