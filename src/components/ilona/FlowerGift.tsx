import { memo } from "react";

export const FlowerGift = memo(() => (
  <div
    aria-hidden
    className="ilona-flower-gift pointer-events-none mx-auto h-28 w-40 shrink-0 sm:mx-0 sm:h-36 sm:w-48"
  >
    <svg
      className="h-full w-full overflow-visible drop-shadow-[0_22px_34px_rgba(255,106,169,0.22)]"
      viewBox="0 0 220 160"
    >
      <defs>
        <linearGradient
          id="ilonaStemGradient"
          x1="98"
          x2="128"
          y1="142"
          y2="52"
        >
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>
        <radialGradient id="ilonaPetalGradient" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="46%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
        <linearGradient
          id="ilonaHandGradient"
          x1="55"
          x2="164"
          y1="131"
          y2="145"
        >
          <stop offset="0%" stopColor="#ffe4e6" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
      </defs>

      <path
        d="M102 139C111 112 116 84 119 55"
        fill="none"
        stroke="url(#ilonaStemGradient)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        className="ilona-flower-leaf"
        d="M107 103C84 92 73 76 78 61C98 63 109 76 107 103Z"
        fill="#5eead4"
        opacity="0.88"
      />
      <path
        className="ilona-flower-leaf"
        d="M112 97C135 84 147 69 143 54C123 56 112 72 112 97Z"
        fill="#bef264"
        opacity="0.82"
      />

      <g className="ilona-flower-bloom" transform="translate(121 48)">
        {[
          "M0 -36C13 -28 16 -10 3 2C-12 -9 -12 -27 0 -36Z",
          "M28 -19C31 -4 19 10 2 4C4 -15 16 -25 28 -19Z",
          "M26 16C13 25 -5 19 -4 2C12 -4 27 1 26 16Z",
          "M-1 34C-15 25 -17 7 -3 0C9 12 10 27 -1 34Z",
          "M-29 15C-31 0 -17 -10 -3 -3C-8 14 -20 22 -29 15Z",
          "M-27 -20C-15 -28 1 -18 2 -2C-15 3 -29 -5 -27 -20Z",
        ].map((d, index) => (
          <path
            key={d}
            d={d}
            fill="url(#ilonaPetalGradient)"
            opacity={index % 2 === 0 ? 0.96 : 0.88}
          />
        ))}
        <circle r="11" fill="#fde68a" />
        <circle r="5" fill="#f472b6" />
      </g>

      <path
        d="M58 133C76 125 92 126 106 136C115 142 129 144 147 139C156 137 163 142 160 149C141 158 112 157 87 149L55 143C50 141 51 135 58 133Z"
        fill="url(#ilonaHandGradient)"
        opacity="0.96"
      />
      <path
        d="M79 130C91 128 101 132 109 139"
        fill="none"
        stroke="#fecdd3"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path d="M93 123L114 139L101 147L82 132Z" fill="#f9a8d4" opacity="0.82" />
      <path
        d="M96 127L111 139"
        stroke="#fff1f2"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  </div>
));
