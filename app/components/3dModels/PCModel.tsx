'use client'

import { Canvas, useThree } from '@react-three/fiber'
import {
    OrbitControls,
    Stage,
    Environment,
    Lightformer,
    Html,
    useProgress,
    useGLTF,
} from '@react-three/drei'
import { Suspense, useEffect } from 'react'

const MODEL_PATH = '/assets/3d-models/modern_desk_setup__game_ready_3d_model.glb'

// Rotation (radians) applied so the model's front faces the camera by default.
// The model is authored facing along a different axis; a quarter turn about Y
// brings the front around. Flip the sign if it ends up facing away, or use
// Math.PI for a 180° turn.
const FACING_ROTATION_Y = -Math.PI / 2

function Model() {
    // useGLTF parses the .glb (geometry + embedded textures) and caches it.
    const { scene } = useGLTF(MODEL_PATH)
    return <primitive object={scene} rotation={[0, 0, 0]} />
}

// Preload so the asset starts downloading before the component mounts.
useGLTF.preload(MODEL_PATH)

function Loader() {
    const { progress } = useProgress()
    return (
        <Html center>
            <div className="text-white text-sm font-mono whitespace-nowrap">
                Loading model… {Math.round(progress)}%
            </div>
        </Html>
    )
}

type RotatableControls = {
    autoRotate: boolean
    addEventListener: (type: string, listener: () => void) => void
    removeEventListener: (type: string, listener: () => void) => void
}

// Pause the auto-rotation only while the user is actively orbiting. We use
// OrbitControls' own 'start'/'end' events: with zoom + pan disabled they fire
// ONLY on a rotate drag (the wheel handler bails early when enableZoom is
// false), and they always pair up — even when a touch gesture is cancelled —
// so the spin reliably resumes on release.
function PauseAutoRotateOnDrag() {
    const controls = useThree(
        (s) => s.controls
    ) as unknown as RotatableControls | null

    useEffect(() => {
        if (!controls) return
        const pause = () => {
            controls.autoRotate = false
        }
        const resume = () => {
            controls.autoRotate = true
        }
        controls.addEventListener('start', pause)
        controls.addEventListener('end', resume)
        return () => {
            controls.removeEventListener('start', pause)
            controls.removeEventListener('end', resume)
        }
    }, [controls])

    return null
}

export default function PCModel() {
    return (
        <Canvas
            shadows="percentage"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 6], fov: 45 }}
            className="h-full w-full"
        >
            <Suspense fallback={<Loader />}>
                {/* Procedural studio environment for PBR reflections.
                    Built from Lightformers (mesh lights), so there is NO
                    texture/HDRI load — nothing touches the loading manager
                    that drives useProgress, hence no setState-in-render
                    warning, and no CDN dependency. */}
                <Environment resolution={256}>
                    {/* Soft key light from above */}
                    <Lightformer
                        intensity={3}
                        position={[0, 5, -5]}
                        scale={[10, 10, 1]}
                    />
                    {/* Cool fill from the left */}
                    <Lightformer
                        intensity={1.5}
                        color="#a0c4ff"
                        position={[-5, 1, 1]}
                        scale={[3, 6, 1]}
                    />
                    {/* Warm rim from the right */}
                    <Lightformer
                        intensity={1.5}
                        color="#ffd6a5"
                        position={[5, 1, 1]}
                        scale={[3, 6, 1]}
                    />
                </Environment>

                {/* Stage auto-centers, auto-scales and lights the model,
                    which is ideal when the model's native size is unknown.
                    environment={null} so Stage doesn't load its own HDRI —
                    our procedural Environment above handles reflections. */}
                <Stage environment={null} intensity={0.5} adjustCamera={1.1}>
                    <Model />
                </Stage>
            </Suspense>
            {/* Full freedom: rotate, zoom and pan, no angle limits. */}
            <OrbitControls makeDefault autoRotate autoRotateSpeed={7} />
            <PauseAutoRotateOnDrag />
        </Canvas>
    )
}
