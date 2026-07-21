import {
  useId,
  type ReactElement,
} from "react";

import {
  BADGE_LEVEL_META,
} from "@/data/badges";

import type {
  BadgeKind,
  BadgeLevel,
} from "@/data/badges";

type IllustrationProps = {
  c: string;
};

function Fingerboard({
  c,
  label,
}: IllustrationProps & {
  label: string;
}) {
  return (
    <g>
      <rect
        x="20"
        y="29"
        width="60"
        height="28"
        rx="5"
        fill={c}
        opacity="0.14"
      />

      <rect
        x="20"
        y="29"
        width="60"
        height="28"
        rx="5"
        fill="none"
        stroke={c}
        strokeWidth="3"
      />

      <rect
        x="27"
        y="40"
        width="18"
        height="6"
        rx="2"
        fill={c}
      />

      <rect
        x="55"
        y="40"
        width="18"
        height="6"
        rx="2"
        fill={c}
      />

      <circle
        cx="27"
        cy="35"
        r="2"
        fill={c}
      />

      <circle
        cx="73"
        cy="35"
        r="2"
        fill={c}
      />

      <text
        x="50"
        y="70"
        textAnchor="middle"
        fill={c}
        fontSize="12"
        fontWeight="900"
        fontFamily="ui-monospace, monospace"
      >
        {label}
      </text>
    </g>
  );
}

function IllustrationFingerboard20(
  props: IllustrationProps,
) {
  return (
    <Fingerboard
      {...props}
      label="20 mm"
    />
  );
}

function IllustrationFingerboard25(
  props: IllustrationProps,
) {
  return (
    <Fingerboard
      {...props}
      label="25 mm"
    />
  );
}

function IllustrationSloper({
  c,
}: IllustrationProps) {
  return (
    <g>
      <rect
        x="19"
        y="27"
        width="62"
        height="35"
        rx="6"
        fill={c}
        opacity="0.12"
      />

      <rect
        x="19"
        y="27"
        width="62"
        height="35"
        rx="6"
        fill="none"
        stroke={c}
        strokeWidth="3"
      />

      <path
        d="M26 51 Q31 35 39 35 Q47 35 50 51 Z"
        fill={c}
      />

      <path
        d="M51 51 Q56 30 66 30 Q76 30 78 51 Z"
        fill={c}
      />

      <text
        x="37"
        y="73"
        textAnchor="middle"
        fill={c}
        fontSize="11"
        fontWeight="900"
      >
        30°
      </text>

      <text
        x="66"
        y="73"
        textAnchor="middle"
        fill={c}
        fontSize="11"
        fontWeight="900"
      >
        45°
      </text>
    </g>
  );
}

function IllustrationPinch({
  c,
}: IllustrationProps) {
  return (
    <g>
      <circle
        cx="50"
        cy="50"
        r="23"
        fill={c}
        opacity="0.14"
      />

      <circle
        cx="50"
        cy="50"
        r="23"
        fill="none"
        stroke={c}
        strokeWidth="4"
      />

      <circle
        cx="50"
        cy="50"
        r="8"
        fill="none"
        stroke={c}
        strokeWidth="3"
      />

      <circle
        cx="50"
        cy="50"
        r="2.5"
        fill={c}
      />
    </g>
  );
}

function IllustrationRepeaters({
  c,
}: IllustrationProps) {
  return (
    <g>
      <circle
        cx="50"
        cy="32"
        r="17"
        fill={c}
        opacity="0.12"
      />

      <circle
        cx="50"
        cy="32"
        r="17"
        fill="none"
        stroke={c}
        strokeWidth="2.5"
      />

      <line
        x1="50"
        y1="32"
        x2="50"
        y2="20"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="50"
        y1="32"
        x2="59"
        y2="37"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <circle
        cx="50"
        cy="32"
        r="2.5"
        fill={c}
      />

      <path
        d="M50 15 A17 17 0 0 1 65 40"
        fill="none"
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
      />

      <rect
        x="18"
        y="57"
        width="64"
        height="17"
        rx="4"
        fill={c}
        opacity="0.14"
      />

      <rect
        x="18"
        y="57"
        width="64"
        height="17"
        rx="4"
        fill="none"
        stroke={c}
        strokeWidth="2"
      />

      <rect
        x="25"
        y="61"
        width="16"
        height="5"
        rx="2"
        fill={c}
      />

      <rect
        x="59"
        y="61"
        width="16"
        height="5"
        rx="2"
        fill={c}
      />

      <text
        x="50"
        y="87"
        textAnchor="middle"
        fill={c}
        fontSize="11"
        fontWeight="900"
        fontFamily="ui-monospace, monospace"
      >
        7 / 3
      </text>
    </g>
  );
}

