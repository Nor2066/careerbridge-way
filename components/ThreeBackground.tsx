'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Text, Box } from '@react-three/drei';
import { Suspense } from 'react';

function FloatingShapes() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1} position={[Math.sin(i) * 3, Math.cos(i) * 2 - 1, -i * 1.5]}>
          <Box args={[0.8, 0.8, 0.8]}>
            <meshStandardMaterial color={`hsl(${i * 60}, 70%, 60%)`} metalness={0.6} roughness={0.2} />
          </Box>
        </Float>
      ))}
      <Float position={[0, 1, -3]}>
        <Text fontSize={0.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02}>
          CareerBridge
        </Text>
      </Float>
    </>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[-5, 5, 5]} />
        <Suspense fallback={null}>
          <FloatingShapes />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}