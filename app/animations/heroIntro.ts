import { createScope, createTimeline, stagger, set } from "animejs";
import type { RefObject } from "react";

/**
 * Hero section intro animation.
 *
 * Built as an anime.js timeline scoped to the hero <section> root, so all
 * `.hero-*` selectors resolve only within it and everything is reverted on
 * cleanup. Elements start hidden (Tailwind `opacity-0` / `w-0`) and are
 * revealed here, sequenced for a single cohesive entrance:
 *   eyebrow -> title (word stagger) -> accent line -> description -> CTA.
 *
 * The model on the right is revealed separately (see Hero.tsx) once it mounts.
 */
type HeroIntroOptions = {
    reducedMotion?: boolean;
    /** Called when the whole intro finishes (used to mount the 3D model). */
    onComplete?: () => void;
};

export function createHeroIntro(
    root: RefObject<HTMLElement | null>,
    { reducedMotion = false, onComplete }: HeroIntroOptions = {}
) {
    return createScope({ root }).add(() => {
        if (reducedMotion) {
            // Skip motion: jump straight to the final, visible state.
            set([".hero-eyebrow", ".hero-desc", ".hero-cta"], {
                opacity: 1,
                translateX: 0,
                translateY: 0,
            });
            set(".hero-title .word", { opacity: 1, translateY: 0 });
            set(".hero-accent", { width: "6rem" });
            onComplete?.();
            return;
        }

        const tl = createTimeline({
            defaults: { ease: "out(4)", duration: 850 },
            // Mount the heavy 3D model only once the left-side intro has
            // finished, so its GLB parse can't jank the animation.
            onComplete: () => onComplete?.(),
        });

        tl.add(".hero-eyebrow", {
            opacity: [0, 1],
            translateX: [-24, 0],
            duration: 600,
        })
            .add(
                ".hero-title .word",
                {
                    opacity: [0, 1],
                    translateY: [48, 0],
                    delay: stagger(65),
                },
                "-=250"
            )
            .add(
                ".hero-accent",
                { width: ["0rem", "6rem"], duration: 700 },
                "-=450"
            )
            .add(
                ".hero-desc",
                { opacity: [0, 1], translateY: [28, 0] },
                "-=450"
            )
            .add(
                ".hero-cta",
                { opacity: [0, 1], translateY: [18, 0], duration: 700 },
                "-=500"
            );
    });
}