function IllustrationJump({
  c,
}: IllustrationProps) {
  return (
    <g>
      {[68, 55, 42, 29, 16].map(
        (y, index) => (
          <rect
            key={y}
            x={
              index % 2 === 0
                ? 23
                : 34
            }
            y={y}
            width="34"
            height="6"
            rx="3"
            fill={c}
          />
        ),
      )}

      <path
        d="M77 70 V25"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M68 34 L77 23 L86 34"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function IllustrationHeavyLight({
  c,
}: IllustrationProps) {
  return (
    <g>
      <rect
        x="17"
        y="27"
        width="66"
        height="6"
        rx="3"
        fill={c}
      />

      <rect
        x="21"
        y="32"
        width="5"
        height="22"
        rx="2"
        fill={c}
        opacity="0.45"
      />

      <rect
        x="74"
        y="32"
        width="5"
        height="22"
        rx="2"
        fill={c}
        opacity="0.45"
      />

      <path
        d="M56 17 L40 48 H49 L43 79 L64 43 H54 Z"
        fill={c}
      />
    </g>
  );
}

function IllustrationPullup({
  c,
}: IllustrationProps) {
  return (
    <g>
      <rect
        x="18"
        y="21"
        width="64"
        height="6"
        rx="3"
        fill={c}
      />

      <line
        x1="50"
        y1="27"
        x2="50"
        y2="57"
        stroke={c}
        strokeWidth="3"
      />

      <circle
        cx="50"
        cy="70"
        r="11"
        fill="none"
        stroke={c}
        strokeWidth="4"
      />

      <circle
        cx="50"
        cy="70"
        r="3"
        fill={c}
      />
    </g>
  );
}

function IllustrationBarbell({
  c,
}: IllustrationProps) {
  return (
    <g>
      <rect
        x="18"
        y="47"
        width="64"
        height="6"
        rx="3"
        fill={c}
      />

      <rect
        x="10"
        y="34"
        width="8"
        height="32"
        rx="3"
        fill={c}
      />

      <rect
        x="82"
        y="34"
        width="8"
        height="32"
        rx="3"
        fill={c}
      />

      <rect
        x="18"
        y="39"
        width="6"
        height="22"
        rx="2"
        fill={c}
        opacity="0.7"
      />

      <rect
        x="76"
        y="39"
        width="6"
        height="22"
        rx="2"
        fill={c}
        opacity="0.7"
      />
    </g>
  );
}

function IllustrationDumbbell({
  c,
}: IllustrationProps) {
  return (
    <g transform="rotate(-18 50 50)">
      <rect
        x="32"
        y="46"
        width="36"
        height="8"
        rx="4"
        fill={c}
      />

      <rect
        x="22"
        y="35"
        width="11"
        height="30"
        rx="4"
        fill={c}
      />

      <rect
        x="67"
        y="35"
        width="11"
        height="30"
        rx="4"
        fill={c}
      />

      <rect
        x="16"
        y="40"
        width="6"
        height="20"
        rx="3"
        fill={c}
        opacity="0.7"
      />

      <rect
        x="78"
        y="40"
        width="6"
        height="20"
        rx="3"
        fill={c}
        opacity="0.7"
      />
    </g>
  );
}

function IllustrationPulley({
  c,
}: IllustrationProps) {
  return (
    <g>
      <circle
        cx="50"
        cy="25"
        r="12"
        fill={c}
        opacity="0.13"
      />

      <circle
        cx="50"
        cy="25"
        r="12"
        fill="none"
        stroke={c}
        strokeWidth="4"
      />

      <circle
        cx="50"
        cy="25"
        r="4"
        fill={c}
      />

      <path
        d="M40 27 L28 68"
        fill="none"
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M60 27 L72 68"
        fill="none"
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
      />

      <circle
        cx="27"
        cy="71"
        r="5"
        fill={c}
      />

      <circle
        cx="73"
        cy="71"
        r="5"
        fill={c}
      />
    </g>
  );
}

