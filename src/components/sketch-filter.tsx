export function SketchFilter() {
  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden>
      <defs>
        <filter id="dadok-sketch" x="-12%" y="-35%" width="124%" height="170%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.09"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
