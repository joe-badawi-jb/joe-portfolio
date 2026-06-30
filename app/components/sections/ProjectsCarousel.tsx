"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { EffectCube } from "swiper/modules";
import ContactButton from "@/app/components/buttons/ContactButton";
import "swiper/css";
import "swiper/css/effect-cube";

type Project = { title: string; url: string; image?: string };

// Titles + links + OG preview images (where the site exposed one).
const PROJECTS: Project[] = [
    {
        title: "CCIB",
        url: "https://www.ccib.org.lb/en",
        image: "https://backend.ccib.org.lb/storage/home-settings/a15515be-0321-4f97-96c3-19ff1831818e/fdb7fb10af6516f8db28539b9be2714403e1294c%20(1).jpg",
    },
    {
        title: "&more",
        url: "https://andmore.sa/en",
        image: "https://andmore.sa/storage/seo-pages/rdUWcFiN2EqtOMeMZBpcnxq8WWLhpNWNRDnQXZOK.png",
    },
    {
        title: "SoilHive",
        url: "https://www.soilhive.ag/",
        image: "https://www.soilhive.ag/storage/seo-pages/XentLkqhiSLfP5M1PjIJpflE9xqTp2Ekd4d0Xjq2.jpg",
    },
    {
        title: "Zur Beirut",
        url: "https://www.zurbeirut.com/",
        image: "https://admin.zurbeirut.com/storage/seo-pages/pfkev9fmVYmGBz5XIWS1s3O6znQMCJYXNQgnSkVV.jpg",
    },
    {
        title: "Varda",
        url: "https://www.varda.ag/",
        image: "https://www.varda.ag/storage/homepage-settings/VE6mC2TWwJjQuw49Rn9R2pm1UjEeJPPRG9bDTL2x.png",
    },
    {
        title: "Azmet Lebnen",
        url: "https://www.azmetlebnen.com/",
        image: "/assets/images/azmet.png",
    },
    {
        title: "Naturaseal",
        url: "https://www.naturaseal.com/",
        image: "https://www.naturaseal.com/images/web-banner.png",
    },
    {
        title: "Quadrivium",
        url: "https://app.quadrivium-vd.com/",
        image: "https://cdn.prod.website-files.com/66420f3923ae9408a4c000dc/66449a72f3a54e01060d3996_Quad__home-hero.jpg",
    },
    {
        title: "Fundahope",
        url: "https://fundahope.com/en",
        image: "https://fundahope.com/storage/seo-pages/z5YG2dJ0R3qwUpChvGCFpI5mQiKp1VRG5gy2nJBs.jpeg",
    },
    {
        title: "Oracare",
        url: "https://www.oracaredentist.com/en",
        image: "https://www.oracaredentist.com/storage/homepage-sliders/30100f03-662e-4005-8ce2-4d8219cbb1ab/Clinic%20Inside.jpg",
    },
    {
        title: "NokNok",
        url: "https://www.noknok.co/",
        image: "https://noknok.co/public/storage/call-to-action-boxes/1602247892_c9dd1e3593e3f8a6e7b7eabf2e41ba29.png",
    },
    {
        title: "Zerock",
        url: "https://www.zerock.com/",
        image: "https://admin.zerock.com/storage/seo-pages/dcoELbp3sHatHj8IVccBvk0cve0fyYFHlsjKqaAV.jpg",
    },
];

// Fallback gradients for projects with no OG image.
const GRADIENTS = [
    "from-blue-600 to-fuchsia-600",
    "from-pink-500 to-orange-400",
    "from-emerald-500 to-cyan-500",
    "from-violet-600 to-indigo-500",
    "from-rose-500 to-amber-400",
];

export default function ProjectsCarousel() {
    const swiperRef = useRef<SwiperType | null>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const firstRun = useRef(true);
    const [active, setActive] = useState(0);
    const [displayTitle, setDisplayTitle] = useState(PROJECTS[0].title);
    const current = PROJECTS[active] ?? PROJECTS[0];

    // On slide change: current title rises + fades out, then the next title
    // rises in from below + fades in.
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        const el = titleRef.current;
        if (!el) return;
        const nextTitle = PROJECTS[active]?.title ?? "";
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setDisplayTitle(nextTitle);
            return;
        }
        animate(el, {
            translateY: -40,
            opacity: 0,
            duration: 220,
            ease: "in(2)",
            onComplete: () => {
                setDisplayTitle(nextTitle);
                animate(el, {
                    translateY: [40, 0],
                    opacity: [0, 1],
                    duration: 360,
                    ease: "out(3)",
                });
            },
        });
    }, [active]);

    return (
        <div className="projects-carousel">
            <div className="relative">
                <Swiper
                    modules={[EffectCube]}
                    effect="cube"
                    grabCursor
                    loop
                    cubeEffect={{
                        shadow: true,
                        slideShadows: true,
                        shadowOffset: 20,
                        shadowScale: 0.94,
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onRealIndexChange={(swiper) => setActive(swiper.realIndex)}
                    className="mx-auto !aspect-square w-full max-w-[520px]"
                >
                    {PROJECTS.map((project, i) => (
                        <SwiperSlide key={project.url}>
                            <div className="relative h-full w-full">
                                {project.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`h-full w-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
                                    />
                                )}
                                {/* overlay so the title/button stay readable
                                    and the face blends into the dark section */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/55" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Overlay: the active project's title + view button (changes
                    as the centred slide changes). Click-through except button. */}
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-6">
                    <h3
                        ref={titleRef}
                        className="flex h-[2.4em] items-center justify-center text-center text-5xl font-extrabold uppercase tracking-tight text-accent-pink drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)] md:text-7xl xl:text-8xl"
                    >
                        {displayTitle}
                    </h3>
                    <ContactButton
                        href={current.url}
                        label="View website"
                        newTab
                        className="pointer-events-auto"
                    />
                </div>
            </div>

            {/* Prev / next arrows */}
            <div className="mt-10 flex items-center justify-center gap-4">
                <button
                    type="button"
                    aria-label="Previous project"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent-pink text-accent-pink transition-colors hover:bg-accent-pink hover:text-white"
                >
                    ←
                </button>
                <button
                    type="button"
                    aria-label="Next project"
                    onClick={() => swiperRef.current?.slideNext()}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent-pink text-accent-pink transition-colors hover:bg-accent-pink hover:text-white"
                >
                    →
                </button>
            </div>
        </div>
    );
}