function Stopwatch({
  c,
  x,
  y,
}: {
  c: string;
  x: number;
  y: number;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="10"
        fill="none"
        stroke={c}
        strokeWidth="4"
      />

      <rect
        x={x - 3}
        y={y - 15}
        width="6"
        height="5"
        rx="2"
        fill={c}
      />

      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y - 6}
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1={x}
        y1={y}
        x2={x + 5}
        y2={y + 3}
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  );
}

function IllustrationPlank({
  c,
}: IllustrationProps) {
  return (
    <g>
      <rect
        x="20"
        y="48"
        width="51"
        height="7"
        rx="3.5"
        fill={c}
      />

      <path
        d="M25 55 L19 72 H31"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M67 55 L75 72"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <Stopwatch
        c={c}
        x={79}
        y={44}
      />
    </g>
  );
}

function IllustrationSidePlank({
  c,
}: IllustrationProps) {
  return (
    <g>
      <path
        d="M25 68 L70 43"
        fill="none"
        stroke={c}
        strokeWidth="8"
        strokeLinecap="round"
      />

      <path
        d="M29 66 L21 77 H34"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Stopwatch
        c={c}
        x={78}
        y={37}
      />
    </g>
  );
}

function Footprint({
  c,
  x,
  y,
  rotation = 0,
}: {
  c: string;
  x: number;
  y: number;
  rotation?: number;
}) {
  return (
    <g
      transform={`rotate(${rotation} ${x} ${y})`}
    >
      <ellipse
        cx={x}
        cy={y}
        rx="6"
        ry="11"
        fill={c}
      />

      <circle
        cx={x - 5}
        cy={y - 11}
        r="2"
        fill={c}
      />

      <circle
        cx={x - 2}
        cy={y - 14}
        r="2.2"
        fill={c}
      />

      <circle
        cx={x + 2}
        cy={y - 14}
        r="2.3"
        fill={c}
      />

      <circle
        cx={x + 6}
        cy={y - 12}
        r="2"
        fill={c}
      />
    </g>
  );
}

function IllustrationSquat({
  c,
}: IllustrationProps) {
  return (
    <g>
      <Footprint
        c={c}
        x={32}
        y={64}
        rotation={-8}
      />

      <Footprint
        c={c}
        x={68}
        y={64}
        rotation={8}
      />

      <path
        d="M50 22 V48"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M41 40 L50 51 L59 40"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function IllustrationLunge({
  c,
}: IllustrationProps) {
  return (
    <g>
      <rect
        x="54"
        y="60"
        width="31"
        height="8"
        rx="3"
        fill={c}
        opacity="0.35"
      />

      <rect
        x="58"
        y="68"
        width="5"
        height="12"
        rx="2"
        fill={c}
        opacity="0.35"
      />

      <rect
        x="77"
        y="68"
        width="5"
        height="12"
        rx="2"
        fill={c}
        opacity="0.35"
      />

      <Footprint
        c={c}
        x={69}
        y={48}
        rotation={88}
      />

      <Footprint
        c={c}
        x={31}
        y={69}
        rotation={-7}
      />

      <path
        d="M45 23 V46"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M36 39 L45 50 L54 39"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function IllustrationCalf({
  c,
}: IllustrationProps) {
  return (
    <g>
      <rect
        x="20"
        y="68"
        width="60"
        height="9"
        rx="3"
        fill={c}
        opacity="0.35"
      />

      <path
        d="M28 59 Q38 51 53 53 Q65 54 72 64 L55 66 Q43 62 28 64 Z"
        fill={c}
      />

      <circle
        cx="70"
        cy="63"
        r="4"
        fill={c}
      />

      <path
        d="M82 61 V31"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M73 40 L82 29 L91 40"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function IllustrationChart({
  c,
}: IllustrationProps) {
  return (
    <g>
      <line
        x1="20"
        y1="76"
        x2="20"
        y2="24"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
      />

      <line
        x1="20"
        y1="76"
        x2="81"
        y2="76"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M24 66 L37 59 L50 62 L63 45 L78 27"
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="78"
        cy="27"
        r="4"
        fill={c}
      />
    </g>
  );
}

