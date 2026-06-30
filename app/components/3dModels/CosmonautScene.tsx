'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Lightformer } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import { Box3, Vector3, type Group } from 'three'

const MODEL_PATH = '/assets/3d-models/cosmonaut_on_a_rocket.glb'
const TARGET_SIZE = 3 // largest dimension after normalisation

// Roaming bounds (world units) — how far it travels across / up-down.
const X_RANGE = 5.5
const Y_RANGE = 2.6
const Z_RANGE = 1.5

useGLTF.preload(MODEL_PATH)

function Cosmonaut() {
    const group = useRef<Group>(null)
    const { scene } = useGLTF(MODEL_PATH)

    const { scale, offset } = useMemo(() => {
        const box = new Box3().setFromObject(scene)
        const size = box.getSize(new Vector3())
        const center = box.getCenter(new Vector3())
        const max = Math.max(size.x, size.y, size.z) || 1
        return { scale: TARGET_SIZE / max, offset: center }
    }, [scene])

    // Navigate around the section: cross the screen left<->right, drift up and
    // down, with a slight depth bob, gently spinning and banking as it flies.
    useFrame((state) => {
        const g = group.current
        if (!g) return
        const t = state.clock.elapsedTime
        g.position.x = Math.sin(t * 0.28) * X_RANGE
        g.position.y = Math.sin(t * 0.42 + 1) * Y_RANGE
        g.position.z = Math.sin(t * 0.2) * Z_RANGE
        g.rotation.y = t * 0.3
        g.rotation.z = Math.cos(t * 0.28) * 0.25
    })

    return (
        <group ref={group} scale={scale}>
            <primitive
                object={scene}
                position={[-offset.x, -offset.y, -offset.z]}
            />
        </group>
    )
}

export default function CosmonautScene() {
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
                <Cosmonaut />
            </Suspense>
        </Canvas>
    )
}
