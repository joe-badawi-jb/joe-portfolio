'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { LOADER_DURATION_MS } from '@/app/components/loader/MatrixLoader'

const AmeScene = dynamic(
    () => import('@/app/components/3dModels/AmeScene'),
    { ssr: false }
)

// The wrapper is 500vh tall (see `h-[500vh]` below). The sticky canvas is one
// viewport tall, so pinned scroll travel = 500vh - 100vh = ~400vh — a long,
// gradual reveal.
// Progress (0..1) at which the theme flips dark -> light.
const THEME_THRESHOLD = 0.5
// Don't load the 4MB model during the intro loader / hero animation; wait
// until they're done (or until the user actually scrolls toward the zone).
const READY_DELAY_MS = LOADER_DURATION_MS + 2600

export default function HeroAboutTransition() {
    const wrapRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef(0)
    const isLightRef = useRef(false)
    const readyRef = useRef(false)
    const [active, setActive] = useState(false)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const wrap = wrapRef.current
        if (!wrap) return

        const markReady = () => {
            if (readyRef.current) return
            readyRef.current = true
            setReady(true)
        }
        // Preload after the intro finishes...
        const readyTimer = setTimeout(markReady, READY_DELAY_MS)

        // Mount/unmount (and so load/free) the canvas only when the zone is
        // near the viewport.
        const io = new IntersectionObserver(
            ([entry]) => setActive(entry.isIntersecting),
            { rootMargin: '50% 0px 50% 0px' }
        )
        io.observe(wrap)

        let raf = 0
        const update = () => {
            raf = 0
            const total = wrap.offsetHeight - window.innerHeight
            const scrolled = Math.min(
                Math.max(-wrap.getBoundingClientRect().top, 0),
                Math.max(total, 1)
            )
            const p = total > 0 ? scrolled / total : 0
            progressRef.current = p

            // ...or immediately once the user actually scrolls into the zone
            // (by then the hero intro no longer matters).
            if (p > 0) markReady()

            const light = p >= THEME_THRESHOLD
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
            clearTimeout(readyTimer)
            io.disconnect()
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            if (raf) cancelAnimationFrame(raf)
            // Reset the theme if this section leaves the tree (e.g. nav away).
            document.documentElement.classList.remove('theme-light')
        }
    }, [])

    return (
        <section ref={wrapRef} className="relative h-[500vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {active && ready && <AmeScene progressRef={progressRef} />}
            </div>
        </section>
    )
}
