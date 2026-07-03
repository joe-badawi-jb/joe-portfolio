"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ContactButton from "../buttons/ContactButton";

// In-page section links (scroll to an anchor on the home page).
const NAV_LINKS = [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Stack", href: "#stack" },
];

// Route link — its own page rather than a section on the home page.
const HOBBIES = { label: "Hobbies", href: "/hobbies" };

// Animated left->right strikethrough + colour shift on hover (see
// `.nav-link` in globals.css), shared by desktop and mobile links.
const navLinkClasses = "nav-link text-xl font-medium text-content";

// Alternate the per-item accent: blue, pink, blue, pink, ...
const accentByIndex = (i: number) =>
    i % 2 === 0 ? "nav-accent-blue" : "nav-accent-pink";

// The Hobbies accent continues the alternation after the section links.
const HOBBIES_ACCENT = accentByIndex(NAV_LINKS.length);

export default function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [open, setOpen] = useState(false);
    const [activeHref, setActiveHref] = useState<string | null>(null);

    // Scroll-spy: mark the section currently around the middle of the viewport
    // as active. The contact section is observed too (though it has no nav
    // link) so scrolling into it clears the highlight instead of leaving the
    // previous section — e.g. "Stack" — stuck active.
    useEffect(() => {
        const ids = [...NAV_LINKS.map((l) => l.href.slice(1)), "contact"];
        const sections = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);
        if (sections.length === 0) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    setActiveHref(id === "contact" ? null : "#" + id);
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        sections.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string
    ) => {
        setOpen(false);
        // On the home page, intercept and smooth-scroll to the section. From
        // any other page (e.g. /hobbies) let the link navigate to /#section
        // so the browser lands on the home page at that anchor.
        if (!isHome) return;
        e.preventDefault();
        setActiveHref(href);
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        setActiveHref(null);
        setOpen(false);
        // On the home page just scroll to the top; elsewhere let the link
        // navigate back home.
        if (!isHome) return;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Warm the hobbies intro assets on hover/focus so they're cached before the
    // click — the ~1MB intro video especially, plus the first image and model.
    const prefetched = useRef(false);
    const prefetchHobbies = () => {
        if (prefetched.current) return;
        prefetched.current = true;
        [
            "/assets/videos/nimbus.mp4",
            "/assets/images/anime-crossover.webp",
            "/assets/3d-models/goku_nimbus.glb",
        ].forEach((u) => {
            fetch(u, { cache: "force-cache" })
                .then((r) => r.arrayBuffer())
                .catch(() => {});
        });
    };

    const linkClass = (href: string, i: number, extra = "") =>
        `${navLinkClasses} ${extra} ${accentByIndex(i)} ${
            isHome && activeHref === href ? "is-active" : ""
        }`;

    const hobbiesClass = (extra = "") =>
        `${navLinkClasses} ${extra} ${HOBBIES_ACCENT} ${
            pathname === HOBBIES.href ? "is-active" : ""
        }`;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-hairline bg-surface/80 backdrop-blur transition-colors">
            <nav className="container flex items-center justify-between py-4">
                {/* Logo — back to the hero / top */}
                <Link
                    href="/"
                    onClick={handleLogoClick}
                    className="shrink-0"
                    aria-label="Back to top"
                >
                    <Image
                        src="/assets/icons/joe-logo.png"
                        alt="Joe logo"
                        width={80}
                        height={80}
                        priority
                        className="object-cover rounded-[50%]"
                    />
                </Link>

                {/* Desktop nav (centered) */}
                <ul className="hidden items-center gap-6 md:flex">
                    {NAV_LINKS.map((link, i) => (
                        <li key={link.href}>
                            <Link
                                href={isHome ? link.href : `/${link.href}`}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={linkClass(link.href, i)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link
                            href={HOBBIES.href}
                            onClick={() => setOpen(false)}
                            onMouseEnter={prefetchHobbies}
                            onFocus={prefetchHobbies}
                            className={hobbiesClass()}
                        >
                            {HOBBIES.label}
                        </Link>
                    </li>
                </ul>

                {/* Desktop CTA */}
                <div className="hidden md:block">
                    <ContactButton />
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    className="relative h-6 w-6 md:hidden"
                >
                    <span
                        className={`absolute left-0 h-0.5 w-6 bg-content transition-all ${
                            open ? "top-3 rotate-45" : "top-1"
                        }`}
                    />
                    <span
                        className={`absolute left-0 top-3 h-0.5 w-6 bg-content transition-all ${
                            open ? "opacity-0" : "opacity-100"
                        }`}
                    />
                    <span
                        className={`absolute left-0 h-0.5 w-6 bg-content transition-all ${
                            open ? "top-3 -rotate-45" : "top-5"
                        }`}
                    />
                </button>
            </nav>

            {/* Mobile menu — always rendered so it can animate open/close */}
            <div
                aria-hidden={!open}
                className={`overflow-hidden bg-surface px-6 transition-all md:hidden ${
                    open
                        ? "max-h-[500px] border-t border-hairline py-5 opacity-100"
                        : "pointer-events-none max-h-0 py-0 opacity-0"
                }`}
            >
                <ul className="flex flex-col gap-6">
                    {NAV_LINKS.map((link, i) => (
                        <li key={link.href}>
                            <Link
                                href={isHome ? link.href : `/${link.href}`}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={linkClass(link.href, i, "text-2xl")}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link
                            href={HOBBIES.href}
                            onClick={() => setOpen(false)}
                            onMouseEnter={prefetchHobbies}
                            onFocus={prefetchHobbies}
                            className={hobbiesClass("text-2xl")}
                        >
                            {HOBBIES.label}
                        </Link>
                    </li>
                </ul>
                <div className="mt-6">
                    <ContactButton className="w-full" />
                </div>
            </div>
        </header>
    );
}
