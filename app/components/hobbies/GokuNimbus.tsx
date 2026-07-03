"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    useGLTF,
    useAnimations,
    Environment,
    Lightformer,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Box3, Vector3, MathUtils, type Group } from "three";

const MODEL_PATH = "/assets/3d-models/goku_nimbus.glb";
const TARGET_SIZE = 2.6; // largest dimension after normalisation (world units)
const SPEED = 7; // travel speed in world units per second

// Turn to face left/right. TURN_ANGLE is how far he yaws; TURN_LAMBDA is how
// fast he gets there (higher = snappier). Flip TURN_ANGLE's sign if he faces
// the wrong way.
const TURN_ANGLE = Math.PI / 4;
const TURN_LAMBDA = 40;

// Touch-device auto-float: how fast he wanders, and a fixed slight tilt he
// keeps the whole time (no dynamic rotation while floating).
const FLOAT_SPEED = 2.4;
const FLOAT_YAW = Math.PI / 7;

useGLTF.preload(MODEL_PATH);

const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

// Track which arrow keys are currently held. Listeners live on window so no
// element needs focus; arrow default (page scroll) is suppressed while flying.
function useArrowKeys() {
    const keys = useRef<Record<string, boolean>>({});
    useEffect(() => {
        const onDown = (e: KeyboardEvent) => {
            if (!ARROWS.includes(e.key)) return;
            keys.current[e.key] = true;
            e.preventDefault();
        };
        const onUp = (e: KeyboardEvent) => {
            if (!ARROWS.includes(e.key)) return;
            keys.current[e.key] = false;
            e.preventDefault();
        };
        window.addEventListener("keydown", onDown);
        window.addEventListener("keyup", onUp);
        return () => {
            window.removeEventListener("keydown", onDown);
            window.removeEventListener("keyup", onUp);
        };
    }, []);
    return keys;
}

function Goku() {
    const group = useRef<Group>(null);
    const { scene, animations } = useGLTF(MODEL_PATH);
    const { actions } = useAnimations(animations, group);
    const { viewport } = useThree();
    const keys = useArrowKeys();

    // Touch devices have no arrow keys, so Goku floats on his own there.
    const isTouch = useRef(false);
    useEffect(() => {
        isTouch.current = window.matchMedia("(pointer: coarse)").matches;
    }, []);

    // Normalise the model to a predictable size and re-center it on the origin.
    const { scale, offset, radius } = useMemo(() => {
        const box = new Box3().setFromObject(scene);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        const max = Math.max(size.x, size.y, size.z) || 1;
        return {
            scale: TARGET_SIZE / max,
            offset: center,
            // Half the on-screen footprint (+ margin) used to keep it inside.
            radius: (TARGET_SIZE / 2) * 1.15,
        };
    }, [scene]);

    // Play any embedded clip (nimbus float / idle) if the model has one.
    useEffect(() => {
        const clips = Object.values(actions);
        clips.forEach((a) => a?.reset().play());
        return () => clips.forEach((a) => a?.stop());
    }, [actions]);

    useFrame((state, delta) => {
        const g = group.current;
        if (!g) return;
        const t = state.clock.elapsedTime;
        const halfW = Math.max(viewport.width / 2 - radius, 0);
        const halfH = Math.max(viewport.height / 2 - radius, 0);

        if (isTouch.current) {
            // No arrows on touch: drift around on his own, quickly. Layered
            // sines with incommensurate frequencies give a wandering,
            // non-repeating path that always stays within the hero bounds. No
            // rotation — he keeps his fixed starting tilt (set on the group).
            const tt = t * FLOAT_SPEED;
            const nx = Math.sin(tt * 0.31) * 0.7 + Math.sin(tt * 0.53 + 2) * 0.3;
            const ny = Math.sin(tt * 0.23 + 1) * 0.7 + Math.sin(tt * 0.41 + 4) * 0.3;
            g.position.x = nx * halfW * 0.9;
            g.position.y = ny * halfH * 0.9;
            return;
        }

        const k = keys.current;
        const dx = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0);
        const dy = (k.ArrowUp ? 1 : 0) - (k.ArrowDown ? 1 : 0);

        // Smooth 4-directional flight. Move, then clamp to the visible viewport
        // (viewport.width/height are world units at z=0, already accounting for
        // camera distance & fov) so he can never leave the frame.
        g.position.x += dx * SPEED * delta;
        g.position.y += dy * SPEED * delta;
        g.position.x = MathUtils.clamp(g.position.x, -halfW, halfW);
        g.position.y = MathUtils.clamp(g.position.y, -halfH, halfH);

        // Turn quickly to face the horizontal direction (damp is
        // framerate-independent; TURN_LAMBDA controls how snappy it is).
        const targetYaw = dx * TURN_ANGLE;
        g.rotation.y = MathUtils.damp(
            g.rotation.y,
            targetYaw,
            TURN_LAMBDA,
            delta
        );

        // Gentle idle bob.
        g.rotation.z = Math.sin(t * 1.5) * 0.04;
    });

    return (
        // Initial slight tilt — kept as-is while floating on touch; the
        // keyboard path animates rotation.y from here when steering.
        <group ref={group} scale={scale} rotation={[0, FLOAT_YAW, 0]}>
            <primitive
                object={scene}
                position={[-offset.x, -offset.y, -offset.z]}
            />
        </group>
    );
}

export default function GokuNimbus() {
    return (
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
                <ambientLight intensity={0.7} />
                <directionalLight position={[3, 5, 2]} intensity={1.2} />
                <Goku />
            </Suspense>
        </Canvas>
    );
}
