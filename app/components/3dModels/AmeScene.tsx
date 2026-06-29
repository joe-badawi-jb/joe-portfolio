'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
    useGLTF,
    useAnimations,
    Center,
    Environment,
    Lightformer,
} from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import { Box3, Vector3, type Group } from 'three'

const AME_PATH =
    '/assets/3d-models/smol_ame_in_an_upcycled_terrarium_hololiveen.glb'

// --- Tunables -------------------------------------------------------------
const TARGET_SIZE = 3 // model is normalised so its largest dimension = this
// Start so deep inside the model it reads as near-black, then pull way back
// to reveal the whole 3D scene.
const ZOOM_IN = 0.04 // camera distance at scroll start (extreme close-up)
const ZOOM_OUT = 9 // camera distance at scroll end (fully visible)
// -------------------------------------------------------------------------

useGLTF.preload(AME_PATH)

function AmeModel() {
    const group = useRef<Group>(null)
    const { scene, animations } = useGLTF(AME_PATH)
    const { actions } = useAnimations(animations, group)

    // Normalise scale to the model's real bounding box so the zoom range
    // above behaves consistently regardless of how the asset was authored.
    const scale = useMemo(() => {
        const size = new Box3().setFromObject(scene).getSize(new Vector3())
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        return TARGET_SIZE / maxDim
    }, [scene])

    useEffect(() => {
        const clips = Object.values(actions).filter(Boolean)
        clips.forEach((a) => a!.reset().play())
        return () => clips.forEach((a) => a!.stop())
    }, [actions])

    return (
        <Center>
            <group ref={group} scale={scale}>
                <primitive object={scene} />
            </group>
        </Center>
    )
}

// Dolly the camera from ultra-zoomed-in to zoomed-out based on scroll progress.
function ScrollZoom({ progressRef }: { progressRef: RefObject<number> }) {
    const camera = useThree((s) => s.camera)
    useFrame(() => {
        const p = Math.min(Math.max(progressRef.current, 0), 1)
        const eased = p * p * (3 - 2 * p) // smoothstep
        camera.position.set(0, 0, ZOOM_IN + (ZOOM_OUT - ZOOM_IN) * eased)
        camera.lookAt(0, 0, 0)
    })
    return null
}

export default function AmeScene({
    progressRef,
}: {
    progressRef: RefObject<number>
}) {
    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, ZOOM_IN], fov: 35, near: 0.01 }}
            gl={{ alpha: true }}
            className="h-full w-full"
        >
            <ScrollZoom progressRef={progressRef} />
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
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 5, 2]} intensity={1.2} />
                <AmeModel />
            </Suspense>
        </Canvas>
    )
}
