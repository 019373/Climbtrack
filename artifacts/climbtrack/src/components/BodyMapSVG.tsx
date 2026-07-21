import {
  useState,
  type CSSProperties,
  type SVGProps,
} from "react";

/* ────────────────────────────────────────────────────────────────────────── */
/* Zones utilisées par MUSCLE_SCORES                                         */
/* ────────────────────────────────────────────────────────────────────────── */

const MUSCLE_LABELS: Record<string, string> = {
  doigts: "Doigts",
  "avant-bras": "Avant-bras",
  biceps: "Biceps",
  triceps: "Triceps",
  épaules: "Épaules",
  pectoraux: "Pectoraux",
  dos: "Dos",
  lombaires: "Lombaires",
  abdominaux: "Abdominaux",
  obliques: "Obliques",
  fessiers: "Fessiers",
  quadriceps: "Quadriceps",
  "ischio-jambiers": "Ischio-jambiers",
  adducteurs: "Adducteurs",
  mollets: "Mollets",
  "tibial-anterieur": "Tibial antérieur",
};

/*
  Échelle fixe de la heatmap :

  0       : noir
  1–9     : blanc
  10–19   : gris
  20–34   : vert
  35–49   : jaune
  50–64   : orange
  65–79   : rouge
  80+     : violet
*/
function effortColor(score: number): string {
  if (score <= 0) return "#171717";
  if (score <= 9) return "#f4f4f5";
  if (score <= 19) return "#8b8b91";
  if (score <= 34) return "#42b95c";
  if (score <= 49) return "#e8c928";
  if (score <= 64) return "#f28b25";
  if (score <= 79) return "#e34e4e";
  return "#9b5de5";
}

type BodyProps = {
  scores: Record<string, number>;
  onSelect: (
    muscle: string,
    anatomicalName?: string,
  ) => void;
  selected: string | null;
};

type MuscleShapeProps =
  SVGProps<SVGPathElement> & {
    muscle: string;
    anatomicalName: string;
    scores: Record<string, number>;
    selected: string | null;
    onSelect: (
      muscle: string,
      anatomicalName?: string,
    ) => void;
  };

