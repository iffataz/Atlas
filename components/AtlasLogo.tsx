export default function AtlasLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Plate */}
        <circle cx="18" cy="18" r="15" fill="#7447ae" />
        {/* Fork tines */}
        <rect x="13" y="8" width="2" height="8" rx="1" fill="white" />
        <rect x="17" y="8" width="2" height="8" rx="1" fill="white" />
        <rect x="21" y="8" width="2" height="8" rx="1" fill="white" />
        {/* Neck */}
        <rect x="14" y="15" width="8" height="3" fill="white" />
        {/* Handle */}
        <rect x="16.5" y="18" width="3" height="11" rx="1.5" fill="white" />
      </svg>
      <span className="font-display font-light tracking-widest text-xl text-ink select-none">
        atlas
      </span>
    </div>
  );
}
