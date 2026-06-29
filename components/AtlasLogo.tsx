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
        {/* Tines — short (5px), leaving most height for handle */}
        <rect x="11" y="7" width="2.5" height="5" rx="1" fill="white" />
        <rect x="16.75" y="7" width="2.5" height="5" rx="1" fill="white" />
        <rect x="22.5" y="7" width="2.5" height="5" rx="1" fill="white" />
        {/* Yoke — tapers from full tine span down to handle width */}
        <polygon points="11,11 25,11 20,18 16,18" fill="white" />
        {/* Handle */}
        <rect x="16.5" y="17" width="3" height="13" rx="1.5" fill="white" />
      </svg>
      <span className="font-display font-light tracking-widest text-xl text-ink select-none">
        atlas
      </span>
    </div>
  );
}
