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
          Fork drawn upright in local space, centered at origin.
          rotate(45) tilts tines toward upper-right to match reference.
          All points verified to stay within r=15 after rotation.
        */}
        <g transform="translate(18,18) rotate(45)" fill="white">
          {/* 4 tines — rounded tips, symmetric about x=0 */}
          <rect x="-4.5" y="-11" width="1.6" height="8" rx="0.8" />
          <rect x="-1.9" y="-11" width="1.6" height="8" rx="0.8" />
          <rect x="0.7"  y="-11" width="1.6" height="8" rx="0.8" />
          <rect x="3.3"  y="-11" width="1.6" height="8" rx="0.8" />

          {/* Yoke — cubic bezier curves smoothly from tine span to handle */}
          <path d="M -4.5 -3.5 C -4.5 1.5 -2 2.5 -1.5 2.5 L 1.5 2.5 C 2 2.5 4.5 1.5 4.5 -3.5 Z" />

          {/* Handle — tapers with rounded ends */}
          <rect x="-1.5" y="2" width="3" height="10.5" rx="1.5" />
        </g>
      </svg>

      <span className="font-display font-light tracking-widest text-xl text-ink select-none">
        atlas
      </span>
    </div>
  );
}
