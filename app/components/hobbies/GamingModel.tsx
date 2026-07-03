"use client";

import { Canvas } from "@react-three/fiber";
import {
    OrbitControls,
    Stage,
    Environment,
    Lightformer,
    useGLTF,
    useAnimations,
} from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import type { Group } from "three";
import CanvasLoader from "@/app/components/ui/CanvasLoader";

const MODEL_PATH = "/assets/3d-models/pacman.glb";

useGLTF.preload(MODEL_PATH);

function Model() {
    const group = useRef<Group>(null);
    const { scene, animations } = useGLTF(MODEL_PATH);
    const { actions } = useAnimations(animations, group);

    // Play the embedded animation ("Take 01") on loop.
    useEffect(() => {
        const clips = Object.values(actions);
        clips.forEach((a) => a?.reset().play());
        return () => clips.forEach((a) => a?.stop());
    }, [actions]);

    return (
        <group ref={group}>
            <primitive object={scene} />
        </group>
    );
}

export default function GamingModel() {
    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 6], fov: 45 }}
            gl={{ alpha: true }}
            className="h-full w-full"
        >
            <Suspense fallback={<CanvasLoader />}>
                <Environment resolution={256}>
                    <Lightformer
                        intensity={3}
                        position={[0, 5, -5]}
                        scale={[10, 10, 1]}
                    />
                    <Lightformer
                        intensity={2}
                        color="#a78bfa"
                        position={[-5, 1, 1]}
                        scale={[3, 6, 1]}
                    />
                    <Lightformer
                        intensity={2}
                        color="#fde047"
                        position={[5, 1, 1]}
                        scale={[3, 6, 1]}
                    />
                </Environment>
                {/* Stage auto-centers, scales and frames the model. Higher
                    adjustCamera pulls the camera back = smaller in frame. */}
                <Stage environment={null} intensity={0.5} adjustCamera={1.8}>
                    <Model />
                </Stage>
            </Suspense>
            {/* Gentle auto-spin; users can also drag to look around. */}
            <OrbitControls
                makeDefault
                autoRotate
                autoRotateSpeed={3}
                enableZoom={false}
                enablePan={false}
            />
        </Canvas>
    );
}
