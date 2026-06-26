export default function AtlasLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="36"
        height="32"
        viewBox="0 0 36 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-ink flex-shrink-0"
        aria-hidden="true"
      >
        {/* Bowl: semicircle arc from left to right, opening upward */}
        <path d="M 6 14 A 12 12 0 0 1 30 14" />
        {/* Spoon handle: vertical line from bowl rim center upward */}
        <line x1="18" y1="14" x2="18" y2="4" />
      </svg>
      <span className="font-display font-light tracking-widest text-xl text-ink select-none">
        atlas
      </span>
    </div>
  );
}
