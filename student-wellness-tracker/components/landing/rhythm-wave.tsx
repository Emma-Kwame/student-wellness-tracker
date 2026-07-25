"use client";

const SEGMENTS = [
  { label: "Sleep", time: "11pm–7am", x: 70, y: 108, color: "hsl(var(--focus))" },
  { label: "Focus", time: "9am–12pm", x: 270, y: 64, color: "hsl(var(--focus))" },
  { label: "Move", time: "5pm", x: 470, y: 150, color: "hsl(var(--vitality))" },
  { label: "Unwind", time: "9pm", x: 680, y: 96, color: "hsl(var(--dawn))" },
];

/**
 * A day's energy arc, not a bar chart: this is the one visual the whole app
 * is organized around — sleep feeds focus, focus needs movement, movement
 * needs wind-down. Each labeled point is a real point in a student's day,
 * not a decorative marker.
 */
export function RhythmWave() {
  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 240"
        fill="none"
        className="w-full"
        role="img"
        aria-label="A student's daily rhythm, from sleep through focused study, movement, and wind-down"
      >
        <defs>
          <linearGradient id="rhythmStroke" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--focus))" />
            <stop offset="45%" stopColor="hsl(var(--focus))" />
            <stop offset="65%" stopColor="hsl(var(--vitality))" />
            <stop offset="100%" stopColor="hsl(var(--dawn))" />
          </linearGradient>
          <linearGradient id="rhythmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--focus))" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(var(--focus))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="hsl(var(--line))" strokeWidth="1" />

        {/* Soft fill under the curve */}
        <path
          d="M 0 160 C 100 40, 180 40, 260 100 C 340 160, 380 200, 460 140 C 540 80, 600 60, 680 110 C 720 135, 760 120, 800 90 L 800 200 L 0 200 Z"
          fill="url(#rhythmFill)"
        />

        {/* The rhythm line itself, drawn in on load */}
        <path
          d="M 0 160 C 100 40, 180 40, 260 100 C 340 160, 380 200, 460 140 C 540 80, 600 60, 680 110 C 720 135, 760 120, 800 90"
          stroke="url(#rhythmStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
          className="animate-flow-dash"
        />

        {SEGMENTS.map((seg) => (
          <g key={seg.label}>
            <circle cx={seg.x} cy={seg.y} r="5" fill={seg.color} />
            <circle cx={seg.x} cy={seg.y} r="9" fill={seg.color} opacity="0.18" />
          </g>
        ))}
      </svg>

      {/* Labels laid out to match segment x-positions as percentages of the viewBox width */}
      <div className="mt-2 grid grid-cols-4 text-center">
        {SEGMENTS.map((seg) => (
          <div key={seg.label}>
            <p className="font-display text-sm text-ink">{seg.label}</p>
            <p className="font-mono text-[11px] text-muted">{seg.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
