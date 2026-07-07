export default function AtlasLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        width="44"
        height="44"
        viewBox="0 0 64 64"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Offset hard shadow */}
        <rect x="12" y="12" width="44" height="44" fill="#111111" />

        {/* Purple square plate */}
        <rect
          x="8"
          y="8"
          width="44"
          height="44"
          fill="#7447AE"
          stroke="#111111"
          strokeWidth="2.5"
        />

        {/*
          Fork drawn upright in a 24x48 local space (center 12,23.5),
          scaled to sit centered in the square. 3 prongs, curved
          shoulder narrowing to a neck, handle swells then rounds off.
        */}
        <g
          transform="translate(30,30) scale(0.73) translate(-12,-23.5)"
          fill="#ffffff"
        >
          <rect x="7.5" y="1" width="1.8" height="16" rx="0.9" />
          <rect x="11.1" y="1" width="1.8" height="16" rx="0.9" />
          <rect x="14.7" y="1" width="1.8" height="16" rx="0.9" />
          <path d="M 7.5 16 L 16.5 16 C 16.5 19.4 14.9 20.6 14 21.2 C 13.5 21.5 13.4 22 13.4 22.6 L 13.4 23.5 L 10.6 23.5 L 10.6 22.6 C 10.6 22 10.5 21.5 10 21.2 C 9.1 20.6 7.5 19.4 7.5 16 Z" />
          <path d="M 10.6 23 L 13.4 23 C 13.45 29.5 14.1 35 14.1 41.5 C 14.1 44.2 13.3 46 12 46 C 10.7 46 9.9 44.2 9.9 41.5 C 9.9 35 10.55 29.5 10.6 23 Z" />
        </g>
      </svg>

      <span className="font-display text-2xl uppercase tracking-tight text-ink">
        Atlas
      </span>
    </div>
  );
}
