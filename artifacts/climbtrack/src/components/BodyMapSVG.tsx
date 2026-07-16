export function BodyMapSVG({ scores, maxScore }: { scores: Record<string, number>, maxScore: number }) {
  // Map score to a gray scale hex color: from #1a1a1a (min) to #ffffff (max)
  const getColor = (muscleId: string) => {
    const score = scores[muscleId] || 0;
    if (score === 0) return "#1a1a1a";
    
    // Scale 0-1
    const ratio = score / maxScore;
    // Map ratio to roughly 30-255 RGB
    const intensity = Math.floor(30 + ratio * 225);
    const hex = intensity.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  };

  return (
    <svg width="240" height="400" viewBox="0 0 240 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Front View Outline */}
      <g transform="translate(20, 20)">
        <text x="50" y="-5" fill="#666" fontSize="10" textAnchor="middle" fontWeight="bold">FACE</text>
        {/* Silhouette Base */}
        <path d="M50 0 C40 0 40 15 50 15 C60 15 60 0 50 0 Z" fill={getColor("mobilité")} stroke="#333" /> {/* Head */}
        
        {/* Epaules/Pecs/Abdos */}
        <path d="M30 18 L70 18 L75 30 L25 30 Z" fill={getColor("épaules")} stroke="#333" />
        <path d="M30 30 L70 30 L65 50 L35 50 Z" fill={getColor("pectoraux")} stroke="#333" />
        <path d="M35 50 L65 50 L60 80 L40 80 Z" fill={getColor("abdominaux")} stroke="#333" />
        <path d="M25 30 L35 50 L35 80 L30 80 L20 40 Z" fill={getColor("obliques")} stroke="#333" />
        <path d="M75 30 L65 50 L65 80 L70 80 L80 40 Z" fill={getColor("obliques")} stroke="#333" />
        
        {/* Arms */}
        <path d="M15 35 L30 18 L25 50 L10 60 Z" fill={getColor("biceps")} stroke="#333" />
        <path d="M85 35 L70 18 L75 50 L90 60 Z" fill={getColor("biceps")} stroke="#333" />
        <path d="M10 60 L25 50 L20 85 L5 80 Z" fill={getColor("avant-bras")} stroke="#333" />
        <path d="M90 60 L75 50 L80 85 L95 80 Z" fill={getColor("avant-bras")} stroke="#333" />
        <path d="M5 80 L20 85 L18 95 L2 90 Z" fill={getColor("doigts")} stroke="#333" />
        <path d="M95 80 L80 85 L82 95 L98 90 Z" fill={getColor("doigts")} stroke="#333" />

        {/* Legs */}
        <path d="M35 80 L65 80 L75 130 L55 130 L50 90 L45 130 L25 130 Z" fill={getColor("quadriceps")} stroke="#333" />
        <path d="M25 130 L45 130 L42 170 L28 170 Z" fill={getColor("tibial-anterieur")} stroke="#333" />
        <path d="M55 130 L75 130 L72 170 L58 170 Z" fill={getColor("tibial-anterieur")} stroke="#333" />
        <path d="M50 80 L55 110 L45 110 Z" fill={getColor("adducteurs")} stroke="#333" />
      </g>

      {/* Back View Outline */}
      <g transform="translate(130, 20)">
        <text x="50" y="-5" fill="#666" fontSize="10" textAnchor="middle" fontWeight="bold">DOS</text>
        <path d="M50 0 C40 0 40 15 50 15 C60 15 60 0 50 0 Z" fill={getColor("mobilité")} stroke="#333" /> {/* Head */}
        
        {/* Back */}
        <path d="M30 18 L70 18 L75 40 L25 40 Z" fill={getColor("dos")} stroke="#333" />
        <path d="M25 40 L75 40 L65 70 L35 70 Z" fill={getColor("lombaires")} stroke="#333" />
        
        {/* Arms (Triceps) */}
        <path d="M15 35 L30 18 L25 50 L10 60 Z" fill={getColor("triceps")} stroke="#333" />
        <path d="M85 35 L70 18 L75 50 L90 60 Z" fill={getColor("triceps")} stroke="#333" />
        <path d="M10 60 L25 50 L20 85 L5 80 Z" fill={getColor("avant-bras")} stroke="#333" />
        <path d="M90 60 L75 50 L80 85 L95 80 Z" fill={getColor("avant-bras")} stroke="#333" />
        <path d="M5 80 L20 85 L18 95 L2 90 Z" fill={getColor("doigts")} stroke="#333" />
        <path d="M95 80 L80 85 L82 95 L98 90 Z" fill={getColor("doigts")} stroke="#333" />

        {/* Glutes & Legs */}
        <path d="M35 70 L65 70 L70 95 L30 95 Z" fill={getColor("fessiers")} stroke="#333" />
        <path d="M30 95 L70 95 L75 130 L55 130 L50 100 L45 130 L25 130 Z" fill={getColor("ischio-jambiers")} stroke="#333" />
        <path d="M25 130 L45 130 L42 170 L28 170 Z" fill={getColor("mollets")} stroke="#333" />
        <path d="M55 130 L75 130 L72 170 L58 170 Z" fill={getColor("mollets")} stroke="#333" />
      </g>
    </svg>
  );
}