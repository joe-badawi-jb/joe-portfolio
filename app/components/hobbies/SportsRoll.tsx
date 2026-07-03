"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Box3, Vector3, MathUtils, type Group } from "three";
import InView from "@/app/components/ui/InView";

// Each item rolls top -> bottom as the section scrolls, all on the same
// horizontal line. `x` is its lane (fraction of viewport width), `spins` how
// many turns it makes on the way down, and `base` a fixed starting orientation.
// `sizeFactor` is the model's size as a fraction of the viewport WIDTH, so the
// models (and the gaps between them) scale together — no overlap on narrow
// screens. Everything rolls about the X axis (like a wheel going down).
type Item = {
    path: string;
    x: number;
    spins: number;
    sizeFactor: number;
    base: [number, number, number];
};

const ITEMS: Item[] = [
    // Dumbbell: turn its bar to point at the camera so the round plates face
    // us and it rolls like a wheel. Tweak `base` if it starts on its side.
    {
        path: "/assets/3d-models/dumbbel.glb",
        x: -0.32,
        spins: 4,
        sizeFactor: 0.185,
        base: [0, Math.PI / 2, 0],
    },
    { path: "/assets/3d-models/football.glb", x: 0, spins: 6, sizeFactor: 0.175, base: [0, 0, 0] },
    { path: "/assets/3d-models/basketball_ball.glb", x: 0.32, spins: 6, sizeFactor: 0.175, base: [0, 0, 0] },
];

// No eager preload — models load when this section scrolls into view.

function RollingItem({
    item,
    progress,
}: {
    item: Item;
    progress: React.MutableRefObject<number>;
}) {
    const group = useRef<Group>(null);
    const { scene } = useGLTF(item.path);
    const { viewport } = useThree();

    // Clone so the same GLB could be reused, and normalise to unit size.
    const object = useMemo(() => scene.clone(true), [scene]);
    const { unit, offset } = useMemo(() => {
        const box = new Box3().setFromObject(object);
        const s = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        const max = Math.max(s.x, s.y, s.z) || 1;
        return { unit: 1 / max, offset: center };
    }, [object]);

    useFrame(() => {
        const g = group.current;
        if (!g) return;
        const p = progress.current;
        // Size scales with the viewport width so items shrink on narrow screens
        // and never overlap.
        const size = item.sizeFactor * viewport.width;
        g.scale.setScalar(unit * size);
        const half = viewport.height / 2 + size;
        // All items roll on the same horizontal line from above the top edge to
        // below the bottom edge.
        g.position.y = MathUtils.lerp(half, -half, p);
        g.position.x = viewport.width * item.x;
        // Roll about the X axis (wheel rolling down), keeping the base facing.
        const [bx, by, bz] = item.base;
        g.rotation.set(bx - p * Math.PI * 2 * item.spins, by, bz);
    });

    return (
        <group ref={group}>
            <primitive
                object={object}
                position={[-offset.x, -offset.y, -offset.z]}
            />
        </group>
    );
}

export default function SportsRoll() {
    const wrapRef = useRef<HTMLElement>(null);
    const progress = useRef(0);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            const total = wrap.offsetHeight - window.innerHeight;
            const scrolled = Math.min(
                Math.max(-wrap.getBoundingClientRect().top, 0),
                Math.max(total, 1)
            );
            progress.current = total > 0 ? scrolled / total : 0;
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
        // Rolls the sports gear down into the (upcoming) gaming section. z-30 so
        // it overlaps the pinned training hero above it.
        <section ref={wrapRef} className="relative z-30 h-[300vh] md:h-[220vh]">
            <div className="sticky top-0 h-screen overflow-hidden rounded-t-[24px] bg-gradient-to-b from-zinc-900 via-zinc-950 to-indigo-950 shadow-2xl">
                <InView className="pointer-events-none absolute inset-0">
                    <Canvas
                        dpr={[1, 2]}
                        camera={{ position: [0, 0, 10], fov: 45 }}
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
                                    color="#a0c4ff"
                                    position={[-5, 1, 1]}
                                    scale={[3, 6, 1]}
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
                            {ITEMS.map((item) => (
                                <RollingItem
                                    key={item.path}
                                    item={item}
                                    progress={progress}
                                />
                            ))}
                        </Suspense>
                    </Canvas>
                </InView>
            </div>
        </section>
    );
}
