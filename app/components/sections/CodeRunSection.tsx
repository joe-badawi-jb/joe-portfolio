'use client'

import { useEffect, useRef, useState } from 'react'
import MarioRunner from '@/app/components/svg/MarioRunner'
import FinishFlag from '@/app/components/svg/FinishFlag'

// --- Code shown in the IDE -------------------------------------------------
const CODE = `// Move the man from start to finish
let x = START

while (x < FINISH) {
  x += SPEED
  render(man, x)
}

finish(man)`

// Lightweight tokenizer -> coloured spans, so we can reveal it character by
// character as the user scrolls (a real typing-into-an-IDE feel).
type Token = { text: string; cls: string; start: number }

const KEYWORDS = new Set([
    'let',
    'const',
    'while',
    'if',
    'for',
    'function',
    'return',
    'true',
    'false',
])

function classify(word: string, isCall: boolean): string {
    if (KEYWORDS.has(word)) return 'text-accent-pink'
    if (/^[A-Z][A-Z0-9_]*$/.test(word)) return 'text-accent-pink-hover' // CONSTANTS
    if (isCall) return 'text-accent-blue'
    return 'text-content'
}

function tokenize(code: string): Token[] {
    const tokens: Token[] = []
    const re = /(\/\/[^\n]*)|([A-Za-z_]\w*)|(\d+)|(\s+)|([^\s\w])/g
    let m: RegExpExecArray | null
    while ((m = re.exec(code))) {
        const start = m.index
        if (m[1]) tokens.push({ text: m[1], cls: 'text-muted', start })
        else if (m[2]) {
            const isCall = code[re.lastIndex] === '('
            tokens.push({ text: m[2], cls: classify(m[2], isCall), start })
        } else if (m[3])
            tokens.push({ text: m[3], cls: 'text-accent-blue-hover', start })
        else if (m[4]) tokens.push({ text: m[4], cls: '', start })
        else tokens.push({ text: m[5] ?? '', cls: 'text-muted', start })
    }
    return tokens
}

const TOKENS = tokenize(CODE)
const TOTAL = CODE.length

// --- Tunables --------------------------------------------------------------
// Two sequential phases: first the code types out, THEN the man runs.
const TYPING_END = 0.5 // code is fully typed by this progress
const RUN_END = 0.9 // the man reaches the finish (theme flips) by this progress
const MARIO_TRACK = 0.84 // fraction of stage width the man travels
// ---------------------------------------------------------------------------

export default function CodeRunSection() {
    const wrapRef = useRef<HTMLElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)
    const marioRef = useRef<HTMLDivElement>(null)
    const isLightRef = useRef(false)
    const [revealed, setRevealed] = useState(0)

    useEffect(() => {
        const wrap = wrapRef.current
        if (!wrap) return

        let raf = 0
        const update = () => {
            raf = 0
            const total = wrap.offsetHeight - window.innerHeight
            const scrolled = Math.min(
                Math.max(-wrap.getBoundingClientRect().top, 0),
                Math.max(total, 1)
            )
            const p = total > 0 ? scrolled / total : 0

            // Phase 1: type the code out.
            setRevealed(Math.round(Math.min(p / TYPING_END, 1) * TOTAL))

            // Phase 2: once the code is typed, the man runs across the stage.
            const runPct = Math.min(
                Math.max((p - TYPING_END) / (RUN_END - TYPING_END), 0),
                1
            )
            if (stageRef.current && marioRef.current) {
                const travel = stageRef.current.clientWidth * MARIO_TRACK
                marioRef.current.style.transform = `translateX(${runPct * travel}px)`
            }

            // Flip the theme when he crosses the finish line.
            const light = p >= RUN_END
            if (light !== isLightRef.current) {
                isLightRef.current = light
                document.documentElement.classList.toggle('theme-light', light)
            }
        }
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        update()

        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            if (raf) cancelAnimationFrame(raf)
            document.documentElement.classList.remove('theme-light')
        }
    }, [])

    return (
        <section
            ref={wrapRef}
            className="code-run-panel relative z-10 h-[320vh] rounded-t-[20px] bg-surface-blue/80 backdrop-blur-2xl"
        >
            <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-24 pb-12">
                <div className="container flex flex-col gap-8">
                    {/* IDE */}
                    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-2xl">
                        <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
                            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                            <span className="ml-3 font-mono text-xs text-muted">
                                runner.js
                            </span>
                        </div>
                        <pre className="min-h-[13rem] overflow-x-auto p-5 font-mono text-sm leading-relaxed md:text-base">
                            <code>
                                {TOKENS.map((tok, i) => {
                                    if (tok.start >= revealed) return null
                                    const end = tok.start + tok.text.length
                                    const text =
                                        end <= revealed
                                            ? tok.text
                                            : tok.text.slice(0, revealed - tok.start)
                                    return (
                                        <span key={i} className={tok.cls}>
                                            {text}
                                        </span>
                                    )
                                })}
                                {revealed < TOTAL && (
                                    <span className="ml-px inline-block animate-pulse text-accent-blue">
                                        ▋
                                    </span>
                                )}
                            </code>
                        </pre>
                    </div>

                    {/* Stage: the application of the code */}
                    <div
                        ref={stageRef}
                        className="relative h-36 overflow-hidden rounded-xl border border-hairline bg-surface-card"
                    >
                        {/* ground */}
                        <div className="absolute inset-x-0 bottom-8 h-0.5 bg-line" />
                        <span className="absolute bottom-2 left-[4%] font-mono text-xs text-muted">
                            start
                        </span>
                        <span className="absolute bottom-2 right-[6%] font-mono text-xs text-muted">
                            finish
                        </span>

                        {/* finish flag */}
                        <div className="absolute bottom-8 right-[6%]">
                            <FinishFlag className="h-24 w-auto text-content" />
                        </div>

                        {/* the man */}
                        <div
                            ref={marioRef}
                            className="absolute bottom-8 left-[4%] will-change-transform"
                        >
                            <div className="mario-bob">
                                <MarioRunner className="h-16 w-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