/* ────────────────────────────────────────────────────────────────────────── */
/* Muscle individuel                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

function MuscleShape({
  muscle,
  anatomicalName,
  scores,
  selected,
  onSelect,
  ...pathProps
}: MuscleShapeProps) {
  const active = selected === muscle;
  const score = scores[muscle] ?? 0;

  return (
    <path
      {...pathProps}
      fill={effortColor(score)}
      stroke={
        active
          ? "#ffffff"
          : score > 0
            ? "#101010"
            : "#343434"
      }
      strokeWidth={active ? 2.5 : 1.15}
      strokeLinejoin="round"
      strokeLinecap="round"
      role="button"
      tabIndex={0}
      aria-label={`${anatomicalName} — ${
        MUSCLE_LABELS[muscle] ?? muscle
      } : ${score} points`}
      data-muscle-zone={muscle}
      data-anatomical-name={anatomicalName}
      onClick={() =>
        onSelect(muscle, anatomicalName)
      }
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onSelect(
            muscle,
            anatomicalName,
          );
        }
      }}
      style={
        {
          cursor: "pointer",
          transition:
            "fill 220ms ease, stroke 180ms ease, opacity 180ms ease",
          outline: "none",
        } as CSSProperties
      }
    >
      <title>
        {anatomicalName} —{" "}
        {MUSCLE_LABELS[muscle] ?? muscle} :{" "}
        {score} point
        {score > 1 ? "s" : ""}
      </title>
    </path>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Éléments anatomiques non scorés                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function HeadFront() {
  return (
    <g>
      <path
        d="
          M72 28
          C72 14 79 5 90 5
          C101 5 108 14 108 28
          C108 43 101 53 90 56
          C79 53 72 43 72 28
          Z
        "
        fill="#232323"
        stroke="#4a4a4a"
        strokeWidth="1.4"
      />

      <path
        d="M74 26 C70 24 69 29 72 35"
        fill="#232323"
        stroke="#4a4a4a"
        strokeWidth="1.1"
      />

      <path
        d="M106 26 C110 24 111 29 108 35"
        fill="#232323"
        stroke="#4a4a4a"
        strokeWidth="1.1"
      />

      <path
        d="M80 25 Q84 22 88 25"
        fill="none"
        stroke="#555"
        strokeWidth="1"
      />

      <path
        d="M92 25 Q96 22 100 25"
        fill="none"
        stroke="#555"
        strokeWidth="1"
      />

      <path
        d="M90 27 L88 37 L92 37"
        fill="none"
        stroke="#555"
        strokeWidth="1"
      />

      <path
        d="M83 43 Q90 47 97 43"
        fill="none"
        stroke="#555"
        strokeWidth="1"
      />

      <path
        d="
          M74 22
          C76 8 84 3 91 3
          C101 3 107 11 108 22
          C102 17 96 14 90 14
          C84 14 79 17 74 22
          Z
        "
        fill="#111"
        stroke="#333"
        strokeWidth="1"
      />
    </g>
  );
}

function HeadBack() {
  return (
    <g>
      <path
        d="
          M72 28
          C72 14 79 5 90 5
          C101 5 108 14 108 28
          C108 43 101 53 90 56
          C79 53 72 43 72 28
          Z
        "
        fill="#232323"
        stroke="#4a4a4a"
        strokeWidth="1.4"
      />

      <path
        d="
          M73 24
          C74 9 82 3 90 3
          C101 3 107 11 108 25
          C101 20 97 18 90 18
          C83 18 78 20 73 24
          Z
        "
        fill="#111"
        stroke="#333"
        strokeWidth="1"
      />

      <path
        d="M78 21 Q82 44 90 50"
        fill="none"
        stroke="#3c3c3c"
        strokeWidth="1"
      />

      <path
        d="M102 21 Q98 44 90 50"
        fill="none"
        stroke="#3c3c3c"
        strokeWidth="1"
      />
    </g>
  );
}

function BodyOutline() {
  return (
    <path
      d="
        M77 51
        C69 53 59 57 51 63
        C40 70 34 82 32 96
        L24 144
        C21 160 22 177 27 192
        L31 211
        C32 219 38 224 44 222
        C49 220 51 214 50 206
        L47 188
        C48 172 50 154 53 136
        L57 113
        L55 180
        C51 198 48 217 46 237
        L40 294
        C38 309 39 323 43 338
        L46 399
        C46 411 53 416 62 414
        L71 409
        L75 351
        L83 301
        L90 257
        L97 301
        L105 351
        L109 409
        L118 414
        C127 416 134 411 134 399
        L137 338
        C141 323 142 309 140 294
        L134 237
        C132 217 129 198 125 180
        L123 113
        L127 136
        C130 154 132 172 133 188
        L130 206
        C129 214 131 220 136 222
        C142 224 148 219 149 211
        L153 192
        C158 177 159 160 156 144
        L148 96
        C146 82 140 70 129 63
        C121 57 111 53 103 51
        C99 56 95 59 90 59
        C85 59 81 56 77 51
        Z
      "
      fill="#161616"
      stroke="#555555"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  );
}

function SkeletonDetails() {
  return (
    <g
      fill="none"
      stroke="#5b5b5b"
      strokeWidth="0.8"
      opacity="0.45"
      pointerEvents="none"
    >
      <path d="M90 60 L90 188" />

      <path d="M72 62 Q90 74 108 62" />

      <path d="M63 104 Q90 116 117 104" />

      <path d="M61 184 Q90 198 119 184" />

      <path d="M58 239 Q65 282 62 301" />

      <path d="M122 239 Q115 282 118 301" />
    </g>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Vue de face                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

function FrontBody({
  scores,
  onSelect,
  selected,
}: BodyProps) {
  const common = {
    scores,
    selected,
    onSelect,
  };

  return (
    <svg
      viewBox="0 0 180 420"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      aria-label="Carte musculaire détaillée, vue de face"
    >
      <BodyOutline />
      <HeadFront />

      {/* Cou */}
      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Sterno-cléido-mastoïdien gauche"
        d="
          M78 49
          C79 55 81 63 85 69
          L89 61
          C85 56 82 52 80 47
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Sterno-cléido-mastoïdien droit"
        d="
          M102 49
          C101 55 99 63 95 69
          L91 61
          C95 56 98 52 100 47
          Z
        "
      />

      {/* Deltoïdes antérieurs et moyens */}
      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Deltoïde antérieur gauche"
        d="
          M61 65
          C51 66 43 72 39 82
          C38 91 42 99 50 103
          C58 98 62 86 64 72
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Deltoïde moyen gauche"
        d="
          M49 69
          C39 72 34 82 34 94
          C36 102 41 107 49 108
          C54 99 55 84 52 72
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Deltoïde antérieur droit"
        d="
          M119 65
          C129 66 137 72 141 82
          C142 91 138 99 130 103
          C122 98 118 86 116 72
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Deltoïde moyen droit"
        d="
          M131 69
          C141 72 146 82 146 94
          C144 102 139 107 131 108
          C126 99 125 84 128 72
          Z
        "
      />

      {/* Pectoraux : portion claviculaire */}
      <MuscleShape
        {...common}
        muscle="pectoraux"
        anatomicalName="Grand pectoral gauche — portion claviculaire"
        d="
          M64 67
          C72 62 81 62 88 65
          L88 82
          C79 84 69 82 61 76
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="pectoraux"
        anatomicalName="Grand pectoral droit — portion claviculaire"
        d="
          M116 67
          C108 62 99 62 92 65
          L92 82
          C101 84 111 82 119 76
          Z
        "
      />

      {/* Pectoraux : portion sternale */}
      <MuscleShape
        {...common}
        muscle="pectoraux"
        anatomicalName="Grand pectoral gauche — portion sternale"
        d="
          M61 77
          C68 82 79 85 88 84
          L88 103
          C80 109 68 108 59 100
          C56 91 57 83 61 77
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="pectoraux"
        anatomicalName="Grand pectoral droit — portion sternale"
        d="
          M119 77
          C112 82 101 85 92 84
          L92 103
          C100 109 112 108 121 100
          C124 91 123 83 119 77
          Z
        "
      />

      {/* Dentelé antérieur */}
      <MuscleShape
        {...common}
        muscle="obliques"
        anatomicalName="Dentelé antérieur gauche"
        d="
          M58 101
          L67 106
          L61 112
          L68 117
          L61 124
          L68 130
          L59 136
          C56 125 55 111 58 101
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="obliques"
        anatomicalName="Dentelé antérieur droit"
        d="
          M122 101
          L113 106
          L119 112
          L112 117
          L119 124
          L112 130
          L121 136
          C124 125 125 111 122 101
          Z
        "
      />

      {/* Biceps brachial */}
      <MuscleShape
        {...common}
        muscle="biceps"
        anatomicalName="Biceps brachial gauche"
        d="
          M39 102
          C33 112 31 126 34 141
          C37 151 45 154 50 146
          C54 132 53 116 49 104
          C46 100 42 100 39 102
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="biceps"
        anatomicalName="Biceps brachial droit"
        d="
          M141 102
          C147 112 149 126 146 141
          C143 151 135 154 130 146
          C126 132 127 116 131 104
          C134 100 138 100 141 102
          Z
        "
      />

      {/* Brachial */}
      <MuscleShape
        {...common}
        muscle="biceps"
        anatomicalName="Muscle brachial gauche"
        d="
          M48 113
          C53 121 53 137 49 148
          C45 152 41 151 39 145
          C43 137 44 123 43 113
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="biceps"
        anatomicalName="Muscle brachial droit"
        d="
          M132 113
          C127 121 127 137 131 148
          C135 152 139 151 141 145
          C137 137 136 123 137 113
          Z
        "
      />

      {/* Avant-bras : brachio-radial */}
      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Brachio-radial gauche"
        d="
          M33 144
          C27 155 26 169 29 183
          C31 191 36 195 40 191
          C42 177 42 160 41 148
          C39 144 36 142 33 144
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Brachio-radial droit"
        d="
          M147 144
          C153 155 154 169 151 183
          C149 191 144 195 140 191
          C138 177 138 160 139 148
          C141 144 144 142 147 144
          Z
        "
      />

      {/* Avant-bras : fléchisseurs */}
      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Fléchisseurs des doigts gauche"
        d="
          M41 146
          C47 155 48 173 45 190
          C42 198 36 199 32 192
          C34 178 35 159 34 148
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Fléchisseurs des doigts droit"
        d="
          M139 146
          C133 155 132 173 135 190
          C138 198 144 199 148 192
          C146 178 145 159 146 148
          Z
        "
      />

      {/* Paumes */}
      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Muscles intrinsèques de la main gauche"
        d="
          M29 189
          C24 194 24 203 27 211
          C29 216 35 219 40 216
          C44 212 45 205 44 192
          C39 188 34 187 29 189
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Muscles intrinsèques de la main droite"
        d="
          M151 189
          C156 194 156 203 153 211
          C151 216 145 219 140 216
          C136 212 135 205 136 192
          C141 188 146 187 151 189
          Z
        "
      />

      {/* Doigts séparés gauche */}
      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Fléchisseurs du pouce gauche"
        d="M28 207 C22 208 20 214 23 218 C27 220 31 217 33 212 Z"
      />

      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Fléchisseurs des doigts longs gauche"
        d="M32 214 C30 220 33 224 36 223 L38 215 Z"
      />

      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Lombricaux gauche"
        d="M37 215 C36 222 39 225 42 222 L42 214 Z"
      />

      {/* Doigts séparés droite */}
      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Fléchisseurs du pouce droit"
        d="M152 207 C158 208 160 214 157 218 C153 220 149 217 147 212 Z"
      />

      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Fléchisseurs des doigts longs droit"
        d="M148 214 C150 220 147 224 144 223 L142 215 Z"
      />

      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Lombricaux droit"
        d="M143 215 C144 222 141 225 138 222 L138 214 Z"
      />

      {/* Abdominaux : ligne blanche */}
      <path
        d="M90 104 L90 187"
        fill="none"
        stroke="#090909"
        strokeWidth="1.5"
        pointerEvents="none"
      />

      {/* Droit de l’abdomen, 8 segments */}
      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen supérieur gauche"
        d="M77 106 C81 104 85 104 88 106 L88 124 C84 127 80 127 77 124 Z"
      />

      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen supérieur droit"
        d="M103 106 C99 104 95 104 92 106 L92 124 C96 127 100 127 103 124 Z"
      />

      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen moyen supérieur gauche"
        d="M76 127 C80 125 84 125 88 127 L88 145 C84 148 80 148 76 145 Z"
      />

      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen moyen supérieur droit"
        d="M104 127 C100 125 96 125 92 127 L92 145 C96 148 100 148 104 145 Z"
      />

      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen moyen inférieur gauche"
        d="M76 148 C80 146 84 146 88 148 L88 166 C84 169 80 169 76 166 Z"
      />

      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen moyen inférieur droit"
        d="M104 148 C100 146 96 146 92 148 L92 166 C96 169 100 169 104 166 Z"
      />

      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen inférieur gauche"
        d="M77 169 C81 167 85 167 88 169 L88 187 C84 190 80 188 77 184 Z"
      />

      <MuscleShape
        {...common}
        muscle="abdominaux"
        anatomicalName="Droit de l’abdomen inférieur droit"
        d="M103 169 C99 167 95 167 92 169 L92 187 C96 190 100 188 103 184 Z"
      />

      {/* Obliques externes */}
      <MuscleShape
        {...common}
        muscle="obliques"
        anatomicalName="Oblique externe gauche"
        d="
          M59 107
          C55 123 56 149 60 171
          C64 183 69 190 77 188
          L75 114
          C69 108 64 106 59 107
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="obliques"
        anatomicalName="Oblique externe droit"
        d="
          M121 107
          C125 123 124 149 120 171
          C116 183 111 190 103 188
          L105 114
          C111 108 116 106 121 107
          Z
        "
      />

      {/* Sartorius */}
      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Sartorius gauche"
        d="
          M57 192
          C66 204 70 223 69 244
          C67 262 62 279 56 294
          L62 297
          C71 278 76 258 77 237
          C76 218 70 201 64 190
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Sartorius droit"
        d="
          M123 192
          C114 204 110 223 111 244
          C113 262 118 279 124 294
          L118 297
          C109 278 104 258 103 237
          C104 218 110 201 116 190
          Z
        "
      />

      {/* Quadriceps : vaste latéral */}
      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Vaste latéral gauche"
        d="
          M49 194
          C43 215 43 250 47 280
          C50 292 56 299 63 298
          C69 278 70 241 67 207
          C62 195 55 190 49 194
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Vaste latéral droit"
        d="
          M131 194
          C137 215 137 250 133 280
          C130 292 124 299 117 298
          C111 278 110 241 113 207
          C118 195 125 190 131 194
          Z
        "
      />

      {/* Quadriceps : droit fémoral */}
      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Droit fémoral gauche"
        d="
          M66 195
          C72 209 75 235 73 264
          C72 282 68 295 63 301
          C58 291 56 273 57 252
          C58 227 60 207 66 195
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Droit fémoral droit"
        d="
          M114 195
          C108 209 105 235 107 264
          C108 282 112 295 117 301
          C122 291 124 273 123 252
          C122 227 120 207 114 195
          Z
        "
      />

      {/* Quadriceps : vaste médial */}
      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Vaste médial gauche"
        d="
          M72 252
          C78 264 78 286 70 300
          C65 305 60 303 58 297
          C65 283 66 268 65 255
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="quadriceps"
        anatomicalName="Vaste médial droit"
        d="
          M108 252
          C102 264 102 286 110 300
          C115 305 120 303 122 297
          C115 283 114 268 115 255
          Z
        "
      />

      {/* Adducteurs */}
      <MuscleShape
        {...common}
        muscle="adducteurs"
        anatomicalName="Long adducteur gauche"
        d="
          M78 194
          C74 210 73 231 75 252
          C77 270 81 286 87 297
          L89 294
          L89 196
          C86 192 82 191 78 194
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="adducteurs"
        anatomicalName="Long adducteur droit"
        d="
          M102 194
          C106 210 107 231 105 252
          C103 270 99 286 93 297
          L91 294
          L91 196
          C94 192 98 191 102 194
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="adducteurs"
        anatomicalName="Gracile gauche"
        d="
          M84 205
          C82 231 83 267 87 298
          L90 299
          L90 203
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="adducteurs"
        anatomicalName="Gracile droit"
        d="
          M96 205
          C98 231 97 267 93 298
          L90 299
          L90 203
          Z
        "
      />

      {/* Genoux */}
      <ellipse
        cx="62"
        cy="303"
        rx="10"
        ry="7"
        fill="#202020"
        stroke="#4a4a4a"
        strokeWidth="1"
      />

      <ellipse
        cx="118"
        cy="303"
        rx="10"
        ry="7"
        fill="#202020"
        stroke="#4a4a4a"
        strokeWidth="1"
      />

      {/* Tibial antérieur */}
      <MuscleShape
        {...common}
        muscle="tibial-anterieur"
        anatomicalName="Tibial antérieur gauche"
        d="
          M51 310
          C47 328 47 357 50 385
          C52 399 57 407 62 405
          C66 390 66 359 64 327
          C61 314 56 307 51 310
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="tibial-anterieur"
        anatomicalName="Tibial antérieur droit"
        d="
          M129 310
          C133 328 133 357 130 385
          C128 399 123 407 118 405
          C114 390 114 359 116 327
          C119 314 124 307 129 310
          Z
        "
      />

      {/* Extenseurs des orteils */}
      <MuscleShape
        {...common}
        muscle="tibial-anterieur"
        anatomicalName="Long extenseur des orteils gauche"
        d="
          M64 311
          C69 331 69 362 66 392
          C64 401 61 405 58 403
          C62 374 62 342 59 316
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="tibial-anterieur"
        anatomicalName="Long extenseur des orteils droit"
        d="
          M116 311
          C111 331 111 362 114 392
          C116 401 119 405 122 403
          C118 374 118 342 121 316
          Z
        "
      />

      <SkeletonDetails />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Vue de dos                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function BackBody({
  scores,
  onSelect,
  selected,
}: BodyProps) {
  const common = {
    scores,
    selected,
    onSelect,
  };

  return (
    <svg
      viewBox="0 0 180 420"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      aria-label="Carte musculaire détaillée, vue de dos"
    >
      <BodyOutline />
      <HeadBack />

      {/* Trapèze supérieur */}
      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Trapèze supérieur gauche"
        d="
          M78 51
          C72 56 64 61 57 68
          L66 84
          L87 70
          L87 59
          C83 57 80 54 78 51
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Trapèze supérieur droit"
        d="
          M102 51
          C108 56 116 61 123 68
          L114 84
          L93 70
          L93 59
          C97 57 100 54 102 51
          Z
        "
      />

      {/* Deltoïdes postérieurs */}
      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Deltoïde postérieur gauche"
        d="
          M55 67
          C43 68 35 77 34 91
          C35 101 41 108 50 108
          C58 100 61 85 59 72
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="épaules"
        anatomicalName="Deltoïde postérieur droit"
        d="
          M125 67
          C137 68 145 77 146 91
          C145 101 139 108 130 108
          C122 100 119 85 121 72
          Z
        "
      />

      {/* Trapèze moyen */}
      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Trapèze moyen gauche"
        d="
          M65 82
          C71 76 79 72 87 71
          L87 107
          C79 106 69 101 61 94
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Trapèze moyen droit"
        d="
          M115 82
          C109 76 101 72 93 71
          L93 107
          C101 106 111 101 119 94
          Z
        "
      />

      {/* Rhomboïdes */}
      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Rhomboïde majeur gauche"
        d="
          M68 96
          L87 82
          L87 119
          C80 116 74 109 68 96
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Rhomboïde majeur droit"
        d="
          M112 96
          L93 82
          L93 119
          C100 116 106 109 112 96
          Z
        "
      />

      {/* Trapèze inférieur */}
      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Trapèze inférieur gauche"
        d="
          M70 108
          C76 114 82 119 87 122
          L87 158
          C80 151 74 137 70 108
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Trapèze inférieur droit"
        d="
          M110 108
          C104 114 98 119 93 122
          L93 158
          C100 151 106 137 110 108
          Z
        "
      />

      {/* Grand dorsal */}
      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Grand dorsal gauche"
        d="
          M58 96
          C53 113 54 142 60 165
          C65 181 76 190 87 185
          L87 119
          C78 110 69 101 58 96
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="dos"
        anatomicalName="Grand dorsal droit"
        d="
          M122 96
          C127 113 126 142 120 165
          C115 181 104 190 93 185
          L93 119
          C102 110 111 101 122 96
          Z
        "
      />

      {/* Triceps — chef long */}
      <MuscleShape
        {...common}
        muscle="triceps"
        anatomicalName="Triceps brachial, chef long gauche"
        d="
          M40 102
          C34 112 32 127 35 143
          C38 152 44 155 49 149
          C52 135 51 118 48 105
          C45 101 42 100 40 102
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="triceps"
        anatomicalName="Triceps brachial, chef long droit"
        d="
          M140 102
          C146 112 148 127 145 143
          C142 152 136 155 131 149
          C128 135 129 118 132 105
          C135 101 138 100 140 102
          Z
        "
      />

      {/* Triceps — chef latéral */}
      <MuscleShape
        {...common}
        muscle="triceps"
        anatomicalName="Triceps brachial, chef latéral gauche"
        d="
          M34 104
          C29 116 29 133 33 148
          C36 154 40 154 43 149
          C40 136 40 120 43 106
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="triceps"
        anatomicalName="Triceps brachial, chef latéral droit"
        d="
          M146 104
          C151 116 151 133 147 148
          C144 154 140 154 137 149
          C140 136 140 120 137 106
          Z
        "
      />

      {/* Avant-bras : extenseurs */}
      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Extenseurs du poignet gauche"
        d="
          M33 148
          C27 160 27 177 30 191
          C33 198 38 200 42 195
          C44 181 43 163 41 151
          C39 147 36 146 33 148
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Extenseurs du poignet droit"
        d="
          M147 148
          C153 160 153 177 150 191
          C147 198 142 200 138 195
          C136 181 137 163 139 151
          C141 147 144 146 147 148
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Extenseurs des doigts gauche"
        d="
          M41 150
          C47 162 48 179 45 194
          C42 200 37 200 33 194
          C36 181 37 164 36 152
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="avant-bras"
        anatomicalName="Extenseurs des doigts droit"
        d="
          M139 150
          C133 162 132 179 135 194
          C138 200 143 200 147 194
          C144 181 143 164 144 152
          Z
        "
      />

      {/* Dos des mains */}
      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Muscles intrinsèques dorsaux de la main gauche"
        d="
          M29 192
          C24 198 24 207 28 214
          C31 220 38 220 42 216
          C45 211 45 203 44 194
          C39 190 34 189 29 192
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="doigts"
        anatomicalName="Muscles intrinsèques dorsaux de la main droite"
        d="
          M151 192
          C156 198 156 207 152 214
          C149 220 142 220 138 216
          C135 211 135 203 136 194
          C141 190 146 189 151 192
          Z
        "
      />

      {/* Érecteurs du rachis */}
      <MuscleShape
        {...common}
        muscle="lombaires"
        anatomicalName="Érecteur du rachis gauche"
        d="
          M78 145
          C74 159 74 180 77 197
          C80 203 85 205 88 201
          L88 143
          C84 142 81 143 78 145
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="lombaires"
        anatomicalName="Érecteur du rachis droit"
        d="
          M102 145
          C106 159 106 180 103 197
          C100 203 95 205 92 201
          L92 143
          C96 142 99 143 102 145
          Z
        "
      />

      {/* Carré des lombes */}
      <MuscleShape
        {...common}
        muscle="lombaires"
        anatomicalName="Carré des lombes gauche"
        d="
          M67 161
          C66 176 70 193 77 202
          L87 197
          C80 185 79 169 80 153
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="lombaires"
        anatomicalName="Carré des lombes droit"
        d="
          M113 161
          C114 176 110 193 103 202
          L93 197
          C100 185 101 169 100 153
          Z
        "
      />

      {/* Moyen fessier */}
      <MuscleShape
        {...common}
        muscle="fessiers"
        anatomicalName="Moyen fessier gauche"
        d="
          M55 187
          C65 184 78 189 87 198
          L87 212
          C74 207 63 205 51 208
          C50 199 51 192 55 187
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="fessiers"
        anatomicalName="Moyen fessier droit"
        d="
          M125 187
          C115 184 102 189 93 198
          L93 212
          C106 207 117 205 129 208
          C130 199 129 192 125 187
          Z
        "
      />

      {/* Grand fessier */}
      <MuscleShape
        {...common}
        muscle="fessiers"
        anatomicalName="Grand fessier gauche"
        d="
          M51 208
          C47 219 50 235 57 243
          C66 251 78 249 88 240
          L88 211
          C76 205 63 203 51 208
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="fessiers"
        anatomicalName="Grand fessier droit"
        d="
          M129 208
          C133 219 130 235 123 243
          C114 251 102 249 92 240
          L92 211
          C104 205 117 203 129 208
          Z
        "
      />

      {/* Ischio : biceps fémoral */}
      <MuscleShape
        {...common}
        muscle="ischio-jambiers"
        anatomicalName="Biceps fémoral gauche"
        d="
          M50 241
          C45 257 44 280 48 299
          C51 309 57 314 63 310
          C67 287 67 261 64 242
          C59 237 54 237 50 241
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="ischio-jambiers"
        anatomicalName="Biceps fémoral droit"
        d="
          M130 241
          C135 257 136 280 132 299
          C129 309 123 314 117 310
          C113 287 113 261 116 242
          C121 237 126 237 130 241
          Z
        "
      />

      {/* Ischio : semi-tendineux */}
      <MuscleShape
        {...common}
        muscle="ischio-jambiers"
        anatomicalName="Semi-tendineux gauche"
        d="
          M64 242
          C70 257 73 280 70 303
          C68 312 63 315 59 310
          C63 288 62 262 58 244
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="ischio-jambiers"
        anatomicalName="Semi-tendineux droit"
        d="
          M116 242
          C110 257 107 280 110 303
          C112 312 117 315 121 310
          C117 288 118 262 122 244
          Z
        "
      />

      {/* Ischio : semi-membraneux */}
      <MuscleShape
        {...common}
        muscle="ischio-jambiers"
        anatomicalName="Semi-membraneux gauche"
        d="
          M72 244
          C77 261 79 284 75 304
          C72 310 68 310 65 305
          C69 285 68 262 64 245
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="ischio-jambiers"
        anatomicalName="Semi-membraneux droit"
        d="
          M108 244
          C103 261 101 284 105 304
          C108 310 112 310 115 305
          C111 285 112 262 116 245
          Z
        "
      />

      {/* Arrière des genoux */}
      <ellipse
        cx="62"
        cy="307"
        rx="9"
        ry="6"
        fill="#202020"
        stroke="#4a4a4a"
        strokeWidth="1"
      />

      <ellipse
        cx="118"
        cy="307"
        rx="9"
        ry="6"
        fill="#202020"
        stroke="#4a4a4a"
        strokeWidth="1"
      />

      {/* Gastrocnémien médial */}
      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Gastrocnémien médial gauche"
        d="
          M58 310
          C52 319 50 340 53 359
          C55 372 61 379 66 374
          C71 359 70 332 66 313
          C63 309 60 308 58 310
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Gastrocnémien médial droit"
        d="
          M122 310
          C128 319 130 340 127 359
          C125 372 119 379 114 374
          C109 359 110 332 114 313
          C117 309 120 308 122 310
          Z
        "
      />

      {/* Gastrocnémien latéral */}
      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Gastrocnémien latéral gauche"
        d="
          M49 311
          C44 322 43 342 47 361
          C50 372 55 376 59 371
          C56 351 57 330 61 313
          C57 308 53 308 49 311
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Gastrocnémien latéral droit"
        d="
          M131 311
          C136 322 137 342 133 361
          C130 372 125 376 121 371
          C124 351 123 330 119 313
          C123 308 127 308 131 311
          Z
        "
      />

      {/* Soléaire */}
      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Soléaire gauche"
        d="
          M50 358
          C48 371 49 388 53 400
          C56 407 61 408 64 402
          C67 391 67 376 65 363
          C60 357 55 355 50 358
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Soléaire droit"
        d="
          M130 358
          C132 371 131 388 127 400
          C124 407 119 408 116 402
          C113 391 113 376 115 363
          C120 357 125 355 130 358
          Z
        "
      />

      {/* Tendon d’Achille */}
      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Tendon d’Achille gauche"
        d="
          M57 380
          C55 390 55 402 57 411
          L63 410
          C64 398 63 388 62 379
          Z
        "
      />

      <MuscleShape
        {...common}
        muscle="mollets"
        anatomicalName="Tendon d’Achille droit"
        d="
          M123 380
          C125 390 125 402 123 411
          L117 410
          C116 398 117 388 118 379
          Z
        "
      />

      <SkeletonDetails />

      {/* Colonne vertébrale */}
      <path
        d="M90 58 C88 90 92 121 90 153 C88 174 91 192 90 203"
        fill="none"
        stroke="#666"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        opacity="0.7"
        pointerEvents="none"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Légende                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function HeatmapLegend() {
  const steps = [
    {
      label: "0",
      color: effortColor(0),
    },
    {
      label: "1–9",
      color: effortColor(5),
    },
    {
      label: "10–19",
      color: effortColor(15),
    },
    {
      label: "20–34",
      color: effortColor(25),
    },
    {
      label: "35–49",
      color: effortColor(40),
    },
    {
      label: "50–64",
      color: effortColor(55),
    },
    {
      label: "65–79",
      color: effortColor(70),
    },
    {
      label: "80+",
      color: effortColor(85),
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
      {steps.map((step) => (
        <div
          key={step.label}
          className="flex items-center gap-1.5"
        >
          <span
            className="h-3 w-3 flex-shrink-0 rounded-full border border-white/15"
            style={{
              backgroundColor:
                step.color,
            }}
          />

          <span className="text-[10px] font-medium text-muted-foreground">
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Composant principal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export function BodyMapSVG({
  scores,
}: {
  scores: Record<string, number>;
  maxScore: number;
}) {
  const [selected, setSelected] =
    useState<string | null>(null);

  const [
    selectedAnatomicalName,
    setSelectedAnatomicalName,
  ] = useState<string | null>(null);

  const handleSelect = (
    muscle: string,
    anatomicalName?: string,
  ) => {
    if (
      selected === muscle &&
      selectedAnatomicalName ===
        anatomicalName
    ) {
      setSelected(null);
      setSelectedAnatomicalName(null);
      return;
    }

    setSelected(muscle);
    setSelectedAnatomicalName(
      anatomicalName ?? null,
    );
  };

  const selectedScore = selected
    ? scores[selected] ?? 0
    : 0;

  return (
    <div className="w-full space-y-5">
      <div className="flex min-h-14 items-center justify-center">
        {selected ? (
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setSelectedAnatomicalName(
                null,
              );
            }}
            className="flex max-w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left"
          >
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full border border-white/15"
              style={{
                backgroundColor:
                  effortColor(
                    selectedScore,
                  ),
              }}
            />

            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {selectedAnatomicalName ??
                  MUSCLE_LABELS[
                    selected
                  ] ??
                  selected}
              </span>

              {selectedAnatomicalName && (
                <span className="block truncate text-[10px] text-muted-foreground">
                  Zone :{" "}
                  {MUSCLE_LABELS[
                    selected
                  ] ?? selected}
                </span>
              )}
            </span>

            <span className="ml-auto flex-shrink-0 font-mono text-xs text-muted-foreground">
              {selectedScore} pt
              {selectedScore > 1
                ? "s"
                : ""}
            </span>
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Appuie sur un muscle précis pour
            voir son nom et l’effort de sa zone
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 items-start gap-2 sm:gap-5">
        <div className="flex min-w-0 flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Face
          </span>

          <div className="w-full max-w-[180px]">
            <FrontBody
              scores={scores}
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Dos
          </span>

          <div className="w-full max-w-[180px]">
            <BackBody
              scores={scores}
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
        </div>
      </div>

      <HeatmapLegend />
    </div>
  );
}