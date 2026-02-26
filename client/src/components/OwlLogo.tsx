export function OwlLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <ellipse cx="50" cy="58" rx="30" ry="32" fill="currentColor" opacity="0.15" />
      <ellipse cx="50" cy="58" rx="30" ry="32" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />

      {/* Ear tufts */}
      <path d="M28 30 L22 12 L36 24" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M72 30 L78 12 L64 24" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />

      {/* Head */}
      <circle cx="50" cy="38" r="22" fill="currentColor" opacity="0.12" />
      <circle cx="50" cy="38" r="22" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />

      {/* Left eye ring */}
      <circle cx="40" cy="36" r="10" fill="currentColor" opacity="0.08" />
      <circle cx="40" cy="36" r="10" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      {/* Left pupil */}
      <circle cx="40" cy="36" r="4.5" fill="currentColor" opacity="0.9" />
      {/* Left eye shine */}
      <circle cx="42" cy="34" r="1.5" fill="white" opacity="0.8" />

      {/* Right eye ring */}
      <circle cx="60" cy="36" r="10" fill="currentColor" opacity="0.08" />
      <circle cx="60" cy="36" r="10" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      {/* Right pupil */}
      <circle cx="60" cy="36" r="4.5" fill="currentColor" opacity="0.9" />
      {/* Right eye shine */}
      <circle cx="62" cy="34" r="1.5" fill="white" opacity="0.8" />

      {/* Beak */}
      <path d="M47 44 L50 50 L53 44" fill="currentColor" opacity="0.7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Chest pattern (V-shape feathers) */}
      <path d="M42 62 L50 72 L58 62" stroke="currentColor" strokeWidth="1.5" opacity="0.25" fill="none" strokeLinecap="round" />
      <path d="M38 56 L50 68 L62 56" stroke="currentColor" strokeWidth="1.5" opacity="0.2" fill="none" strokeLinecap="round" />

      {/* Feet */}
      <path d="M40 88 L36 94 M40 88 L40 94 M40 88 L44 94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M60 88 L56 94 M60 88 L60 94 M60 88 L64 94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
