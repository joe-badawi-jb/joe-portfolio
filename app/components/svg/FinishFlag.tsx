// Checkered finish flag. Uses currentColor so the checks follow the theme.
const ROWS = 6;
const COLS = 4;
const S = 4; // square size in viewBox units

export default function FinishFlag({ className = "" }: { className?: string }) {
    const squares = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if ((r + c) % 2 === 0) {
                squares.push(
                    <rect
                        key={`${r}-${c}`}
                        x={2 + c * S}
                        y={r * S}
                        width={S}
                        height={S}
                        fill="currentColor"
                    />
                );
            }
        }
    }
    return (
        <svg
            viewBox="0 0 20 28"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
            aria-hidden
        >
            {/* pole */}
            <rect x="0.5" y="0" width="1.5" height="28" fill="currentColor" />
            {/* checker outline */}
            <rect
                x="2"
                y="0"
                width={COLS * S}
                height={ROWS * S}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.5"
            />
            {squares}
        </svg>
    );
}
