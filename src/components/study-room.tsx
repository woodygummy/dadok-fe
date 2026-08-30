"use client"

export function StudyRoom() {
  return (
    <div className="mx-auto w-full max-w-[24rem]">
      <svg viewBox="0 0 400 380" className="h-auto w-full" role="img">
        <title>나만의 서재</title>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfe6f2" />
            <stop offset="100%" stopColor="#e7f3f8" />
          </linearGradient>
          <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe7a8" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#ffe7a8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wood-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e2b87a" />
            <stop offset="100%" stopColor="#c99655" />
          </linearGradient>
          <linearGradient id="wood-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b07a42" />
            <stop offset="100%" stopColor="#8d5e32" />
          </linearGradient>
          <radialGradient id="rug" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d9d4cc" />
            <stop offset="100%" stopColor="#c4bfb6" />
          </radialGradient>
        </defs>

        <ellipse cx="200" cy="318" rx="168" ry="48" fill="url(#rug)" />

        <path d="M70 210 L200 150 L330 210 L330 250 L200 310 L70 250 Z" fill="#efe6d4" />
        <path d="M70 120 L200 70 L200 150 L70 210 Z" fill="#f4ebda" />
        <path d="M200 70 L330 120 L330 210 L200 150 Z" fill="#e8dcc8" />

        <g>
          <path d="M92 128 L168 96 L168 168 L92 198 Z" fill="#f7ecd4" />
          <path d="M104 132 L156 110 L156 154 L104 176 Z" fill="url(#sky)" />
          <path d="M130 121 L130 165" stroke="#f7ecd4" strokeWidth="5" />
          <path
            d="M96 126 C112 150 108 188 102 196"
            fill="none"
            stroke="#ead7b0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M164 98 C150 128 154 168 160 186"
            fill="none"
            stroke="#ead7b0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <polygon points="110,136 210,196 210,250 110,190" fill="url(#sun)" />
        </g>

        <g>
          <ellipse cx="108" cy="292" rx="28" ry="10" fill="#c9b59a" />
          <path d="M88 292 L96 248 L120 248 L128 292 Z" fill="#c4785a" />
          <ellipse cx="108" cy="248" rx="18" ry="7" fill="#b56b4e" />
          <ellipse cx="90" cy="214" rx="22" ry="26" fill="#4f7d48" />
          <ellipse cx="118" cy="208" rx="24" ry="28" fill="#67975d" />
          <ellipse cx="108" cy="190" rx="20" ry="24" fill="#3f6a3c" />
          <ellipse cx="128" cy="226" rx="16" ry="18" fill="#5a8a52" />
        </g>

        <g>
          <path d="M132 250 L248 204 L292 226 L176 274 Z" fill="url(#wood-top)" />
          <path d="M132 250 L176 274 L176 292 L132 268 Z" fill="url(#wood-side)" />
          <path d="M176 274 L292 226 L292 244 L176 292 Z" fill="#8a5a2e" />
          <g transform="rotate(-22 168 232)">
            <rect x="156" y="214" width="11" height="22" rx="2" fill="#c45c26" />
            <rect x="169" y="212" width="11" height="24" rx="2" fill="#3d6b4f" />
            <rect x="182" y="216" width="10" height="20" rx="2" fill="#f0dfc0" />
          </g>
        </g>

        <g>
          <path d="M198 286 L228 272 L244 282 L214 296 Z" fill="#c99655" />
          <path d="M208 258 L230 248 L238 262 L216 272 Z" fill="url(#wood-top)" />
          <path d="M208 258 L216 272 L216 286 L208 272 Z" fill="url(#wood-side)" />
        </g>

        <a href="/shelf" aria-label="책장으로 이동">
          <g className="cursor-pointer">
            <path d="M268 118 L328 92 L348 104 L288 130 Z" fill="url(#wood-top)" />
            <path d="M268 118 L288 130 L288 262 L268 246 Z" fill="url(#wood-side)" />
            <path d="M288 130 L348 104 L348 236 L288 262 Z" fill="#d2a66a" />
            <path d="M292 154 L342 132" stroke="#f6edd8" strokeWidth="11" strokeLinecap="round" />
            <path d="M292 182 L342 160" stroke="#f6edd8" strokeWidth="11" strokeLinecap="round" />
            <path d="M292 210 L342 188" stroke="#f6edd8" strokeWidth="11" strokeLinecap="round" />
            <path d="M292 238 L342 216" stroke="#f6edd8" strokeWidth="11" strokeLinecap="round" />
            <g transform="rotate(-24 310 140)">
              <rect x="296" y="128" width="7" height="18" rx="1.2" fill="#c45c26" />
              <rect x="305" y="126" width="7" height="20" rx="1.2" fill="#3d6b4f" />
              <rect x="314" y="129" width="6" height="17" rx="1.2" fill="#e8d5b5" />
              <rect x="322" y="127" width="7" height="19" rx="1.2" fill="#7a8f72" />
            </g>
            <g transform="rotate(-24 310 168)">
              <rect x="298" y="156" width="7" height="18" rx="1.2" fill="#3b2414" />
              <rect x="307" y="154" width="7" height="20" rx="1.2" fill="#c4785a" />
              <rect x="316" y="157" width="7" height="17" rx="1.2" fill="#6b5344" />
            </g>
            <g transform="rotate(-24 310 196)">
              <rect x="300" y="184" width="7" height="18" rx="1.2" fill="#7a8f72" />
              <rect x="309" y="182" width="7" height="20" rx="1.2" fill="#c45c26" />
              <rect x="318" y="185" width="6" height="16" rx="1.2" fill="#d7b48a" />
            </g>
          </g>
        </a>
      </svg>
    </div>
  )
}
