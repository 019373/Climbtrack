import { BadgeLevel, BADGE_LEVEL_META } from '@/data/badges';

// ── SVG Illustrations ─────────────────────────────────────────────────────────

function IllustrationPullup({ c }: { c: string }) {
  return (
    <g>
      {/* Bar */}
      <rect x="8" y="11" width="24" height="2.5" rx="1.2" fill={c} />
      {/* Hands */}
      <rect x="12" y="11" width="2.5" height="5" rx="1" fill={c} />
      <rect x="25.5" y="11" width="2.5" height="5" rx="1" fill={c} />
      {/* Body */}
      <ellipse cx="20" cy="22" rx="3" ry="5" fill={c} opacity="0.9" />
      {/* Weight disc */}
      <ellipse cx="20" cy="29" rx="6" ry="2.5" stroke={c} strokeWidth="1.5" fill="none" />
      <line x1="20" y1="27" x2="20" y2="16" stroke={c} strokeWidth="1.5" />
    </g>
  );
}

function IllustrationFingerboard20({ c }: { c: string }) {
  return (
    <g>
      {/* Board */}
      <rect x="7" y="14" width="26" height="9" rx="2" stroke={c} strokeWidth="1.5" fill="none" />
      {/* Edge cutouts */}
      <rect x="10" y="17" width="5" height="3" rx="1" fill={c} opacity="0.5" />
      <rect x="17.5" y="17" width="5" height="3" rx="1" fill={c} opacity="0.5" />
      <rect x="25" y="17" width="5" height="3" rx="1" fill={c} opacity="0.5" />
      {/* Text */}
      <text x="20" y="12" textAnchor="middle" fill={c} fontSize="5.5" fontWeight="bold" fontFamily="monospace">20mm</text>
      {/* Hanging lines */}
      <line x1="13" y1="9" x2="13" y2="14" stroke={c} strokeWidth="1.2" />
      <line x1="27" y1="9" x2="27" y2="14" stroke={c} strokeWidth="1.2" />
      {/* Anchor bar */}
      <line x1="10" y1="9" x2="30" y2="9" stroke={c} strokeWidth="1.5" />
    </g>
  );
}

function IllustrationDeadHang({ c }: { c: string }) {
  return (
    <g>
      {/* Bar */}
      <rect x="7" y="10" width="26" height="2.5" rx="1.2" fill={c} />
      {/* Left hand */}
      <rect x="11" y="12.5" width="3" height="4" rx="1" fill={c} />
      {/* Right hand */}
      <rect x="26" y="12.5" width="3" height="4" rx="1" fill={c} />
      {/* Arms */}
      <line x1="12.5" y1="16.5" x2="15" y2="21" stroke={c} strokeWidth="1.5" />
      <line x1="27.5" y1="16.5" x2="25" y2="21" stroke={c} strokeWidth="1.5" />
      {/* Body */}
      <ellipse cx="20" cy="24" rx="4" ry="6" fill={c} opacity="0.85" />
    </g>
  );
}

