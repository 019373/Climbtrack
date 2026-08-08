import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  Award,
  BarChart3,
  Dumbbell,
  Footprints,
  Lock,
  Mountain,
} from "lucide-react";

import {
  BADGE_LEVEL_META,
} from "@/data/badges";

import type {
  BadgeDefinition,
  BadgeLevel,
} from "@/data/badges";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BadgeHexProps {
  badge: BadgeDefinition;
  level?: BadgeLevel | null;
  unlocked?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
  onClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dimensions
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_CLASSES = {
  small: {
    wrapper:
      "w-[86px]",

    badge:
      "h-[74px] w-[68px]",

    icon:
      26,

    title:
      "text-[9px]",

    level:
      "text-[7px]",

    lock:
      14,
  },

  medium: {
    wrapper:
      "w-[112px]",

    badge:
      "h-[98px] w-[90px]",

    icon:
      35,

    title:
      "text-[11px]",

    level:
      "text-[9px]",

    lock:
      17,
  },

  large: {
    wrapper:
      "w-[156px]",

    badge:
      "h-[136px] w-[124px]",

    icon:
      48,

    title:
      "text-sm",

    level:
      "text-[10px]",

    lock:
      20,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Hexagone
// ─────────────────────────────────────────────────────────────────────────────

function Hexagon({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center",
        className,
      )}
      style={{
        clipPath:
          "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",

        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icône voie
// ─────────────────────────────────────────────────────────────────────────────

function RouteWallIcon({
  grade,
  unlocked,
}: {
  grade: string;
  unlocked: boolean;
}) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 54L18 12L44 7L50 54H15Z"
        fill={
          unlocked
            ? "rgba(255,255,255,0.13)"
            : "rgba(255,255,255,0.05)"
        }
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M38 8C33 17 44 22 36 31C30 38 37 45 32 54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="25"
        cy="20"
        r="2.5"
        fill="currentColor"
      />

      <path
        d="M39 25L43 23L45 27L41 29L39 25Z"
        fill="currentColor"
      />

      <path
        d="M23 40L27 37L30 41L26 44L23 40Z"
        fill="currentColor"
      />

      <rect
        x="17"
        y="28"
        width="6"
        height="3.5"
        rx="1.75"
        transform="rotate(-18 17 28)"
        fill="currentColor"
      />

      <rect
        x="38"
        y="44"
        width="6"
        height="3.5"
        rx="1.75"
        transform="rotate(17 38 44)"
        fill="currentColor"
      />

      <rect
        x="19"
        y="46"
        width="26"
        height="11"
        rx="5.5"
        fill={
          unlocked
            ? "currentColor"
            : "rgba(255,255,255,0.15)"
        }
      />

      <text
        x="32"
        y="54"
        textAnchor="middle"
        fontSize="8"
        fontWeight="900"
        fill={
          unlocked
            ? "#090909"
            : "currentColor"
        }
      >
        {grade}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icône sloper
// ─────────────────────────────────────────────────────────────────────────────

function SloperIcon({
  targetAngle,
}: {
  targetAngle?: number;
}) {
  return (
    <svg
      width="62"
      height="58"
      viewBox="0 0 62 58"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 43C11 30 18 16 30 12C43 9 52 20 51 38C50 47 43 50 31 50H20C13 50 8 47 9 43Z"
        fill="rgba(255,255,255,0.12)"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M15 38C21 29 29 23 43 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {targetAngle !==
      undefined ? (
        <text
          x="31"
          y="36"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fill="currentColor"
        >
          {targetAngle}°
        </text>
      ) : (
        <>
          <text
            x="23"
            y="34"
            textAnchor="middle"
            fontSize="8"
            fontWeight="900"
            fill="currentColor"
          >
            35°
          </text>

          <text
            x="40"
            y="39"
            textAnchor="middle"
            fontSize="8"
            fontWeight="900"
            fill="currentColor"
          >
            43°
          </text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icônes
// ─────────────────────────────────────────────────────────────────────────────

function DipsIcon() {
  return (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 20V48M46 20V48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M9 21H22M36 21H49"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="29"
        cy="12"
        r="5"
        fill="currentColor"
      />

      <path
        d="M29 17V32M29 22L19 25M29 22L39 25M29 32L23 43M29 32L35 43"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinchIcon() {
  return (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="8"
        width="18"
        height="25"
        rx="5"
        fill="rgba(255,255,255,0.12)"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M29 33V43"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      <circle
        cx="29"
        cy="48"
        r="6"
        fill="rgba(255,255,255,0.12)"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M15 14C11 18 12 27 19 29M43 14C47 18 46 27 39 29"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PullupIcon() {
  return (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 9H49"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="29"
        cy="23"
        r="5"
        fill="currentColor"
      />

      <path
        d="M29 28V41M29 31L18 16M29 31L40 16M29 41L23 51M29 41L35 51"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FingerboardIcon({
  text,
}: {
  text?: string;
}) {
  return (
    <svg
      width="62"
      height="58"
      viewBox="0 0 62 58"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="46"
        height="27"
        rx="5"
        fill="rgba(255,255,255,0.09)"
        stroke="currentColor"
        strokeWidth="2"
      />

      <rect
        x="13"
        y="15"
        width="15"
        height="6"
        rx="2"
        fill="currentColor"
      />

      <rect
        x="34"
        y="15"
        width="15"
        height="6"
        rx="2"
        fill="currentColor"
      />

      {text && (
        <text
          x="31"
          y="31"
          textAnchor="middle"
          fontSize="8"
          fontWeight="900"
          fill="currentColor"
        >
          {text}
        </text>
      )}

      <path
        d="M21 35V47M41 35V47"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloc de couleur
// ─────────────────────────────────────────────────────────────────────────────

function SimpleHoldIcon({
  color,
  unlocked,
}: {
  color?: string;
  unlocked: boolean;
}) {
  const fill =
    unlocked
      ? color ??
        "#ffffff"
      : "#292929";

  return (
    <svg
      width="66"
      height="62"
      viewBox="0 0 66 62"
      fill="none"
      aria-hidden="true"
    >
      {/*
       * Prise volontairement simple.
       *
       * Aucun reflet, aucune bulle,
       * aucun œil.
       */}
      <path
        d="M11 39C13 27 20 14 34 11C47 8 57 16 54 29C51 42 42 51 27 52C16 53 9 48 11 39Z"
        fill={fill}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Illustration générique
// ─────────────────────────────────────────────────────────────────────────────

function BadgeIllustration({
  badge,
  unlocked,
  iconSize,
}: {
  badge: BadgeDefinition;
  unlocked: boolean;
  iconSize: number;
}) {
  const iconProps = {
    size:
      iconSize,

    strokeWidth:
      1.8,
  };

  switch (
    badge.icon
  ) {
    case "route-wall": {
      const grade =
        badge.levels[0]
          ?.routeGrade ??
        badge.name.replace(
          "Voie ",
          "",
        );

      return (
        <RouteWallIcon
          grade={
            grade
          }
          unlocked={
            unlocked
          }
        />
      );
    }

    case "sloper":
      return (
        <SloperIcon
          targetAngle={
            badge.targetAngle
          }
        />
      );

    case "dips":
      return (
        <DipsIcon />
      );

    case "pinch":
      return (
        <PinchIcon />
      );

    case "pullup":
      return (
        <PullupIcon />
      );

    case "fingerboard-20":
      return (
        <FingerboardIcon
          text="20 mm"
        />
      );

    case "fingerboard-25":
      return (
        <FingerboardIcon
          text="25 mm"
        />
      );

    case "repeaters":
      return (
        <FingerboardIcon />
      );

    case "hold":
      return (
        <SimpleHoldIcon
          color={
            badge.visualColor
          }
          unlocked={
            unlocked
          }
        />
      );

    case "barbell":
      return (
        <Dumbbell
          {...iconProps}
        />
      );

    case "lunge":
    case "calf":
      return (
        <Footprints
          {...iconProps}
        />
      );

    case "jump":
      return (
        <Mountain
          {...iconProps}
        />
      );

    case "chart":
      return (
        <BarChart3
          {...iconProps}
        />
      );

    default:
      return (
        <Award
          {...iconProps}
        />
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Niveau
// ─────────────────────────────────────────────────────────────────────────────

function getRouteLevelLabel(
  level?: BadgeLevel | null,
): string {
  if (
    level ===
    "diamond"
  ) {
    return "EN TÊTE";
  }

  if (
    level ===
    "gold"
  ) {
    return "MOULINETTE";
  }

  return "";
}

function LevelPill({
  badge,
  level,
  unlocked,
  size,
}: {
  badge: BadgeDefinition;
  level?: BadgeLevel | null;
  unlocked: boolean;
  size: "small" | "medium" | "large";
}) {
  if (
    !level ||
    badge.hideLevelLabel
  ) {
    return null;
  }

  const meta =
    BADGE_LEVEL_META[
      level
    ];

  const routeLabel =
    badge.kind ===
    "route"
      ? getRouteLevelLabel(
          level,
        )
      : "";

  const label =
    routeLabel ||
    meta.label.toUpperCase();

  return (
    <div
      className={cn(
        "relative -mt-2 rounded-full border px-2.5 py-1 font-black uppercase leading-none",

        size ===
          "small"
          ? "text-[7px]"
          : size ===
              "large"
            ? "text-[11px]"
            : "text-[9px]",
      )}
      style={{
        borderColor:
          unlocked
            ? meta.border
            : "#454545",

        backgroundColor:
          unlocked
            ? meta.border
            : "#181818",

        color:
          unlocked
            ? "#090909"
            : "#666666",
      }}
    >
      {
        label
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kilter
// ─────────────────────────────────────────────────────────────────────────────

function KilterBadge({
  badge,
  level,
  unlocked,
  size,
}: {
  badge: BadgeDefinition;
  level?: BadgeLevel | null;
  unlocked: boolean;
  size: "small" | "medium" | "large";
}) {
  const gradeMatch =
    badge.name.match(
      /V\d+/,
    );

  const gradeText =
    gradeMatch?.[0] ??
    "K";

  const levelMeta =
    level
      ? BADGE_LEVEL_META[
          level
        ]
      : null;

  const diameter =
    size ===
    "large"
      ? 112
      : size ===
          "small"
        ? 62
        : 84;

  const fontSize =
    size ===
    "large"
      ? 37
      : size ===
          "small"
        ? 20
        : 28;

  const ringColor =
    unlocked &&
    levelMeta
      ? levelMeta.border
      : "#393939";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width:
            diameter,

          height:
            diameter,

          background:
            unlocked
              ? `linear-gradient(145deg, ${ringColor}, #222 60%, ${ringColor})`
              : "linear-gradient(145deg, #333, #151515)",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            inset:
              size ===
              "small"
                ? 5
                : 7,

            backgroundColor:
              "#101010",

            border:
              `2px solid ${
                unlocked
                  ? "rgba(255,255,255,0.25)"
                  : "#414141"
              }`,
          }}
        />

        <span
          className="relative z-10 font-black tracking-tight"
          style={{
            fontSize,

            color:
              unlocked
                ? "#ffffff"
                : "#666666",
          }}
        >
          {
            gradeText
          }
        </span>

        {!unlocked && (
          <div className="absolute bottom-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#171717] text-[#777]">
            <Lock
              size={
                size ===
                "small"
                  ? 13
                  : 16
              }
              strokeWidth={
                2.4
              }
            />
          </div>
        )}
      </div>

      <LevelPill
        badge={
          badge
        }
        level={
          level
        }
        unlocked={
          unlocked
        }
        size={
          size
        }
      />

      <p
        className={cn(
          "mt-2 line-clamp-2 max-w-full px-1 text-center font-bold leading-tight",

          SIZE_CLASSES[
            size
          ].title,

          unlocked
            ? "text-white"
            : "text-muted-foreground/60",
        )}
      >
        {
          badge.name
        }
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloc couleur
// ─────────────────────────────────────────────────────────────────────────────

function ClimbingColorBadge({
  badge,
  unlocked,
  size,
}: {
  badge: BadgeDefinition;
  unlocked: boolean;
  size: "small" | "medium" | "large";
}) {
  const diameter =
    size ===
    "large"
      ? 118
      : size ===
          "small"
        ? 64
        : 88;

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative flex items-center justify-center",

          !unlocked &&
            "opacity-55",
        )}
        style={{
          width:
            diameter,

          height:
            diameter,
        }}
      >
        <SimpleHoldIcon
          color={
            badge.visualColor
          }
          unlocked={
            unlocked
          }
        />

        {!unlocked && (
          <div className="absolute bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#171717] text-[#777]">
            <Lock
              size={
                size ===
                "small"
                  ? 13
                  : 16
              }
              strokeWidth={
                2.4
              }
            />
          </div>
        )}
      </div>

      <p
        className={cn(
          "mt-2 line-clamp-2 max-w-full px-1 text-center font-bold leading-tight",

          SIZE_CLASSES[
            size
          ].title,

          unlocked
            ? "text-white"
            : "text-muted-foreground/60",
        )}
      >
        {
          badge.name
        }
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge principal
// ─────────────────────────────────────────────────────────────────────────────

export function BadgeHex({
  badge,
  level = null,
  unlocked = false,
  size = "medium",
  className,
  onClick,
}: BadgeHexProps) {
  const sizeConfig =
    SIZE_CLASSES[
      size
    ];

  const levelMeta =
    level
      ? BADGE_LEVEL_META[
          level
        ]
      : null;

  const borderColor =
    unlocked &&
    levelMeta
      ? levelMeta.border
      : "#292929";

  const innerBorder =
    unlocked
      ? "rgba(255,255,255,0.16)"
      : "#343434";

  const isKilter =
    badge.kind ===
    "kilter";

  const isColorBadge =
    badge.kind ===
      "climbing-color" ||
    badge.icon ===
      "hold";

  let content:
    ReactNode;

  // ── Kilter ───────────────────────────────────────────────────────────────

  if (
    isKilter
  ) {
    content = (
      <div
        className={cn(
          "flex flex-col items-center",

          sizeConfig.wrapper,

          onClick &&
            "cursor-pointer transition-transform active:scale-95",

          className,
        )}
      >
        <KilterBadge
          badge={
            badge
          }
          level={
            level
          }
          unlocked={
            unlocked
          }
          size={
            size
          }
        />
      </div>
    );
  }

  // ── Couleurs de blocs ────────────────────────────────────────────────────

  else if (
    isColorBadge
  ) {
    content = (
      <div
        className={cn(
          "flex flex-col items-center",

          sizeConfig.wrapper,

          onClick &&
            "cursor-pointer transition-transform active:scale-95",

          className,
        )}
      >
        <ClimbingColorBadge
          badge={
            badge
          }
          unlocked={
            unlocked
          }
          size={
            size
          }
        />
      </div>
    );
  }

  // ── Badge hexagonal normal ───────────────────────────────────────────────

  else {
    content = (
      <div
        className={cn(
          "flex flex-col items-center",

          sizeConfig.wrapper,

          onClick &&
            "cursor-pointer transition-transform active:scale-95",

          className,
        )}
      >
        <div
          className={cn(
            "relative",

            sizeConfig.badge,
          )}
          style={{
            filter:
              unlocked &&
              levelMeta
                ? `drop-shadow(0 0 5px ${levelMeta.glow}45)`
                : undefined,
          }}
        >
          {/* Bord extérieur */}

          <Hexagon
            className="inset-0"
            style={{
              backgroundColor:
                borderColor,
            }}
          />

          {/* Contour interne */}

          <Hexagon
            className="inset-[5px]"
            style={{
              backgroundColor:
                innerBorder,
            }}
          />

          {/* Intérieur */}

          <Hexagon className="inset-[8px] overflow-hidden bg-[#111111]">
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",

                unlocked
                  ? "text-white"
                  : "text-[#383838]",
              )}
            >
              <BadgeIllustration
                badge={
                  badge
                }
                unlocked={
                  unlocked
                }
                iconSize={
                  sizeConfig.icon
                }
              />
            </div>
          </Hexagon>

          {/* Cadenas */}

          {!unlocked && (
            <div className="absolute bottom-[1px] left-1/2 z-20 flex -translate-x-1/2 items-center justify-center rounded-full border border-[#454545] bg-[#181818] p-1.5 text-[#777777]">
              <Lock
                size={
                  sizeConfig.lock
                }
                strokeWidth={
                  2.4
                }
              />
            </div>
          )}
        </div>

        {/* Niveau */}

        <LevelPill
          badge={
            badge
          }
          level={
            level
          }
          unlocked={
            unlocked
          }
          size={
            size
          }
        />

        {/* Nom */}

        <p
          className={cn(
            "mt-2 line-clamp-2 min-h-[2.35em] max-w-full px-1 text-center font-bold leading-[1.15]",

            sizeConfig.title,

            unlocked
              ? "text-white"
              : "text-muted-foreground/55",
          )}
        >
          {
            badge.name
          }
        </p>
      </div>
    );
  }

  if (
    !onClick
  ) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="appearance-none border-0 bg-transparent p-0"
      aria-label={`${badge.name}${
        unlocked
          ? " débloqué"
          : " verrouillé"
      }`}
    >
      {
        content
      }
    </button>
  );
}