// A small Mario-like runner, drawn as flat pixel-ish SVG shapes.
export default function MarioRunner({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 28"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
            aria-hidden
        >
            {/* hat */}
            <rect x="7" y="1" width="10" height="3" fill="#e5322d" />
            <rect x="4" y="4" width="16" height="2" fill="#e5322d" />
            {/* face */}
            <rect x="6" y="6" width="13" height="7" fill="#f1a877" />
            {/* hair / sideburn */}
            <rect x="5" y="6" width="2" height="6" fill="#3a2a1a" />
            {/* eye */}
            <rect x="12" y="7" width="2" height="3" fill="#21314d" />
            {/* mustache */}
            <rect x="8" y="11" width="9" height="2" fill="#3a2a1a" />
            {/* shirt */}
            <rect x="5" y="13" width="14" height="3" fill="#e5322d" />
            {/* overalls */}
            <rect x="6" y="15" width="12" height="7" fill="#1f62d0" />
            <rect x="8" y="13" width="2" height="3" fill="#1f62d0" />
            <rect x="14" y="13" width="2" height="3" fill="#1f62d0" />
            {/* buttons */}
            <rect x="9" y="17" width="1.5" height="1.5" fill="#f2c14e" />
            <rect x="13.5" y="17" width="1.5" height="1.5" fill="#f2c14e" />
            {/* arms */}
            <rect x="3" y="14" width="3" height="3" fill="#f1a877" />
            <rect x="18" y="14" width="3" height="3" fill="#f1a877" />
            {/* shoes */}
            <rect x="6" y="22" width="5" height="4" fill="#3a2a1a" />
            <rect x="13" y="22" width="5" height="4" fill="#3a2a1a" />
        </svg>
    )
}
