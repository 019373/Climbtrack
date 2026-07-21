export const MUSCLE_SCORES: Record<
  string,
  Record<string, number>
> = {
  "suspension-20mm": {
    doigts: 5,
    "avant-bras": 5,
    dos: 1,
    épaules: 1,
  },

  "suspension-slopers": {
    doigts: 4,
    "avant-bras": 5,
    épaules: 2,
    dos: 1,
  },

  "sauts-prise": {
    doigts: 3,
    "avant-bras": 3,
    épaules: 2,
  },

  "lourd-leger": {
    dos: 5,
    biceps: 4,
    "avant-bras": 3,
    épaules: 2,
  },

  "pince-disque": {
    doigts: 5,
    "avant-bras": 4,
  },

  "repeaters-7-3": {
    doigts: 5,
    "avant-bras": 5,
    dos: 2,
    épaules: 1,
  },

  "blocs-devers": {
    doigts: 3,
    dos: 3,
    "avant-bras": 3,
    biceps: 3,
    épaules: 2,
    abdominaux: 2,
  },

  "traversees-longues": {
    "avant-bras": 5,
    doigts: 4,
    dos: 3,
  },

  "tractions-endurance": {
    dos: 5,
    biceps: 4,
    "avant-bras": 3,
    épaules: 2,
  },

  "suspension-facile": {
    "avant-bras": 3,
    doigts: 2,
    épaules: 2,
    dos: 2,
  },

  "repeaters-6-4": {
    doigts: 5,
    "avant-bras": 5,
    dos: 2,
    épaules: 1,
  },

  "dead-hang": {
    "avant-bras": 4,
    doigts: 3,
    épaules: 1,
  },

  "tractions-lestees": {
    dos: 5,
    biceps: 5,
    épaules: 3,
    abdominaux: 2,
    "avant-bras": 2,
  },

  blocages: {
    dos: 5,
    biceps: 5,
    "avant-bras": 3,
  },

  "rowing-haltere": {
    dos: 5,
    biceps: 3,
    épaules: 3,
    abdominaux: 1,
  },

  "lat-pulldown": {
    dos: 4,
    biceps: 2,
  },

  facepull: {
    épaules: 5,
    dos: 3,
    biceps: 1,
  },

  "triceps-elastique": {
    triceps: 5,
  },

  "developpe-militaire": {
    épaules: 5,
    triceps: 4,
    pectoraux: 2,
    abdominaux: 2,
  },

  "dead-bug": {
    abdominaux: 5,
    obliques: 2,
  },

  planche: {
    abdominaux: 5,
    épaules: 2,
    fessiers: 2,
  },

  "planche-laterale": {
    obliques: 5,
    abdominaux: 3,
    épaules: 2,
  },

  "pallof-press": {
    abdominaux: 4,
    obliques: 3,
  },

  "releves-jambes": {
    abdominaux: 5,
    "avant-bras": 2,
    "ischio-jambiers": 1,
  },

  "rotations-russes": {
    obliques: 5,
    abdominaux: 4,
  },

  "superman-hold": {
    lombaires: 5,
    fessiers: 2,
  },

  "copenhagen-plank": {
    adducteurs: 5,
    obliques: 3,
    abdominaux: 3,
  },

  squat: {
    quadriceps: 5,
    fessiers: 4,
    abdominaux: 2,
  },

  "fentes-bulgares": {
    quadriceps: 5,
    fessiers: 4,
    "ischio-jambiers": 2,
  },

  "sdle-roumain": {
    "ischio-jambiers": 5,
    fessiers: 5,
    lombaires: 2,
  },

  "step-up": {
    quadriceps: 4,
    fessiers: 4,
    "ischio-jambiers": 2,
  },

  "mollets-debout": {
    mollets: 5,
  },

  "tibialis-raise": {
    "tibial-anterieur": 5,
  },

  /*
   * Prévention :
   * charge volontairement faible.
   */

  "rot-ext-epaule": {
    épaules: 2,
  },

  "scapular-pullups": {
    dos: 2,
    épaules: 2,
  },

  "facepull-leger": {
    épaules: 2,
    dos: 1,
  },

  "ext-doigts": {
    doigts: 1,
    "avant-bras": 1,
  },

  "flex-poignet": {
    "avant-bras": 1,
  },

  "ext-poignet": {
    "avant-bras": 1,
  },

  "pronation-supination": {
    "avant-bras": 1,
  },

  "equilibre-jambe": {
    mollets: 1,
    "tibial-anterieur": 1,
    fessiers: 1,
  },
};

export const ALL_MUSCLES = [
  "doigts",
  "avant-bras",
  "biceps",
  "triceps",
  "épaules",
  "pectoraux",
  "dos",
  "lombaires",
  "abdominaux",
  "obliques",
  "hanches",
  "fessiers",
  "quadriceps",
  "ischio-jambiers",
  "adducteurs",
  "mollets",
  "tibial-anterieur",
  "mobilité",
];