const ILLUSTRATIONS: Record<
  string,
  (
    props: IllustrationProps,
  ) => ReactElement
> = {
  pullup:
    IllustrationPullup,

  "fingerboard-20":
    IllustrationFingerboard20,

  "fingerboard-25":
    IllustrationFingerboard25,

  sloper:
    IllustrationSloper,

  pinch:
    IllustrationPinch,

  repeaters:
    IllustrationRepeaters,

  jump:
    IllustrationJump,

  "heavy-light":
    IllustrationHeavyLight,

  barbell:
    IllustrationBarbell,

  dumbbell:
    IllustrationDumbbell,

  pulley:
    IllustrationPulley,

  plank:
    IllustrationPlank,

  "side-plank":
    IllustrationSidePlank,

  squat:
    IllustrationSquat,

  lunge:
    IllustrationLunge,

  calf:
    IllustrationCalf,

  chart:
    IllustrationChart,
};

function hexPoints(
  centerX: number,
  centerY: number,
  radius: number,
): string {
  return Array.from(
    {
      length: 6,
    },
    (_, index) => {
      const angle =
        ((60 * index - 30) *
          Math.PI) /
        180;

      return `${
        centerX +
        radius *
          Math.cos(angle)
      },${
        centerY +
        radius *
          Math.sin(angle)
      }`;
    },
  ).join(" ");
}

function getLevelPalette(
  level: BadgeLevel | null,
) {
  if (!level) {
    return {
      light: "#4A4A4A",
      middle: "#292929",
      dark: "#151515",
      shadow: "#050505",
      innerTop: "#1C1C1C",
      innerBottom: "#090909",
      illustration: "#505050",
      glow: "#000000",
    };
  }

  switch (level) {
    case "bronze":
      return {
        light: "#FFD0A0",
        middle: "#CD7F32",
        dark: "#7D451E",
        shadow: "#2C1408",
        innerTop: "#251B15",
        innerBottom: "#0E0B09",
        illustration: "#FFF7EF",
        glow: "#CD7F32",
      };

    case "silver":
      return {
        light: "#FFFFFF",
        middle: "#C7CCD3",
        dark: "#747B85",
        shadow: "#22262C",
        innerTop: "#202328",
        innerBottom: "#0C0D0F",
        illustration: "#FFFFFF",
        glow: "#C7CCD3",
      };

    case "gold":
      return {
        light: "#FFF4A8",
        middle: "#FFD700",
        dark: "#A66A00",
        shadow: "#3C2200",
        innerTop: "#28210C",
        innerBottom: "#0E0C06",
        illustration: "#FFFFFF",
        glow: "#FFD700",
      };

    case "diamond":
      return {
        light: "#EFFFFF",
        middle: "#67E8F9",
        dark: "#218AB6",
        shadow: "#062A40",
        innerTop: "#10262D",
        innerBottom: "#071013",
        illustration: "#FFFFFF",
        glow: "#67E8F9",
      };
  }
}

