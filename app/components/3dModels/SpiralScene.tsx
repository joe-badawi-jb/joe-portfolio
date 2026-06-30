'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Lightformer } from '@react-three/drei'
import { Suspense, useMemo, useRef, type RefObject } from 'react'
import { Box3, Vector3, type Group } from 'three'

const SPIRAL_PATH = '/assets/3d-models/spiral.glb'
const TARGET_SIZE = 4 // largest dimension after normalisation
const ROT_PER_STEP = Math.PI / 3 // spiral turns this much per card step

useGLTF.preload(SPIRAL_PATH)

function Spiral({ activeRef }: { activeRef: RefObject<number> }) {
    const group = useRef<Group>(null)
    const { scene } = useGLTF(SPIRAL_PATH)

    const { scale, offset } = useMemo(() => {
        const box = new Box3().setFromObject(scene)
        const size = box.getSize(new Vector3())
        const center = box.getCenter(new Vector3())
        const max = Math.max(size.x, size.y, size.z) || 1
        return { scale: TARGET_SIZE / max, offset: center }
    }, [scene])

    // Rotate to a target angle per active card, eased.
    useFrame(() => {
        if (!group.current) return
        const target = activeRef.current * ROT_PER_STEP
        group.current.rotation.y += (target - group.current.rotation.y) * 0.12
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

export default function SpiralScene({
    activeRef,
}: {
    activeRef: RefObject<number>
}) {
    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 6], fov: 40 }}
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
                <Spiral activeRef={activeRef} />
            </Suspense>
        </Canvas>
    )
}
