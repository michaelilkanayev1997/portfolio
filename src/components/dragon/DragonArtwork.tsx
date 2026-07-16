import type { RefObject } from "react";

export interface DragonArtworkRefs {
  containerRef: RefObject<HTMLDivElement | null>;
  bodyRef: RefObject<SVGPathElement | null>;
  glowRef: RefObject<SVGPathElement | null>;
  spineRef: RefObject<SVGPathElement | null>;
  headRef: RefObject<SVGGElement | null>;
  leftWingRef: RefObject<SVGGElement | null>;
  rightWingRef: RefObject<SVGGElement | null>;
  fireRef: RefObject<SVGGElement | null>;
}

interface DragonArtworkProps {
  refs: DragonArtworkRefs;
}

const DragonArtwork = ({ refs }: DragonArtworkProps) => {
  const {
    containerRef,
    bodyRef,
    glowRef,
    spineRef,
    headRef,
    leftWingRef,
    rightWingRef,
    fireRef,
  } = refs;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[10] dragon-enter"
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="dragonBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="dragonFire" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="1" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="dragonEye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>
          <filter
            id="dragonGlow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <path
          ref={glowRef}
          fill="none"
          stroke="url(#dragonBody)"
          strokeWidth="28"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#dragonGlow)"
        />
        <path
          ref={bodyRef}
          fill="none"
          stroke="url(#dragonBody)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          ref={spineRef}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 9"
          opacity="0.85"
        />

        <g ref={headRef}>
          <g ref={leftWingRef} style={{ transformOrigin: "0 0" }}>
            <path
              d="M0 0 Q -12 -30 -46 -38 Q -34 -16 -8 -6 Z"
              fill="url(#dragonBody)"
              opacity="0.55"
            />
            <path
              d="M0 0 Q -10 -22 -38 -32"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M0 0 Q -6 -14 -22 -22"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              fill="none"
            />
          </g>
          <g ref={rightWingRef} style={{ transformOrigin: "0 0" }}>
            <path
              d="M0 0 Q -12 30 -46 38 Q -34 16 -8 6 Z"
              fill="url(#dragonBody)"
              opacity="0.55"
            />
            <path
              d="M0 0 Q -10 22 -38 32"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M0 0 Q -6 14 -22 22"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              fill="none"
            />
          </g>

          <path
            d="M -10 -10 Q 4 -13 22 -3 L 27 0 L 22 3 Q 4 13 -10 10 Q -2 0 -10 -10 Z"
            fill="url(#dragonBody)"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="0.8"
          />
          <path
            d="M -4 -10 L -1 -19 L 4 -9"
            stroke="#c084fc"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M -4 10 L -1 19 L 4 9"
            stroke="#c084fc"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />

          <circle cx="8" cy="-3.5" r="2.8" fill="url(#dragonEye)" />
          <circle cx="8.7" cy="-4.2" r="0.9" fill="#ffffff" />

          <g
            ref={fireRef}
            opacity="0"
            style={{ transformOrigin: "26px 0", transformBox: "fill-box" }}
          >
            <ellipse cx="46" cy="0" rx="44" ry="9" fill="url(#dragonFire)" />
            <ellipse
              cx="34"
              cy="0"
              rx="24"
              ry="5"
              fill="#fde047"
              opacity="0.85"
            />
            <ellipse
              cx="22"
              cy="0"
              rx="10"
              ry="3"
              fill="#ffffff"
              opacity="0.9"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default DragonArtwork;