function IllustrationPinch({ c }: { c: string }) {
  return (
    <g>
      {/* Disc */}
      <circle cx="20" cy="24" r="7" stroke={c} strokeWidth="2" fill="none" />
      <circle cx="20" cy="24" r="2.5" fill={c} opacity="0.4" />
      {/* Fingers pinching */}
      <path d="M14 16 Q12 20 14 24" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M26 16 Q28 20 26 24" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M16 13 L16 17" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 13 L24 17" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 11 L20 16" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function IllustrationRepeaters({ c }: { c: string }) {
  return (
    <g>
      {/* Board */}
      <rect x="8" y="16" width="24" height="7" rx="2" stroke={c} strokeWidth="1.5" fill="none" />
      <rect x="11" y="18.5" width="4" height="2.5" rx="1" fill={c} opacity="0.5" />
      <rect x="18" y="18.5" width="4" height="2.5" rx="1" fill={c} opacity="0.5" />
      <rect x="25" y="18.5" width="4" height="2.5" rx="1" fill={c} opacity="0.5" />
      {/* Clock */}
      <circle cx="20" cy="10" r="4.5" stroke={c} strokeWidth="1.2" fill="none" />
      <line x1="20" y1="10" x2="20" y2="7" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="10" x2="22.5" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function IllustrationJump({ c }: { c: string }) {
  return (
    <g>
      {/* Prise */}
      <ellipse cx="20" cy="10" rx="5" ry="4" stroke={c} strokeWidth="1.5" fill={c} opacity="0.3" />
      {/* Hand reaching up */}
      <line x1="20" y1="14" x2="20" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* Body jumping */}
      <circle cx="20" cy="25" r="3" fill={c} opacity="0.85" />
      <line x1="20" y1="28" x2="17" y2="33" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="28" x2="23" y2="33" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function IllustrationHeavyLight({ c }: { c: string }) {
  return (
    <g>
      {/* Barbell */}
      <rect x="9" y="18" width="22" height="2.5" rx="1" fill={c} />
      {/* Heavy disc left */}
      <rect x="7" y="13" width="4" height="12" rx="1.5" fill={c} opacity="0.9" />
      {/* Light disc left-inner */}
      <rect x="11.5" y="15" width="2.5" height="8" rx="1" fill={c} opacity="0.6" />
      {/* Light disc right-inner */}
      <rect x="26" y="15" width="2.5" height="8" rx="1" fill={c} opacity="0.6" />
      {/* Heavy disc right */}
      <rect x="29" y="13" width="4" height="12" rx="1.5" fill={c} opacity="0.9" />
      {/* Lightning bolt */}
      <path d="M19 8 L17 16 L20 14 L18 22" stroke={c} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </g>
  );
}

function IllustrationMilitaryPress({ c }: { c: string }) {
  return (
    <g>
      {/* Overhead bar */}
      <rect x="8" y="10" width="24" height="2.5" rx="1.2" fill={c} />
      {/* Discs */}
      <rect x="6" y="8" width="3.5" height="7" rx="1" fill={c} opacity="0.9" />
      <rect x="30.5" y="8" width="3.5" height="7" rx="1" fill={c} opacity="0.9" />
      {/* Arms */}
      <line x1="14" y1="12.5" x2="16" y2="20" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="12.5" x2="24" y2="20" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="20" cy="25" rx="4" ry="6" fill={c} opacity="0.85" />
    </g>
  );
}

function IllustrationDumbbell({ c }: { c: string }) {
  return (
    <g>
      {/* Handle */}
      <rect x="13" y="18.5" width="14" height="3" rx="1.5" fill={c} />
      {/* Left discs */}
      <rect x="8" y="14" width="5" height="11" rx="2" fill={c} opacity="0.9" />
      {/* Right discs */}
      <rect x="27" y="14" width="5" height="11" rx="2" fill={c} opacity="0.9" />
      {/* Arrow up (rowing motion) */}
      <path d="M20 8 L20 13 M18 10.5 L20 8 L22 10.5" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function IllustrationPulley({ c }: { c: string }) {
  return (
    <g>
      {/* Wheel */}
      <circle cx="20" cy="12" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="12" r="2" fill={c} opacity="0.5" />
      {/* Rope left */}
      <line x1="14.5" y1="12" x2="10" y2="26" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      {/* Rope right */}
      <line x1="25.5" y1="12" x2="30" y2="26" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      {/* Handle */}
      <rect x="7" y="25" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.2" fill="none" />
      <rect x="27" y="25" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.2" fill="none" />
    </g>
  );
}

function IllustrationPlank({ c }: { c: string }) {
  return (
    <g>
      {/* Ground */}
      <line x1="7" y1="30" x2="33" y2="30" stroke={c} strokeWidth="1.2" opacity="0.4" />
      {/* Body */}
      <rect x="10" y="20" width="20" height="5" rx="2.5" fill={c} opacity="0.85" />
      {/* Arms */}
      <line x1="12" y1="25" x2="12" y2="30" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="25" x2="18" y2="30" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* Legs */}
      <line x1="27" y1="25" x2="27" y2="30" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* Head */}
      <circle cx="31" cy="22.5" r="3" fill={c} opacity="0.85" />
    </g>
  );
}

function IllustrationSidePlank({ c }: { c: string }) {
  return (
    <g>
      {/* Ground */}
      <line x1="6" y1="30" x2="34" y2="30" stroke={c} strokeWidth="1.2" opacity="0.4" />
      {/* Body - tilted */}
      <rect x="10" y="17" width="4" height="17" rx="2" fill={c} opacity="0.85" transform="rotate(-15 12 25)" />
      {/* Arm up */}
      <line x1="18" y1="20" x2="25" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* Elbow support */}
      <line x1="10" y1="27" x2="13" y2="30" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      {/* Head */}
      <circle cx="28" cy="17" r="3.5" fill={c} opacity="0.85" />
    </g>
  );
}

function IllustrationSquat({ c }: { c: string }) {
  return (
    <g>
      {/* Bar on shoulders */}
      <rect x="7" y="12" width="26" height="2.5" rx="1.2" fill={c} />
      <rect x="5" y="10" width="4" height="7" rx="1.2" fill={c} opacity="0.8" />
      <rect x="31" y="10" width="4" height="7" rx="1.2" fill={c} opacity="0.8" />
      {/* Torso (squatting position — leaning forward) */}
      <ellipse cx="20" cy="19" rx="3.5" ry="5" fill={c} opacity="0.85" transform="rotate(-10 20 19)" />
      {/* Legs */}
      <line x1="18" y1="23" x2="14" y2="31" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="23" x2="26" y2="31" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function IllustrationLunge({ c }: { c: string }) {
  return (
    <g>
      {/* Body */}
      <ellipse cx="20" cy="14" rx="3" ry="5" fill={c} opacity="0.85" />
      {/* Front leg */}
      <line x1="19" y1="19" x2="14" y2="27" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="27" x2="11" y2="31" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* Back leg */}
      <line x1="21" y1="19" x2="26" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="26" x2="28" y2="31" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* Dumbbells */}
      <rect x="10" y="18" width="6" height="2.5" rx="1" fill={c} opacity="0.8" />
      <rect x="24" y="18" width="6" height="2.5" rx="1" fill={c} opacity="0.8" />
    </g>
  );
}

function IllustrationCalf({ c }: { c: string }) {
  return (
    <g>
      {/* Leg */}
      <ellipse cx="20" cy="14" rx="5" ry="8" fill={c} opacity="0.85" />
      {/* Ankle */}
      <rect x="16" y="22" width="8" height="3" rx="1.5" fill={c} opacity="0.7" />
      {/* Foot on toes (elevated) */}
      <ellipse cx="20" cy="28" rx="4" ry="2.5" fill={c} opacity="0.9" />
      {/* Step platform */}
      <rect x="8" y="30" width="24" height="3.5" rx="1.5" fill={c} opacity="0.4" />
      {/* Arrow up */}
      <path d="M27 20 L27 12 M25 14.5 L27 12 L29 14.5" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function IllustrationChart({ c }: { c: string }) {
  return (
    <g>
      {/* Axes */}
      <line x1="9" y1="28" x2="9" y2="11" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="28" x2="31" y2="28" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      {/* Bars */}
      <rect x="12" y="24" width="4" height="4" rx="1" fill={c} opacity="0.5" />
      <rect x="18" y="20" width="4" height="8" rx="1" fill={c} opacity="0.7" />
      <rect x="24" y="15" width="4" height="13" rx="1" fill={c} opacity="0.9" />
      {/* Star on top */}
      <text x="26" y="13" textAnchor="middle" fill={c} fontSize="8">★</text>
    </g>
  );
}

// Illustration registry
const ILLUSTRATIONS: Record<string, (props: { c: string }) => React.ReactElement> = {
  'pullup':         IllustrationPullup,
  'fingerboard-20': IllustrationFingerboard20,
  'dead-hang':      IllustrationDeadHang,
  'pinch':          IllustrationPinch,
  'repeaters':      IllustrationRepeaters,
  'jump':           IllustrationJump,
  'heavy-light':    IllustrationHeavyLight,
  'military-press': IllustrationMilitaryPress,
  'dumbbell':       IllustrationDumbbell,
  'pulley':         IllustrationPulley,
  'plank':          IllustrationPlank,
  'side-plank':     IllustrationSidePlank,
  'squat':          IllustrationSquat,
  'lunge':          IllustrationLunge,
  'calf':           IllustrationCalf,
  'chart':          IllustrationChart,
};

// ── Hexagon SVG ───────────────────────────────────────────────────────────────

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

// ── Main component ────────────────────────────────────────────────────────────

interface BadgeHexProps {
  icon: string;
  level: BadgeLevel | null;        // null = locked
  size?: number;                   // outer px size, default 90
  showLevelRing?: boolean;         // whether to draw the metallic border
  animate?: boolean;               // pulse animation on unlock
}

export function BadgeHex({ icon, level, size = 90, showLevelRing = true, animate = false }: BadgeHexProps) {
  const meta = level ? BADGE_LEVEL_META[level] : null;
  const locked = !level;
  const Illustration = ILLUSTRATIONS[icon];

  const cx = 50;
  const cy = 50;
  const rOuter = 44;
  const rInner = 38;

  const borderColor = meta?.border ?? '#333';
  const illustrationColor = locked ? '#404040' : '#ffffff';
  const fillColor = locked ? '#111' : '#1a1a1a';
  const bgOpacity = locked ? 0.6 : 0.95;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={animate ? 'animate-pulse' : ''}
    >
      <defs>
        {meta && (
          <>
            <linearGradient id={`border-grad-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={meta.border} stopOpacity="1" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor={meta.border} stopOpacity="0.8" />
            </linearGradient>
            <filter id={`glow-${level}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feFlood floodColor={meta.border} floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </>
        )}
      </defs>

      {/* Outer hex border */}
      {showLevelRing && (
        <polygon
          points={hexPoints(cx, cy, rOuter)}
          fill={meta ? `url(#border-grad-${level})` : '#2a2a2a'}
          filter={meta ? `url(#glow-${level})` : undefined}
          opacity={locked ? 0.4 : 1}
        />
      )}

      {/* Inner hex bg */}
      <polygon
        points={hexPoints(cx, cy, rInner)}
        fill={fillColor}
        opacity={bgOpacity}
      />

      {/* Illustration */}
      {Illustration && (
        <g>
          <Illustration c={illustrationColor} />
        </g>
      )}

      {/* Lock overlay */}
      {locked && (
        <text x="50" y="60" textAnchor="middle" fontSize="20" opacity="0.2">🔒</text>
      )}
    </svg>
  );
}