function adjustHexColor(
  color: string,
  amount: number,
): string {
  const clean =
    color.replace("#", "");

  const number =
    Number.parseInt(
      clean,
      16,
    );

  const red =
    Math.max(
      0,
      Math.min(
        255,
        (
          number >> 16
        ) + amount,
      ),
    );

  const green =
    Math.max(
      0,
      Math.min(
        255,
        (
          (
            number >> 8
          ) &
          0x00ff
        ) + amount,
      ),
    );

  const blue =
    Math.max(
      0,
      Math.min(
        255,
        (
          number &
          0x0000ff
        ) + amount,
      ),
    );

  return `#${[
    red,
    green,
    blue,
  ]
    .map((value) =>
      value
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

interface BadgeHexProps {
  icon: string;
  level: BadgeLevel | null;
  size?: number;
  showLevelRing?: boolean;
  animate?: boolean;

  kind?: BadgeKind;
  visualColor?: string;
  label?: string;
}

function ColorHoldBadge({
  size,
  visualColor,
  locked,
  uniqueId,
  animate,
}: {
  size: number;
  visualColor: string;
  locked: boolean;
  uniqueId: string;
  animate: boolean;
}) {
  const baseColor =
    locked
      ? "#353535"
      : visualColor;

  const lightColor =
    locked
      ? "#555555"
      : adjustHexColor(
          visualColor,
          55,
        );

  const darkColor =
    locked
      ? "#151515"
      : adjustHexColor(
          visualColor,
          -65,
        );

  const gradientId =
    `hold-${uniqueId}`;

  const shadowId =
    `hold-shadow-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={
        locked
          ? "Badge couleur verrouillé"
          : "Badge couleur débloqué"
      }
      className={
        animate
          ? "badge-unlock-animation"
          : undefined
      }
      style={{
        overflow: "visible",
      }}
    >
      <defs>
        <radialGradient
          id={gradientId}
          cx="32%"
          cy="25%"
          r="72%"
        >
          <stop
            offset="0%"
            stopColor={lightColor}
          />

          <stop
            offset="42%"
            stopColor={baseColor}
          />

          <stop
            offset="100%"
            stopColor={darkColor}
          />
        </radialGradient>

        <filter
          id={shadowId}
          x="-40%"
          y="-40%"
          width="180%"
          height="190%"
        >
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="4"
            floodColor="#000000"
            floodOpacity="0.75"
          />
        </filter>
      </defs>

      <ellipse
        cx="50"
        cy="84"
        rx="32"
        ry="8"
        fill="#000000"
        opacity="0.45"
      />

      <path
        d="
          M17 57
          C17 35 32 18 52 17
          C72 16 85 30 84 48
          C83 67 69 81 48 83
          C29 84 17 75 17 57
          Z
        "
        fill={`url(#${gradientId})`}
        stroke={
          locked
            ? "#505050"
            : lightColor
        }
        strokeWidth="2"
        filter={`url(#${shadowId})`}
        opacity={
          locked
            ? 0.55
            : 1
        }
      />

      <ellipse
        cx="43"
        cy="38"
        rx="15"
        ry="10"
        fill="#FFFFFF"
        opacity={
          locked
            ? 0.06
            : 0.22
        }
        transform="rotate(-18 43 38)"
      />

      <path
        d="M26 66 C39 76 63 73 76 58"
        fill="none"
        stroke={darkColor}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.55"
      />

      <circle
        cx="52"
        cy="55"
        r="7"
        fill={darkColor}
        opacity="0.85"
      />

      <circle
        cx="50"
        cy="53"
        r="2.3"
        fill={
          locked
            ? "#777777"
            : lightColor
        }
      />

      {locked && (
        <g>
          <circle
            cx="50"
            cy="55"
            r="13"
            fill="#101010"
            opacity="0.88"
          />

          <path
            d="M45 52 V48 C45 41 55 41 55 48 V52"
            fill="none"
            stroke="#858585"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <rect
            x="43"
            y="51"
            width="14"
            height="11"
            rx="3"
            fill="#656565"
          />
        </g>
      )}
    </svg>
  );
}

