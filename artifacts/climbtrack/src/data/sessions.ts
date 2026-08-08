import type {
  ExerciseDefaults,
  ResistanceBandColor,
} from "../context/ClimbTrackContext";

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
}

export interface SessionDef {
  id: string;
  name: string;
  moment: string;
  exercises: ExerciseDef[];
}

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

export const SESSIONS: SessionDef[] = [
  {
    id: "s1-force-doigts",
    name: "FORCE DOIGTS / PUISSANCE",
    moment:
      "À réaliser avant la grimpe, après 20 à 30 minutes d’échauffement facile.",

    exercises: [
      {
        id: "suspension-20mm",
        name: "Suspension semi-arche 20 mm",
        description:
          "Se suspendre en semi-arche sur une réglette de 20 mm. Garder les épaules engagées et arrêter en cas de douleur vive aux doigts.",
        category: "Suspensions",
        tracking: "duration+assistance",
        isHangboard: true,

        defaultValues: {
          sets: 5,
          duration: 10,
          restSeconds: 180,
          assistance:
            "Deux pieds au sol, appui moyen",
        },

        assistanceOptions:
          ASSISTANCE_OPTIONS,
      },

      {
        id: "suspension-slopers",
        name: "Suspensions sur plats",
        description:
          "Se suspendre sur les plats à 35°, 38° ou 43°. Garder les doigts ouverts, les épaules engagées et les bras presque tendus.",
        category: "Suspensions",
        tracking: "duration",
        isHangboard: true,

        defaultValues: {
          sets: 6,
          duration: 10,
          progressionValue: 35,
          restSeconds: 150,
        },
      },

      {
        id: "sauts-prise",
        name: "Croisé dynamique — grandes prises",
        description:
          "Partir d’une grande prise puis réaliser un mouvement croisé explosif vers une prise plus haute. Travailler séparément la main gauche et la main droite.",
        category: "Préhension",
        tracking: "variant+reps",

        variantOptions: [
          "Pieds sur le mur",
          "Pieds libres",
        ],

        defaultValues: {
          sets: 5,
          reps: 3,
          restSeconds: 60,
        },
      },

      {
        id: "croise-dynamique-19-30",
        name: "Croisé dynamique — prises 19/30",
        description:
          "Partir d’une grande prise et attraper dynamiquement une petite prise 19/30 située environ cinq prises plus haut. Commencer avec les pieds sur le mur.",
        category: "Préhension",
        tracking: "variant+reps",

        variantOptions: [
          "Pieds sur le mur",
          "Pieds libres",
        ],

        defaultValues: {
          sets: 3,
          reps: 3,
          progressionValue: 5,
          restSeconds: 120,
        },
      },

      {
        id: "lourd-leger",
        name: "Tractions lourd-léger",
        description:
          "Réaliser 3 tractions lourdes, puis immédiatement 3 tractions légères et explosives. Enregistrer séparément les deux charges.",
        category: "Tractions",
        tracking:
          "dual-reps+dual-weight",

        primaryRepsLabel:
          "Répétitions lourdes",

        secondaryRepsLabel:
          "Répétitions légères",

        primaryWeightLabel:
          "Charge lourde ajoutée",

        secondaryWeightLabel:
          "Charge légère ajoutée",

        defaultValues: {
          sets: 3,
          reps: 3,
          secondaryReps: 3,
          weight: 10,
          secondaryWeight: 0,
          restSeconds: 180,
        },
      },

      {
        id: "pince-disque",
        name: "Petite pince avec poids suspendu",
        description:
          "Pincer la petite prise avec le pouce et les doigts pendant que le poids reste suspendu. Enregistrer la charge totale attachée.",
        category: "Préhension",
        tracking:
          "variant+weight+duration",
        totalWeight: true,

        variantOptions: [
          "Petite pince",
        ],

        defaultValues: {
          sets: 3,
          weight: 2.5,
          duration: 15,
          restSeconds: 150,
        },
      },

      {
        id: "pince-large",
        name: "Grande pince avec poids suspendu",
        description:
          "Pincer la grande prise avec le pouce et les doigts pendant que le poids reste suspendu. Suivre séparément la progression de chaque taille de pince.",
        category: "Préhension",
        tracking:
          "variant+weight+duration",
        totalWeight: true,

        variantOptions: [
          "Grande pince",
        ],

        defaultValues: {
          sets: 3,
          weight: 5,
          duration: 15,
          restSeconds: 150,
        },
      },
    ],
  },

  {
    id: "s2-resistance",
    name: "RÉSISTANCE MUSCULAIRE",
    moment:
      "À réaliser après la grimpe ou comme séance principale sans blocs très difficiles.",

    exercises: [
      {
        id: "repeaters-7-3",
        name: "Repeaters 7/3 sur bacs",
        description:
          "Utiliser deux bacs confortables. Se suspendre pendant 7 secondes, poser pendant 3 secondes et répéter 10 fois. Garder les épaules légèrement engagées.",
        category: "Suspensions",
        tracking: "assistance",
        isHangboard: true,

        defaultValues: {
          sets: 3,
          reps: 10,
          duration: 7,
          restSeconds: 180,
          assistance:
            "Deux pieds au sol, appui moyen",
        },

        assistanceOptions:
          ASSISTANCE_OPTIONS,
      },

      {
        id: "blocs-devers",
        name: "Blocs en dévers",
        description:
          "Choisir un bloc adapté au niveau actuel et réaliser trois essais par série sans atteindre systématiquement l’échec.",
        category: "Préhension",
        tracking: "reps",

        defaultValues: {
          sets: 2,
          reps: 3,
          restSeconds: 180,
        },
      },

      {
        id: "traversees-longues",
        name: "Traversées longues",
        description:
          "Réaliser une traversée facile ou moyenne sans descendre pendant environ 3 à 5 minutes.",
        category: "Préhension",
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
          "Réaliser des tractions propres en conservant une à deux répétitions en réserve.",
        category: "Tractions",
        tracking: "reps",

        defaultValues: {
          sets: 5,
          reps: 6,
          restSeconds: 60,
        },
      },

      {
        id: "suspension-facile",
        name: "Suspension longue sur bacs",
        description:
          "Se suspendre sur deux bacs confortables avec les bras tendus et les épaules légèrement engagées.",
        category: "Suspensions",
        tracking: "duration",

        defaultValues: {
          sets: 4,
          duration: 30,
          restSeconds: 60,
        },
      },

      {
        id: "dead-hang",
        name: "Dead hang 25 mm — un pied au sol",
        description:
          "Se suspendre à deux mains sur une réglette de 25 mm en gardant un pied au sol pour contrôler l’assistance. Garder les épaules légèrement engagées.",
        category: "Suspensions",
        tracking: "duration+assistance",
        isHangboard: true,

        assistanceOptions:
          ASSISTANCE_OPTIONS,

        defaultValues: {
          sets: 3,
          duration: 20,
          restSeconds: 120,
          assistance:
            "Un pied au sol",
        },
      },
    ],
  },

  {
    id: "s3-dos-epaules",
    name: "HAUT DU CORPS / FORCE",
    moment:
      "À réaliser après une grimpe légère ou comme séance séparée.",

    exercises: [
      {
        id: "tractions-lestees",
        name: "Tractions lestées",
        description:
          "Utiliser une charge permettant environ 7 répétitions maximales et s’arrêter avant l’échec.",
        category: "Tractions",
        tracking: "weight+reps",

        defaultValues: {
          sets: 3,
          reps: 6,
          weight: 10,
          restSeconds: 180,
        },
      },

      {
        id: "blocages",
        name: "Blocages",
        description:
          "Maintenir un blocage pendant 12 secondes, puis réaliser 2 tractions propres sans balancer le corps.",
        category: "Tractions",
        tracking: "reps+duration",

        defaultValues: {
          sets: 3,
          reps: 2,
          duration: 12,
          restSeconds: 180,
        },
      },

      {
        id: "rowing-haltere",
        name: "Rowing haltère",
        description:
          "Incliner le buste en gardant le dos neutre. Tirer l’haltère vers les côtes. Enregistrer la charge d’un seul haltère.",
        category: "Musculation",
        tracking: "weight+reps",

        defaultValues: {
          sets: 3,
          reps: 10,
          weight: 15,
          restSeconds: 120,
        },
      },

      {
        id: "lat-pulldown",
        name: "Lat pulldown derrière + devant",
        description:
          "Réaliser 8 répétitions derrière la tête puis 8 répétitions devant la poitrine. Utiliser une charge légère derrière la tête et arrêter en cas d’inconfort à l’épaule.",
        category: "Musculation",
        tracking:
          "dual-reps+weight",
        totalWeight: true,

        primaryRepsLabel:
          "Répétitions derrière",

        secondaryRepsLabel:
          "Répétitions devant",

        primaryWeightLabel:
          "Charge de la machine",

        defaultValues: {
          sets: 3,
          reps: 8,
          secondaryReps: 8,
          weight: 0,
          restSeconds: 180,
        },
      },

      {
        id: "facepull",
        name: "Face pull",
        description:
          "Tirer la corde vers le visage en gardant les coudes hauts et les épaules basses et contrôlées.",
        category: "Musculation",
        tracking: "weight+reps",

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 10,
          restSeconds: 90,
        },
      },

      {
        id: "triceps-elastique",
        name: "Extension triceps avec élastique",
        description:
          "Garder les coudes près du corps et tendre les avant-bras vers le bas sans déplacer les épaules.",
        category: "Musculation",
        tracking: "reps",

        defaultValues: {
          sets: 3,
          reps: 8,
          restSeconds: 90,
        },
      },

      {
        id: "developpe-militaire",
        name: "Développé militaire",
        description:
          "Pousser la charge au-dessus de la tête sans exagérer la cambrure lombaire.",
        category: "Musculation",
        tracking: "weight+reps",
        totalWeight: true,

        defaultValues: {
          sets: 3,
          reps: 8,
          weight: 20,
          restSeconds: 120,
        },
      },

      {
        id: "developpe-couche",
        name: "Développé couché",
        description:
          "Réaliser 3 séries de 12 répétitions. Commencer à 30 kg au total, soit une barre de 20 kg et 5 kg de chaque côté.",
        category: "Pectoraux",
        tracking: "weight+reps",
        totalWeight: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 30,
          restSeconds: 120,
        },
      },

      {
        id: "dips",
        name: "Dips",
        description:
          "Descendre de manière contrôlée puis pousser jusqu’à tendre presque complètement les bras. Commencer au poids du corps.",
        category: "Pectoraux",
        tracking: "weight+reps",
        totalWeight: true,

        defaultValues: {
          sets: 3,
          reps: 5,
          weight: 0,
          restSeconds: 120,
        },
      },
    ],
  },

  {
    id: "s4-gainage",
    name: "GAINAGE COMPLET",
    moment:
      "À réaliser après la grimpe ou séparément.",

    exercises: [
      {
        id: "dead-bug",
        name: "Dead bug",
        description:
          "Garder le bas du dos collé au sol et descendre simultanément le bras et la jambe opposés.",
        category: "Gainage",
        tracking: "reps",

        defaultValues: {
          sets: 3,
          reps: 10,
          restSeconds: 45,
        },
      },

      {
        id: "planche",
        name: "Planche avant-bras",
        description:
          "Garder le corps aligné et éviter de laisser tomber ou monter excessivement les hanches.",
        category: "Gainage",
        tracking: "duration",

        defaultValues: {
          sets: 3,
          duration: 30,
          restSeconds: 60,
        },
      },

      {
        id: "planche-laterale",
        name: "Planche latérale",
        description:
          "Maintenir la position de chaque côté avec le bassin relevé et le corps aligné.",
        category: "Gainage",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 3,
          duration: 30,
          restSeconds: 60,
        },
      },

      {
        id: "pallof-press",
        name: "Pallof press isométrique",
        description:
          "Attacher l’élastique à un poteau, se placer de côté et tendre les bras sans laisser le tronc tourner. Maintenir la position de chaque côté.",
        category: "Gainage",
        tracking: "duration+band",
        perSide: true,

        bandOptions:
          RESISTANCE_BAND_OPTIONS.map(
            (band) => band.id,
          ),

        defaultValues: {
          sets: 3,
          duration: 20,
          bandColor: "orange",
          bandStretch: 0,
          restSeconds: 60,
        },
      },

      {
        id: "releves-jambes",
        name: "Relevés de jambes suspendu",
        description:
          "Se suspendre à une barre et monter les jambes de manière contrôlée jusqu’à environ 90°.",
        category: "Gainage",
        tracking: "reps",

        defaultValues: {
          sets: 3,
          reps: 8,
          restSeconds: 90,
        },
      },

      {
        id: "genoux-suspendus-twist",
        name: "Relevés de genoux suspendus avec twist",
        description:
          "Ramener les genoux vers la tête puis les déplacer d’un côté et de l’autre. Compter gauche et droite comme une répétition complète.",
        category: "Gainage",
        tracking: "reps",

        defaultValues: {
          sets: 3,
          reps: 10,
          restSeconds: 90,
        },
      },

      {
        id: "rotations-russes",
        name: "Rotations russes",
        description:
          "Tourner le tronc de gauche à droite de manière contrôlée. Enregistrer la charge totale tenue.",
        category: "Gainage",
        tracking: "weight+reps",
        totalWeight: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 6,
          restSeconds: 60,
        },
      },

      {
        id: "superman-hold",
        name: "Superman hold",
        description:
          "S’allonger sur le ventre puis décoller légèrement le buste et les jambes sans mouvement brusque.",
        category: "Gainage",
        tracking: "duration",

        defaultValues: {
          sets: 3,
          duration: 20,
          restSeconds: 60,
        },
      },

      {
        id: "copenhagen-plank",
        name: "Copenhagen plank",
        description:
          "Placer le genou ou le pied de la jambe supérieure sur un banc et maintenir le bassin relevé.",
        category: "Gainage",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 3,
          duration: 20,
          restSeconds: 60,
        },
      },
    ],
  },

  {
    id: "s5-souplesse",
    name: "SOUPLESSE / MOBILITÉ",
    moment:
      "À réaliser après une séance ou pendant un jour léger. Éviter les étirements intenses juste avant une grosse séance de force.",

    exercises: [
      {
        id: "mobilite-genou-mur",
        name: "Montée de genou active contre le mur",
        description:
          "Se placer face au mur. Monter un genou vers l’épaule, forcer légèrement plus haut et maintenir 5 secondes. Réaliser 5 répétitions de chaque côté.",
        category: "Mobilité active",
        tracking: "reps+duration",
        perSide: true,

        defaultValues: {
          sets: 1,
          reps: 5,
          duration: 5,
          restSeconds: 30,
        },
      },

      {
        id: "pont-talon-sureleve",
        name: "Pont une jambe — talon surélevé",
        description:
          "S’allonger sur le dos et placer un talon sur un support. Pousser dans le talon, monter le bassin au maximum et maintenir 7 secondes.",
        category: "Mobilité active",
        tracking: "reps+duration",
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 3,
          duration: 7,
          restSeconds: 45,
        },
      },

      {
        id: "stretch-poignet-paume-avant",
        name: "Étirement poignet — paume vers l’avant",
        description:
          "Tendre un bras avec la paume vers l’avant puis tirer doucement les doigts vers soi. Réaliser de chaque côté.",
        category: "Poignets / avant-bras / mains",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "stretch-poignet-paume-soi",
        name: "Étirement poignet — paume vers soi",
        description:
          "Tendre un bras avec la paume orientée vers soi puis tirer doucement les doigts. Réaliser de chaque côté.",
        category: "Poignets / avant-bras / mains",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "stretch-epaules-chaise",
        name: "Épaules sur chaise ou banc",
        description:
          "Placer les mains sur une chaise ou un banc, tendre les bras et descendre doucement la poitrine.",
        category: "Épaules / dorsaux",
        tracking: "duration",

        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 20,
        },
      },

      {
        id: "child-pose-epaules",
        name: "Child pose épaules",
        description:
          "S’agenouiller, reculer les fesses vers les talons et allonger les bras devant soi.",
        category: "Épaules / dorsaux",
        tracking: "duration",

        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 20,
        },
      },

      {
        id: "stretch-lateral-debout",
        name: "Étirement latéral debout",
        description:
          "Placer un bras au-dessus de la tête et incliner doucement le buste du côté opposé.",
        category: "Épaules / dorsaux",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 15,
          restSeconds: 15,
        },
      },

      {
        id: "stretch-triceps-epaule",
        name: "Étirement triceps / épaule",
        description:
          "Placer une main derrière la tête puis tirer doucement le coude avec l’autre main.",
        category: "Épaules / dorsaux",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "dos-rond-dos-creux",
        name: "Dos rond / dos creux",
        description:
          "Se placer à quatre pattes, arrondir complètement le dos puis le creuser doucement.",
        category: "Dos / rotation thoracique",
        tracking: "reps",

        defaultValues: {
          sets: 2,
          reps: 10,
          restSeconds: 20,
        },
      },

      {
        id: "fente-profonde",
        name: "Fente profonde",
        description:
          "Placer un genou au sol et pousser doucement les hanches vers l’avant. Réaliser de chaque côté.",
        category: "Hanches / fessiers / adducteurs",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 20,
        },
      },

      {
        id: "papillon",
        name: "Papillon",
        description:
          "S’asseoir avec les pieds collés et les genoux ouverts. Garder le dos aussi droit que possible.",
        category: "Hanches / fessiers / adducteurs",
        tracking: "duration",

        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 20,
        },
      },

      {
        id: "grenouille",
        name: "Ouverture de hanches en grenouille",
        description:
          "Écarter les genoux, ouvrir les jambes et reculer progressivement les hanches.",
        category: "Hanches / fessiers / adducteurs",
        tracking: "duration",

        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 20,
        },
      },

      {
        id: "stretch-fessier-allonge",
        name: "Étirement fessier allongé",
        description:
          "Poser une cheville sur le genou opposé puis tirer doucement la jambe vers soi.",
        category: "Hanches / fessiers / adducteurs",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "stretch-fessier-assis",
        name: "Étirement fessier assis",
        description:
          "S’asseoir avec une jambe croisée devant soi puis incliner légèrement le buste vers l’avant.",
        category: "Hanches / fessiers / adducteurs",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 15,
          restSeconds: 15,
        },
      },

      {
        id: "stretch-quadriceps-debout",
        name: "Étirement quadriceps debout",
        description:
          "Attraper la cheville et ramener doucement le talon vers les fesses en gardant les genoux proches.",
        category: "Quadriceps",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "ischios-debout-assis",
        name: "Ischios debout ou assis",
        description:
          "Incliner doucement le buste vers les pieds sans rebond ni mouvement brusque.",
        category: "Ischios",
        tracking: "duration",

        defaultValues: {
          sets: 2,
          duration: 30,
          restSeconds: 20,
        },
      },

      {
        id: "stretch-arriere-jambe-assis",
        name: "Étirement arrière de jambe assis",
        description:
          "Tendre une jambe, plier l’autre puis incliner doucement le buste vers le pied.",
        category: "Ischios",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "stretch-mollet-mur",
        name: "Étirement mollet contre un mur",
        description:
          "Placer les mains contre un mur, tendre une jambe derrière et maintenir le talon au sol.",
        category: "Mollets / chevilles",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "stretch-mollet-jambe-pliee",
        name: "Étirement mollet jambe pliée",
        description:
          "Plier légèrement le genou arrière tout en gardant le talon au sol afin de cibler davantage le soléaire.",
        category: "Mollets / chevilles",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 2,
          duration: 20,
          restSeconds: 15,
        },
      },

      {
        id: "mobilite-cheville-chapeau-mexicain",
        name: "Mobilité cheville sur chapeau mexicain",
        description:
          "Tenir en équilibre avec le genou légèrement plié et réaliser des mouvements contrôlés de cheville.",
        category: "Mollets / chevilles",
        tracking: "reps",
        perSide: true,

        defaultValues: {
          sets: 2,
          reps: 30,
          restSeconds: 30,
        },
      },
    ],
  },

  {
    id: "s6-jambes",
    name: "JAMBES",
    moment:
      "À réaliser après une grimpe facile ou séparément.",

    exercises: [
      {
        id: "squat",
        name: "Squat avec deux haltères",
        description:
          "Tenir un haltère dans chaque main et réaliser les squats de manière contrôlée. Enregistrer le poids combiné des deux haltères.",
        category: "Musculation",
        tracking: "weight+reps",
        totalWeight: true,

        defaultValues: {
          sets: 3,
          reps: 15,
          weight: 0,
          restSeconds: 120,
        },
      },

      {
        id: "fentes-bulgares",
        name: "Fentes bulgares",
        description:
          "Placer le pied arrière sur un support. Enregistrer le poids combiné tenu dans les deux mains.",
        category: "Musculation",
        tracking: "weight+reps",
        totalWeight: true,
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 12,
          restSeconds: 120,
        },
      },

      {
        id: "sdle-roumain",
        name: "Soulevé de terre roumain",
        description:
          "Reculer les hanches en gardant le dos neutre. Enregistrer la charge totale de la barre ou des deux haltères.",
        category: "Musculation",
        tracking: "weight+reps",
        totalWeight: true,

        defaultValues: {
          sets: 3,
          reps: 8,
          weight: 40,
          restSeconds: 120,
        },
      },

      {
        id: "step-up",
        name: "Step-up",
        description:
          "Monter sur une box sans prendre trop d’élan. Enregistrer le poids combiné des charges tenues.",
        category: "Musculation",
        tracking: "weight+reps",
        totalWeight: true,
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 8,
          weight: 15,
          restSeconds: 90,
        },
      },

      {
        id: "mollets-debout",
        name: "Élévations de mollets debout",
        description:
          "Monter sur la pointe des pieds avec 7 kg dans chaque main. Enregistrer 14 kg au total.",
        category: "Musculation",
        tracking: "weight+reps",
        totalWeight: true,

        defaultValues: {
          sets: 3,
          reps: 15,
          weight: 14,
          restSeconds: 60,
        },
      },

      {
        id: "tibialis-raise",
        name: "Tibialis raise au poids du corps",
        description:
          "Garder les talons au sol, relever les pointes des pieds puis contrôler la descente.",
        category: "Musculation",
        tracking: "reps",

        defaultValues: {
          sets: 3,
          reps: 15,
          restSeconds: 60,
        },
      },

      {
        id: "tibialis-charge",
        name: "Tibialis raise avec poids suspendu",
        description:
          "Passer l’avant du pied dans une poignée sécurisée, relever le pied puis redescendre lentement.",
        category: "Musculation",
        tracking: "weight+reps",
        totalWeight: true,
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 0,
          restSeconds: 60,
        },
      },
    ],
  },

  {
    id: "s7-prevention",
    name: "PRÉVENTION BLESSURES",
    moment:
      "À réaliser après la grimpe ou pendant un jour léger.",

    exercises: [
      {
        id: "rot-ext-epaule",
        name: "Rotations externes",
        description:
          "Fixer un élastique à hauteur du coude. Garder le coude plié à 90° et collé contre le flanc, puis tourner lentement l’avant-bras vers l’extérieur sans déplacer l’épaule.",
        category: "Prévention",
        tracking: "reps",
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          restSeconds: 60,
        },
      },

      {
        id: "scapular-pullups",
        name: "Scapular pull-ups",
        description:
          "Se suspendre bras tendus. Sans plier les coudes, abaisser les épaules et rapprocher légèrement les omoplates, puis revenir lentement.",
        category: "Prévention",
        tracking: "reps",

        defaultValues: {
          sets: 3,
          reps: 8,
          restSeconds: 60,
        },
      },

      {
        id: "ext-doigts",
        name: "Extension des doigts",
        description:
          "Placer un petit élastique autour des doigts puis ouvrir complètement la main. Revenir lentement sans laisser l’élastique refermer brutalement les doigts.",
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
        name: "Wrist curls",
        description:
          "Poser l’avant-bras sur un banc avec la paume vers le haut et le poignet dépassant du bord. Fléchir le poignet, marquer une courte pause puis redescendre lentement.",
        category: "Prévention",
        tracking: "weight+reps",
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 0,
          restSeconds: 60,
        },
      },

      {
        id: "ext-poignet",
        name: "Extensions du poignet",
        description:
          "Poser l’avant-bras sur un banc avec la paume vers le bas et le poignet dépassant du bord. Relever le dos de la main puis redescendre lentement.",
        category: "Prévention",
        tracking: "weight+reps",
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 0,
          restSeconds: 60,
        },
      },

      {
        id: "pronation-supination",
        name: "Pronation / supination",
        description:
          "Tenir un marteau ou une charge décentrée avec le coude plié à 90°. Tourner lentement la paume vers le haut puis vers le bas sans déplacer le coude.",
        category: "Prévention",
        tracking: "weight+reps",
        perSide: true,

        defaultValues: {
          sets: 3,
          reps: 12,
          weight: 0,
          restSeconds: 60,
        },
      },

      {
        id: "equilibre-jambe",
        name: "Équilibre sur une jambe",
        description:
          "Tenir sur une jambe avec le genou légèrement fléchi. Garder le bassin stable et fermer les yeux uniquement si la position reste sûre.",
        category: "Prévention",
        tracking: "duration",
        perSide: true,

        defaultValues: {
          sets: 3,
          duration: 30,
          restSeconds: 45,
        },
      },
    ],
  },

  {
    id: "s8-pompes-activation",
    name: "POMPES / ACTIVATION",
    moment:
      "À réaliser seule, avant la souplesse ou comme activation légère. Éviter après une grosse séance de pectoraux, triceps ou épaules.",

    exercises: [
      {
        id: "pompes-normales",
        name: "Pompes normales",
        description:
          "Placer les mains légèrement plus larges que les épaules. Garder le corps aligné, descendre la poitrine puis pousser sans creuser le bas du dos.",
        category: "Pompes",
        tracking: "reps",

        defaultValues: {
          sets: 1,
          reps: 10,
          restSeconds: 30,
        },
      },

      {
        id: "pompes-pieds-sureleves",
        name: "Pompes pieds surélevés",
        description:
          "Placer les pieds sur un support stable, garder le corps aligné et descendre de manière contrôlée.",
        category: "Pompes",
        tracking: "reps",

        defaultValues: {
          sets: 1,
          reps: 10,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-diamant",
        name: "Pompes diamant",
        description:
          "Rapprocher les mains sous la poitrine afin que les pouces et les index forment un diamant. Garder les coudes proches du corps.",
        category: "Pompes",
        tracking: "reps",

        defaultValues: {
          sets: 1,
          reps: 5,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-larges",
        name: "Pompes prise large",
        description:
          "Placer les mains nettement plus larges que les épaules puis descendre la poitrine entre les mains de manière contrôlée.",
        category: "Pompes",
        tracking: "reps",

        defaultValues: {
          sets: 1,
          reps: 10,
          restSeconds: 30,
        },
      },

      {
        id: "pompes-pike",
        name: "Pompes pike",
        description:
          "Monter les hanches pour former un V inversé, descendre la tête entre les mains puis pousser verticalement.",
        category: "Pompes",
        tracking: "reps",

        defaultValues: {
          sets: 1,
          reps: 10,
          restSeconds: 45,
        },
      },

      {
        id: "pompes-coudes-serres",
        name: "Pompes coudes serrés",
        description:
          "Placer les mains à la largeur des épaules et garder les coudes proches du corps pendant la descente et la poussée.",
        category: "Pompes",
        tracking: "reps",

        defaultValues: {
          sets: 1,
          reps: 10,
          restSeconds: 30,
        },
      },
    ],
  },

  {
    id: "grimpe-libre",
    name: "JOUR DE GRIMPE",
    moment:
      "Enregistrer une séance de grimpe libre sans programme spécifique.",
    exercises: [],
  },
];