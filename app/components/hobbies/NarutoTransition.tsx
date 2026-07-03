"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    useGLTF,
    useAnimations,
    Environment,
    Lightformer,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Box3, Vector3, MathUtils, type Group } from "three";
import InView from "@/app/components/ui/InView";

const MODEL_PATH = "/assets/3d-models/naruto_running.glb";
const TARGET_SIZE = 3; // largest dimension after normalisation (world units)

// Rotate the model so it faces the direction of travel (screen-right). Flip
// the sign / use Math.PI if he ends up running backwards or sideways.
const FACING_Y = Math.PI / 2;

// How low he sits so his feet land on the sand (fraction of viewport height
// below centre). 0 = centre, 0.5 = bottom edge.
const GROUND_FACTOR = 0.24;

// No eager preload — the model loads when this section scrolls into view.

function Naruto({ progress }: { progress: React.MutableRefObject<number> }) {
    const group = useRef<Group>(null);
    const { scene, animations } = useGLTF(MODEL_PATH);
    const { actions } = useAnimations(animations, group);
    const { viewport } = useThree();

    const { scale, offset } = useMemo(() => {
        const box = new Box3().setFromObject(scene);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        const max = Math.max(size.x, size.y, size.z) || 1;
        return { scale: TARGET_SIZE / max, offset: center };
    }, [scene]);

    // Play the running clip embedded in the model.
    useEffect(() => {
        const clips = Object.values(actions);
        clips.forEach((a) => a?.reset().play());
        return () => clips.forEach((a) => a?.stop());
    }, [actions]);

    // Drive his X across the full screen width from the scroll progress: he
    // starts fully off the left edge and ends fully off the right edge, so a
    // wider viewport is crossed faster for the same amount of scrolling.
    useFrame(() => {
        const g = group.current;
        if (!g) return;
        const p = progress.current;
        const half = viewport.width / 2 + TARGET_SIZE;
        g.position.x = MathUtils.lerp(-half, half, p);
        g.position.y = -viewport.height * GROUND_FACTOR;
    });

    return (
        <group ref={group} scale={scale} rotation={[0, FACING_Y, 0]}>
            <primitive
                object={scene}
                position={[-offset.x, -offset.y, -offset.z]}
            />
        </group>
    );
}

export default function NarutoTransition() {
    const wrapRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const progress = useRef(0);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            // Progress 0->1 as the section scrolls past under the sticky stage
            // (same technique as the landing page's code-run section).
            const total = wrap.offsetHeight - window.innerHeight;
            const scrolled = Math.min(
                Math.max(-wrap.getBoundingClientRect().top, 0),
                Math.max(total, 1)
            );
            const p = total > 0 ? scrolled / total : 0;
            progress.current = p;

            // Parallax: pan the background (opposite to travel) so the village
            // drifts behind Naruto for a strong sense of depth. Scaled to the
            // screen width so the effect is consistent across devices.
            if (bgRef.current) {
                const pan = p * window.innerWidth * 0.2;
                bgRef.current.style.transform = `translateX(${-pan}px)`;
            }
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        // Taller on mobile so the crossing takes ~6s of scrolling; shorter on
        // desktop for ~4s (and, being wider, he traverses faster).
        <section ref={wrapRef} className="relative z-10 h-[450vh] md:h-[400vh]">
            <div className="sticky top-0 h-screen overflow-hidden rounded-t-[24px] bg-amber-100 shadow-2xl">
                {/* Parallax background — wider than the viewport so the (now
                    stronger) pan never reveals an edge. */}
                <div
                    ref={bgRef}
                    className="absolute inset-y-0 -left-[25%] w-[150%] will-change-transform"
                >
                    <Image
                        src="/assets/images/sandvillage.webp"
                        alt="Hidden Sand Village"
                        fill
                        quality={90}
                        sizes="150vw"
                        className="object-cover"
                    />
                </div>

                {/* Naruto running across the ground — canvas mounts (and the
                    model loads) only when the section nears the viewport. */}
                <InView className="pointer-events-none absolute inset-0">
                    <Canvas
                        dpr={[1, 2]}
                        camera={{ position: [0, 0, 9], fov: 45 }}
                        gl={{ alpha: true }}
                        className="h-full w-full"
                    >
                        <Suspense fallback={null}>
                            <Environment resolution={256}>
                                <Lightformer
                                    intensity={3}
                                    position={[0, 5, -5]}
                                    scale={[10, 10, 1]}
                                />
                                <Lightformer
                                    intensity={1.5}
                                    color="#ffd6a5"
                                    position={[5, 1, 1]}
                                    scale={[3, 6, 1]}
                                />
                            </Environment>
                            <ambientLight intensity={0.8} />
                            <directionalLight
                                position={[3, 5, 2]}
                                intensity={1.3}
                            />
                            <Naruto progress={progress} />
                        </Suspense>
                    </Canvas>
                </InView>
            </div>
        </section>
    );
}