function KilterBadge({
  size,
  level,
  label,
  uniqueId,
  animate,
}: {
  size: number;
  level: BadgeLevel | null;
  label: string;
  uniqueId: string;
  animate: boolean;
}) {
  const locked =
    level === null;

  const palette =
    getLevelPalette(level);

  const ringId =
    `kilter-ring-${uniqueId}`;

  const centerId =
    `kilter-center-${uniqueId}`;

  const shadowId =
    `kilter-shadow-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={
        locked
          ? `${label} verrouillé`
          : `${label} ${
              BADGE_LEVEL_META[
                level
              ].label
            }`
      }
      className={
        animate
          ? "badge-unlock-animation"
          : undefined
      }
      style={{
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient
          id={ringId}
          x1="15%"
          y1="5%"
          x2="85%"
          y2="95%"
        >
          <stop
            offset="0%"
            stopColor={
              palette.light
            }
          />

          <stop
            offset="35%"
            stopColor={
              palette.middle
            }
          />

          <stop
            offset="70%"
            stopColor={
              palette.dark
            }
          />

          <stop
            offset="100%"
            stopColor={
              palette.shadow
            }
          />
        </linearGradient>

        <radialGradient
          id={centerId}
          cx="35%"
          cy="25%"
          r="75%"
        >
          <stop
            offset="0%"
            stopColor={
              locked
                ? "#343434"
                : "#242424"
            }
          />

          <stop
            offset="100%"
            stopColor="#070707"
          />
        </radialGradient>

        <filter
          id={shadowId}
          x="-35%"
          y="-35%"
          width="170%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.8"
          />
        </filter>
      </defs>

      <ellipse
        cx="50"
        cy="86"
        rx="31"
        ry="7"
        fill="#000000"
        opacity="0.5"
      />

      <circle
        cx="50"
        cy="48"
        r="42"
        fill={`url(#${ringId})`}
        filter={`url(#${shadowId})`}
        opacity={
          locked
            ? 0.45
            : 1
        }
      />

      <circle
        cx="50"
        cy="48"
        r="35"
        fill={`url(#${centerId})`}
        stroke={
          locked
            ? "#3D3D3D"
            : palette.middle
        }
        strokeWidth="1.3"
      />

      {!locked && (
        <path
          d="M24 33 C34 13 65 10 78 31"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.22"
        />
      )}

      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill={
          locked
            ? "#666666"
            : "#FFFFFF"
        }
        fontSize={
          label.length > 2
            ? "27"
            : "31"
        }
        fontWeight="950"
        fontFamily="ui-monospace, monospace"
        letterSpacing="-2"
      >
        {label}
      </text>

      {locked && (
        <g>
          <circle
            cx="50"
            cy="73"
            r="9"
            fill="#101010"
            stroke="#414141"
          />

          <path
            d="M46 71 V68 C46 62.5 54 62.5 54 68 V71"
            fill="none"
            stroke="#757575"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <rect
            x="44.5"
            y="70"
            width="11"
            height="8.5"
            rx="2"
            fill="#626262"
          />
        </g>
      )}

      {level ===
        "diamond" && (
        <path
          d="M50 1 L56 8 L50 15 L44 8 Z"
          fill="#F4FFFF"
          stroke="#67E8F9"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}

interface BadgeHexProps {
  icon: string;
  level: BadgeLevel | null;
  size?: number;
  showLevelRing?: boolean;
  animate?: boolean;

  kind?: BadgeKind;
  visualColor?: string;
  label?: string;
}

export function BadgeHex({
  icon,
  level,
  size = 90,
  showLevelRing = true,
  animate = false,
  kind = "standard",
  visualColor = "#808080",
  label = "",
}: BadgeHexProps) {
  const rawId =
    useId();

  const uniqueId =
    rawId.replace(
      /:/g,
      "",
    );

  const locked =
    level === null;

  if (
    kind ===
    "climbing-color"
  ) {
    return (
      <ColorHoldBadge
        size={size}
        visualColor={
          visualColor
        }
        locked={locked}
        uniqueId={
          uniqueId
        }
        animate={
          animate
        }
      />
    );
  }

  if (
    kind ===
    "kilter"
  ) {
    return (
      <KilterBadge
        size={size}
        level={level}
        label={
          label || "V?"
        }
        uniqueId={
          uniqueId
        }
        animate={
          animate
        }
      />
    );
  }

  const Illustration =
    ILLUSTRATIONS[
      icon
    ];

  const palette =
    getLevelPalette(
      level,
    );

  const borderGradientId =
    `border-${uniqueId}`;

  const innerGradientId =
    `inner-${uniqueId}`;

  const shineGradientId =
    `shine-${uniqueId}`;

  const shadowFilterId =
    `shadow-${uniqueId}`;

  const glowFilterId =
    `glow-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={
        level
          ? `Badge ${
              BADGE_LEVEL_META[
                level
              ].label
            }`
          : "Badge verrouillé"
      }
      className={
        animate
          ? "badge-unlock-animation"
          : undefined
      }
      style={{
        overflow:
          "visible",
      }}
    >
      <defs>
        <linearGradient
          id={
            borderGradientId
          }
          x1="15%"
          y1="5%"
          x2="85%"
          y2="95%"
        >
          <stop
            offset="0%"
            stopColor={
              palette.light
            }
          />

          <stop
            offset="28%"
            stopColor={
              palette.middle
            }
          />

          <stop
            offset="60%"
            stopColor={
              palette.dark
            }
          />

          <stop
            offset="82%"
            stopColor={
              palette.middle
            }
          />

          <stop
            offset="100%"
            stopColor={
              palette.shadow
            }
          />
        </linearGradient>

        <linearGradient
          id={
            innerGradientId
          }
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor={
              palette.innerTop
            }
          />

          <stop
            offset="100%"
            stopColor={
              palette.innerBottom
            }
          />
        </linearGradient>

        <linearGradient
          id={
            shineGradientId
          }
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor="#FFFFFF"
            stopOpacity="0.75"
          />

          <stop
            offset="45%"
            stopColor="#FFFFFF"
            stopOpacity="0.08"
          />

          <stop
            offset="100%"
            stopColor="#FFFFFF"
            stopOpacity="0"
          />
        </linearGradient>

        <filter
          id={
            shadowFilterId
          }
          x="-25%"
          y="-25%"
          width="150%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="2.5"
            floodColor="#000000"
            floodOpacity="0.75"
          />
        </filter>

        <filter
          id={
            glowFilterId
          }
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="2.2"
            floodColor={
              palette.glow
            }
            floodOpacity={
              locked
                ? 0
                : 0.45
            }
          />
        </filter>

        <clipPath
          id={`clip-${uniqueId}`}
        >
          <polygon
            points={hexPoints(
              50,
              49,
              32.5,
            )}
          />
        </clipPath>
      </defs>

      <polygon
        points={hexPoints(
          50,
          53,
          43,
        )}
        fill="#000000"
        opacity="0.55"
      />

      {showLevelRing && (
        <polygon
          points={hexPoints(
            50,
            49,
            44,
          )}
          fill={`url(#${borderGradientId})`}
          filter={`url(#${shadowFilterId})`}
          opacity={
            locked
              ? 0.5
              : 1
          }
        />
      )}

      <polygon
        points={hexPoints(
          50,
          49,
          39.5,
        )}
        fill={
          locked
            ? "#222222"
            : palette.dark
        }
        opacity="0.96"
      />

      <polygon
        points={hexPoints(
          50,
          49,
          35,
        )}
        fill={`url(#${innerGradientId})`}
        stroke={
          locked
            ? "#343434"
            : palette.middle
        }
        strokeWidth="1"
        strokeOpacity={
          locked
            ? 0.55
            : 0.5
        }
      />

      {!locked && (
        <path
          d="M15 27 L50 6.5 L85 27 L81 30 L50 12 L19 30 Z"
          fill={`url(#${shineGradientId})`}
          opacity="0.65"
        />
      )}

      <g
        clipPath={`url(#clip-${uniqueId})`}
        opacity={
          locked
            ? 0.38
            : 1
        }
        transform="translate(10 10) scale(0.8)"
        filter={
          locked
            ? undefined
            : `url(#${glowFilterId})`
        }
        pointerEvents="none"
      >
        {Illustration ? (
          <Illustration
            c={
              palette.illustration
            }
          />
        ) : (
          <text
            x="50"
            y="56"
            textAnchor="middle"
            fill={
              palette.illustration
            }
            fontSize="24"
            fontWeight="900"
          >
            ?
          </text>
        )}
      </g>

      {locked && (
        <g
          transform="translate(0 1)"
          opacity="0.9"
          pointerEvents="none"
        >
          <circle
            cx="50"
            cy="78"
            r="10"
            fill="#101010"
            stroke="#414141"
            strokeWidth="1.2"
          />

          <path
            d="M46 75 V72.5 C46 67 54 67 54 72.5 V75"
            fill="none"
            stroke="#757575"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <rect
            x="44.5"
            y="74"
            width="11"
            height="8.5"
            rx="2"
            fill="#626262"
          />

          <circle
            cx="50"
            cy="78"
            r="1.2"
            fill="#202020"
          />
        </g>
      )}

      {level ===
        "diamond" && (
        <g pointerEvents="none">
          <path
            d="M50 3 L55 8 L50 13 L45 8 Z"
            fill="#F4FFFF"
            stroke="#67E8F9"
            strokeWidth="1"
          />

          <path
            d="M50 3 V13 M45 8 H55"
            stroke="#218AB6"
            strokeWidth="0.7"
          />
        </g>
      )}
    </svg>
  );
}