import type { Metadata } from "next";
import Image from "next/image";
import IntroVideo from "@/app/components/hobbies/IntroVideo";
import GokuNimbus from "@/app/components/hobbies/GokuNimbus";
import GokuHintPopup from "@/app/components/hobbies/GokuHintPopup";
import NarutoTransition from "@/app/components/hobbies/NarutoTransition";
import SportsRoll from "@/app/components/hobbies/SportsRoll";
import GamingModel from "@/app/components/hobbies/GamingModel";

export const metadata: Metadata = {
    title: "Hobbies",
    description:
        "The personal side of Joe El Badawi — anime, powerlifting and sports, and gaming.",
};

export default function HobbiesPage() {
    return (
        <>
            <IntroVideo src="/assets/videos/nimbus.mp4" />
            <GokuHintPopup />

            {/* Anime hero — sticky & pinned (z-0) so the next section scrolls up
                and overlaps it, exactly like the landing page's hero. Height is
                the viewport minus the sticky header (~112px). */}
            <section className="sticky top-0 z-0 h-[calc(100vh-112px)] w-full overflow-hidden bg-[url('/assets/images/akatsuki.jpg')] bg-cover bg-center text-white">
                <Image
                    src="/assets/images/anime-crossover.png"
                    alt="A crossover of favourite anime characters"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                {/* Overlay across the whole image to lift the text off the art
                    (a touch darker toward the bottom for the heading). */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Goku on his nimbus — fly him with the arrow keys. Lives inside
                    the hero so his range is this banner, and he never leaves the
                    frame. pointer-events-none so it never blocks. Rendered before
                    the text so he floats behind it. */}
                <div className="pointer-events-none absolute inset-0">
                    <GokuNimbus />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
                    <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-rose-400 md:text-base">
                        {"// off the clock"}
                    </p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight drop-shadow-lg sm:text-5xl md:text-7xl">
                        The <span className="text-rose-500">anime</span> side of me
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-200 drop-shadow-md md:text-2xl">
                        Away from the keyboard, this is where I spend a lot of my
                        time — watching, reading, and collecting the stories I grew
                        up loving.
                    </p>
                </div>
                <p className="pointer-events-none absolute bottom-5 right-6 font-mono text-xs uppercase tracking-widest text-white/70 [@media(pointer:coarse)]:hidden">
                    Use ← ↑ ↓ → to fly Goku
                </p>
            </section>

            {/* Scroll-driven transition: Naruto runs across the sand village
                from the anime section into the training section. */}
            <NarutoTransition />

            {/* Training hero — sticky & pinned (z-20) so the sports-roll section
                scrolls up and overlaps it. Full-bleed powerlifting background,
                same treatment as the anime hero. */}
            <section className="sticky top-0 z-20 h-[calc(100vh-112px)] w-full overflow-hidden bg-zinc-950 text-white">
                <Image
                    src="/assets/images/powerlifting-hd.png"
                    alt="Loaded barbell — powerlifting"
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className="object-cover"
                />
                {/* Overlay to lift the text off the photo. */}
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
                    <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-amber-400 md:text-base">
                        {"// the grind"}
                    </p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight drop-shadow-lg sm:text-5xl md:text-7xl">
                        The <span className="text-amber-400">training</span> side of
                        me
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-200 drop-shadow-md md:text-2xl">
                        I mainly train for powerlifting — chasing bigger squats,
                        benches, and deadlifts. Beyond the barbell, I play all kinds
                        of sports, including football, basketball, and padel.
                    </p>
                </div>
            </section>

            {/* Scroll-driven transition: the dumbbell, football and basketball
                roll down from the training section into the gaming section. */}
            <SportsRoll />

            {/* Gaming hero — final section (z-40), scrolls up over the pinned
                sports-roll. Full-bleed background with the gaming model on the
                right. */}
            <section className="relative z-40 min-h-[calc(100vh-112px)] w-full overflow-hidden bg-zinc-950 text-white">
                <Image
                    src="/assets/images/gaming.webp"
                    alt="Gaming setup"
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className="object-cover"
                />
                {/* Overlay to lift the content off the photo. */}
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="container relative z-10 grid min-h-[calc(100vh-112px)] grid-cols-1 items-center gap-8 py-16 lg:grid-cols-2">
                    {/* Left: text */}
                    <div>
                        <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-violet-400 md:text-base">
                            {"// game on"}
                        </p>
                        <h1 className="mt-4 text-4xl font-black tracking-tight drop-shadow-lg sm:text-5xl md:text-7xl">
                            The <span className="text-violet-400">gaming</span> side
                            of me
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-200 drop-shadow-md md:text-2xl">
                            When the controller comes out, I&apos;m all in on racing
                            games, immersive RPGs, and battle royale games — whether
                            it&apos;s chasing lap records, losing hours to a good
                            story, or dropping in for one more round.
                        </p>
                    </div>

                    {/* Spacer reserving the right half for the model on desktop. */}
                    <div className="hidden lg:block" />
                </div>

                {/* Right: 3D gaming model — stuck to the bottom of the hero. */}
                <div className="pointer-events-none absolute bottom-0 right-0 h-[55%] w-full lg:h-[85%] lg:w-1/2">
                    <GamingModel />
                </div>
            </section>

            {/* Closing outro — wraps up the personal tour. */}
            <section className="relative z-40 bg-zinc-950 px-6 py-20 text-center text-white">
                <p className="container mx-auto max-w-3xl text-xl font-medium leading-relaxed text-zinc-300 md:text-2xl">
                    And that&apos;s the personal side of me — anime marathons, heavy
                    lifts, and late-night gaming.{" "}
                    <span className="text-violet-400">
                        Thanks for scrolling this far.
                    </span>
                </p>
            </section>
        </>
    );
}
