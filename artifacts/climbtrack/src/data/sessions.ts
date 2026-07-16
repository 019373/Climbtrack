import { ExerciseDefaults } from "../context/ClimbTrackContext";

export type TrackingType = 'duration+assistance' | 'reps' | 'weight' | 'weight+duration' | 'assistance' | 'weight+reps' | 'duration' | 'none';

export interface ExerciseDef {
  id: string;
  name: string;
  description: string;
  category: string;
  tracking: TrackingType;
  defaultValues: ExerciseDefaults;
  assistanceOptions?: string[];
  isHangboard?: boolean;
}

export interface SessionDef {
  id: string;
  name: string;
  moment: string;
  exercises: ExerciseDef[];
}

export const ASSISTANCE_OPTIONS = [
  'Deux pieds au sol, appui fort',
  'Deux pieds au sol, appui moyen',
  'Deux pieds au sol, appui léger',
  'Un pied au sol',
  'Pointes des pieds',
  'Sans assistance',
  'Lesté'
];

export const SESSIONS: SessionDef[] = [
  {
    id: 's1-force-doigts',
    name: 'FORCE DOIGTS / PUISSANCE',
    moment: "À faire avant la grimpe, après 20 à 30 minutes d'échauffement facile.",
    exercises: [
      {
        id: 'suspension-20mm',
        name: 'Suspension semi-arche 20 mm',
        description: 'Suspension en semi-arche sur une réglette de 20 mm.',
        category: 'Suspensions',
        tracking: 'duration+assistance',
        isHangboard: true,
        defaultValues: { sets: 5, duration: 10, restSeconds: 180, assistance: 'Deux pieds au sol, appui moyen' },
        assistanceOptions: ASSISTANCE_OPTIONS
      },
      {
        id: 'sauts-prise',
        name: 'Sauts pour attraper une prise',
        description: 'Sur la board à côté de la Kilter, réaliser trois sauts explosifs.',
        category: 'Préhension',
        tracking: 'reps',
        defaultValues: { sets: 5, reps: 3, restSeconds: 30 }
      },
      {
        id: 'lourd-leger',
        name: 'Lourd-léger',
        description: '2 tractions lourdes, 10s pour enlever le lest, 3 tractions explosives sans lest.',
        category: 'Tractions',
        tracking: 'weight',
        defaultValues: { sets: 3, weight: 10, restSeconds: 180 }
      },
      {
        id: 'pince-disque',
        name: 'Pince disque',
        description: 'Pincer un disque entre les doigts et le pouce, poignet droit.',
        category: 'Préhension',
        tracking: 'weight+duration',
        defaultValues: { sets: 3, weight: 20, duration: 20, restSeconds: 180 }
      }
    ]
  },
  {
    id: 's2-resistance',
    name: 'RÉSISTANCE MUSCULAIRE',
    moment: 'À faire après la grimpe ou comme séance principale sans blocs très durs.',
    exercises: [
      {
        id: 'repeaters-7-3',
        name: 'Repeaters 7/3',
        description: '7 secondes suspendu, 3 secondes de repos, 10 répétitions.',
        category: 'Suspensions',
        tracking: 'assistance',
        isHangboard: true,
        defaultValues: { sets: 3, reps: 10, duration: 7, restSeconds: 180, assistance: 'Deux pieds au sol, appui moyen' },
        assistanceOptions: ASSISTANCE_OPTIONS
      },
      {
        id: 'blocs-devers',
        name: 'Blocs en dévers',
        description: 'Choisir un bloc bleu foncé ou turquoise. 3 essais/série.',
        category: 'Préhension',
        tracking: 'none',
        defaultValues: { sets: 2, reps: 3, restSeconds: 180 }
      },
      {
        id: 'traversees-longues',
        name: 'Traversées longues',
        description: 'Traversée facile ou moyenne sans descendre (3-5 min).',
        category: 'Préhension',
        tracking: 'duration',
        defaultValues: { sets: 3, duration: 180, restSeconds: 180 }
      },
      {
        id: 'tractions-endurance',
        name: 'Tractions endurance',
        description: "Tractions propres sans aller à l'échec.",
        category: 'Tractions',
        tracking: 'reps',
        defaultValues: { sets: 5, reps: 6, restSeconds: 60 }
      },
      {
        id: 'suspension-facile',
        name: 'Suspension facile longue',
        description: 'Sur une bonne prise, épaules engagées.',
        category: 'Suspensions',
        tracking: 'duration',
        defaultValues: { sets: 4, duration: 30, restSeconds: 60 }
      },
      {
        id: 'repeaters-6-4',
        name: 'Repeaters faciles 6/4',
        description: '6 secondes suspendu, 4 secondes de repos, 10 répétitions.',
        category: 'Suspensions',
        tracking: 'assistance',
        isHangboard: true,
        defaultValues: { sets: 3, reps: 10, duration: 6, restSeconds: 180, assistance: 'Deux pieds au sol, appui moyen' },
        assistanceOptions: ASSISTANCE_OPTIONS
      },
      {
        id: 'dead-hang',
        name: 'Dead hang deux mains',
        description: 'Bras tendus, épaules engagées.',
        category: 'Suspensions',
        tracking: 'duration',
        defaultValues: { sets: 3, duration: 20, restSeconds: 120 }
      }
    ]
  },
  {
    id: 's3-dos-epaules',
    name: 'DOS / ÉPAULES / FORCE',
    moment: 'À faire après la grimpe ou comme séance séparée.',
    exercises: [
      {
        id: 'tractions-lestees',
        name: 'Tractions lestées',
        description: "Charge permettant ~7 reps max, n'en faire que 6.",
        category: 'Tractions',
        tracking: 'weight+reps',
        defaultValues: { sets: 3, reps: 6, weight: 10, restSeconds: 180 }
      },
      {
        id: 'blocages',
        name: 'Blocages',
        description: '6 secondes de blocage, puis 2 tractions.',
        category: 'Tractions',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 2, duration: 6, restSeconds: 180 }
      },
      {
        id: 'rowing-haltere',
        name: 'Rowing haltère',
        description: "Buste incliné, dos droit, tirer l'haltère vers les côtes.",
        category: 'Musculation',
        tracking: 'weight+reps',
        defaultValues: { sets: 3, reps: 10, weight: 15, restSeconds: 120 }
      },
      {
        id: 'lat-pulldown',
        name: 'Lat pulldown élastique',
        description: 'Élastique accroché en hauteur, bras tendu, tirer vers le sol.',
        category: 'Musculation',
        tracking: 'reps',
        defaultValues: { sets: 3, reps: 8, restSeconds: 180 }
      },
      {
        id: 'facepull',
        name: 'Facepull',
        description: 'Tirer vers le visage avec les coudes hauts.',
        category: 'Musculation',
        tracking: 'weight+reps',
        defaultValues: { sets: 3, reps: 12, weight: 10, restSeconds: 90 }
      },
      {
        id: 'triceps-elastique',
        name: 'Triceps avec élastique',
        description: "Coude collé au corps, tendre l'avant-bras vers le bas.",
        category: 'Musculation',
        tracking: 'reps',
        defaultValues: { sets: 3, reps: 8, restSeconds: 180 }
      },
      {
        id: 'developpe-militaire',
        name: 'Développé militaire',
        description: 'Pousser au-dessus de la tête sans cambrer.',
        category: 'Musculation',
        tracking: 'weight+reps',
        defaultValues: { sets: 3, reps: 8, weight: 20, restSeconds: 120 }
      }
    ]
  },
  {
    id: 's4-gainage',
    name: 'GAINAGE COMPLET',
    moment: 'À faire après la grimpe ou séparément.',
    exercises: [
      {
        id: 'dead-bug',
        name: 'Dead bug',
        description: 'Bas du dos collé au sol, descendre bras et jambe opposés.',
        category: 'Gainage',
        tracking: 'reps',
        defaultValues: { sets: 3, reps: 10, restSeconds: 45 }
      },
      {
        id: 'planche',
        name: 'Planche avant-bras',
        description: 'Garder le dos droit.',
        category: 'Gainage',
        tracking: 'duration',
        defaultValues: { sets: 3, duration: 30, restSeconds: 60 }
      },
      {
        id: 'planche-laterale',
        name: 'Planche latérale',
        description: 'Maintenir la position (par côté).',
        category: 'Gainage',
        tracking: 'duration',
        defaultValues: { sets: 3, duration: 30, restSeconds: 60 }
      },
      {
        id: 'pallof-press',
        name: 'Pallof press',
        description: 'Élastique fixé sur le côté, tendre les bras sans tourner.',
        category: 'Gainage',
        tracking: 'reps',
        defaultValues: { sets: 3, reps: 10, restSeconds: 60 }
      },
      {
        id: 'releves-jambes',
        name: 'Relevés de jambes',
        description: 'Suspendu, monter les jambes à 90 degrés.',
        category: 'Gainage',
        tracking: 'reps',
        defaultValues: { sets: 3, reps: 8, restSeconds: 90 }
      },
      {
        id: 'rotations-russes',
        name: 'Rotations russes',
        description: 'Pieds surélevés ou au sol.',
        category: 'Gainage',
        tracking: 'weight',
        defaultValues: { sets: 3, reps: 12, weight: 6, restSeconds: 60 }
      },
      {
        id: 'superman-hold',
        name: 'Superman hold',
        description: 'Allongé sur le ventre, décoller buste et jambes.',
        category: 'Gainage',
        tracking: 'duration',
        defaultValues: { sets: 3, duration: 20, restSeconds: 60 }
      },
      {
        id: 'copenhagen-plank',
        name: 'Copenhagen plank',
        description: 'Genou de la jambe supérieure sur un banc.',
        category: 'Gainage',
        tracking: 'duration',
        defaultValues: { sets: 3, duration: 20, restSeconds: 60 }
      }
    ]
  },
  {
    id: 's5-souplesse',
    name: 'SOUPLESSE COMPLÈTE',
    moment: 'À faire un jour léger ou après une séance.',
    exercises: [
      {
        id: 'souplesse-complete',
        name: 'Routine souplesse',
        description: 'Suivre tous les étirements de la routine (poignets, épaules, dos, hanches, jambes).',
        category: 'Mobilité',
        tracking: 'none',
        defaultValues: { sets: 1, duration: 900, restSeconds: 0 }
      }
    ]
  },
  {
    id: 's6-jambes',
    name: 'JAMBES',
    moment: 'À faire après une grimpe facile ou séparément.',
    exercises: [
      {
        id: 'squat',
        name: 'Squat',
        description: 'Flexion sur les jambes.',
        category: 'Musculation',
        tracking: 'weight',
        defaultValues: { sets: 3, reps: 8, weight: 40, restSeconds: 120 }
      },
      {
        id: 'fentes-bulgares',
        name: 'Fentes bulgares',
        description: 'Pied arrière sur banc.',
        category: 'Musculation',
        tracking: 'weight',
        defaultValues: { sets: 3, reps: 8, weight: 15, restSeconds: 120 }
      },
      {
        id: 'sdle-roumain',
        name: 'Soulevé de terre roumain',
        description: 'Flexion des hanches avec jambes tendues.',
        category: 'Musculation',
        tracking: 'weight',
        defaultValues: { sets: 3, reps: 8, weight: 40, restSeconds: 120 }
      },
      {
        id: 'step-up',
        name: 'Step-up',
        description: 'Monter sur une box.',
        category: 'Musculation',
        tracking: 'weight',
        defaultValues: { sets: 3, reps: 8, weight: 15, restSeconds: 90 }
      },
      {
        id: 'mollets-debout',
        name: 'Mollets debout',
        description: 'Extension sur la pointe des pieds.',
        category: 'Musculation',
        tracking: 'weight',
        defaultValues: { sets: 3, reps: 15, weight: 0, restSeconds: 60 }
      },
      {
        id: 'tibialis-raise',
        name: 'Tibialis raise',
        description: 'Relevé de pointes de pieds.',
        category: 'Musculation',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 15, restSeconds: 60 }
      }
    ]
  },
  {
    id: 's7-prevention',
    name: 'PRÉVENTION BLESSURES',
    moment: 'À faire après la grimpe ou un jour léger.',
    exercises: [
      {
        id: 'rot-ext-epaule',
        name: "Rotations externes",
        description: "Épaule coude collé.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 12, restSeconds: 60 }
      },
      {
        id: 'scapular-pullups',
        name: "Scapular pull-ups",
        description: "Traction omoplates uniquement.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 8, restSeconds: 60 }
      },
      {
        id: 'facepull-leger',
        name: "Facepull léger",
        description: "Contrôle avant tout.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 12, restSeconds: 60 }
      },
      {
        id: 'ext-doigts',
        name: "Extension doigts",
        description: "Avec élastique.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 20, restSeconds: 45 }
      },
      {
        id: 'flex-poignet',
        name: "Flexion poignet",
        description: "Avant-bras soutenu.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 12, restSeconds: 60 }
      },
      {
        id: 'ext-poignet',
        name: "Extension poignet",
        description: "Avant-bras soutenu.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 12, restSeconds: 60 }
      },
      {
        id: 'pronation-supination',
        name: "Pronation / supination",
        description: "Avec marteau ou poids décentré.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, reps: 12, restSeconds: 60 }
      },
      {
        id: 'equilibre-jambe',
        name: "Équilibre sur une jambe",
        description: "Yeux fermés si possible.",
        category: 'Prévention',
        tracking: 'none',
        defaultValues: { sets: 3, duration: 30, restSeconds: 45 }
      }
    ]
  }
];
