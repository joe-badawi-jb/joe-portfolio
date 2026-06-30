'use client'

import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { Box3, Vector3 } from 'three'

const TARGET_SIZE = 1.5 // normalised model size (leaves room to rotate)

function Model({ path }: { path: string }) {
    const { scene } = useGLTF(path)
    const { scale, offset } = useMemo(() => {
        const box = new Box3().setFromObject(scene)
        const size = box.getSize(new Vector3())
        const center = box.getCenter(new Vector3())
        const max = Math.max(size.x, size.y, size.z) || 1
        return { scale: TARGET_SIZE / max, offset: center }
    }, [scene])
    return (
        <group scale={scale}>
            <primitive
                object={scene}
                position={[-offset.x, -offset.y, -offset.z]}
            />
        </group>
    )
}

export default function StackIcon3D({ path }: { path: string }) {
    return (
        <Canvas
            // Static until the user drags it — only renders on demand, so a
            // grid of these stays cheap.
            frameloop="demand"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 3], fov: 40 }}
            gl={{ alpha: true }}
            className="h-full w-full"
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.9} />
                <directionalLight position={[3, 4, 5]} intensity={1.4} />
                <directionalLight position={[-4, -2, -3]} intensity={0.5} />
                <Model path={path} />
                {/* drag to rotate; no auto-rotate, no zoom/pan */}
                <OrbitControls enableZoom={false} enablePan={false} />
            </Suspense>
        </Canvas>
    )
}
