// Placeholder About section. It reads the theme tokens, so it automatically
// looks right under the light theme the scroll transition flips to.
export default function About() {
    return (
        <section id="about" className="container py-32">
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-pink md:text-base">
                {"// about"}
            </p>
            <h2 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl xl:text-8xl">
                A bit about me
            </h2>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted md:text-2xl">
                Placeholder copy for the about section. This area is intentionally
                tall so you can see the white theme persist after the transition.
                Your real content goes here later.
            </p>
        </section>
    )
}
