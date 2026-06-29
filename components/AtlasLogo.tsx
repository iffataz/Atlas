export default function AtlasLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Plate */}
        <circle cx="18" cy="18" r="15" fill="#7447ae" />

        {/*
          Fork in local space centered at origin, rotated 45°.
          3 tines, flat tips (no rx), longer handle.
          All corners verified within r=15 after rotation.
        */}
        <g transform="translate(18,18) rotate(45)" fill="white">
          {/* 3 tines — flat tips, uniform width, symmetric about x=0 */}
          <rect x="-4.5" y="-11" width="2" height="9" />
          <rect x="-1"   y="-11" width="2" height="9" />
          <rect x="2.5"  y="-11" width="2" height="9" />

          {/* Yoke — smooth bezier from tine span to handle */}
          <path d="M -4.5 -2.5 C -4.5 2 -2 3 -1.5 3 L 1.5 3 C 2 3 4.5 2 4.5 -2.5 Z" />

          {/* Handle — longer stem, rounded at bottom only */}
          <rect x="-1.5" y="2.5" width="3" height="12" rx="1.5" />
        </g>
      </svg>

      <span className="font-display font-light tracking-widest text-xl text-ink select-none">
        atlas
      </span>
    </div>
  );
}
