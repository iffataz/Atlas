export default function AtlasLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="28"
        height="36"
        viewBox="0 0 28 36"
        fill="currentColor"
        className="text-atlas flex-shrink-0"
        aria-hidden="true"
      >
        {/* 4 tines — rounded tops, equal spacing */}
        <rect x="2"  y="1" width="3" height="13" rx="1.5" />
        <rect x="9"  y="1" width="3" height="13" rx="1.5" />
        <rect x="16" y="1" width="3" height="13" rx="1.5" />
        <rect x="23" y="1" width="3" height="13" rx="1.5" />
        {/* Yoke — cubic bezier curves in from tine span to handle width */}
        <path d="M 2 13 C 2 19 11.5 21 11.5 21 L 16.5 21 C 16.5 21 26 19 26 13 Z" />
        {/* Handle */}
        <rect x="11.5" y="20" width="5" height="15" rx="2" />
      </svg>
      <span className="font-display font-light tracking-widest text-xl text-ink select-none">
        atlas
      </span>
    </div>
  );
}
