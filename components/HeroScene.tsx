'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Float, Text, Sparkles, RoundedBox, MeshReflectorMaterial } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function FloatingCard({ position, color, children, ...props }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      // Parallax movement based on cursor position
      meshRef.current.position.x += (state.mouse.x * 0.5 - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (-state.mouse.y * 0.5 - meshRef.current.position.y) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2} position={position}>
      <RoundedBox
        ref={meshRef}
        args={[1.5, 1, 0.1]}
        radius={0.05}
        smoothness={4}
        {...props}
      >
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} transparent opacity={0.9} />
      </RoundedBox>
      {children}
    </Float>
  );
}

export default function HeroScene() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#a78bfa" />
          <pointLight position={[-10, 5, 5]} intensity={0.8} color="#60a5fa" />
          <directionalLight position={[-5, 10, 5]} intensity={1.5} castShadow />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={1.5}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              metalness={0.5}
            />
          </mesh>

          <FloatingCard position={[0, 0.5, 0]} color="#312e81">
            <Text position={[0, 0, 0.06]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" fontWeight="bold">
              Discover Your Path
            </Text>
          </FloatingCard>

          <FloatingCard position={[-2, -1, -1]} color="#4338ca">
            <Text position={[0, 0, 0.06]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
              Career Growth
            </Text>
          </FloatingCard>

          <FloatingCard position={[2.5, 0, -1.5]} color="#6d28d9">
            <Text position={[0, 0, 0.06]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
              Networking
            </Text>
          </FloatingCard>

          <Sparkles count={200} scale={[20, 10, 20]} size={0.5} speed={0.4} opacity={0.6} color="#a78bfa" />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      </Canvas>
    </div>
  );
}