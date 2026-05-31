'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Html } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// List of career spheres (professional icons/colors)
const objects = [
  { position: [-2, 1, -3], label: 'Data & Analytics', color: '#3B82F6', emoji: '📊' },
  { position: [2, 0.5, -2.5], label: 'Engineering & Tech', color: '#10B981', emoji: '⚙️' },
  { position: [0, -0.5, -4], label: 'Creative & Design', color: '#F59E0B', emoji: '🎨' },
  { position: [-1.5, -1, -3.5], label: 'Business & Strategy', color: '#8B5CF6', emoji: '📈' },
  { position: [1.5, 1.2, -3], label: 'Healthcare & Science', color: '#EC4899', emoji: '🔬' },
  { position: [0.5, -1.5, -2], label: 'Education & Impact', color: '#06B6D4', emoji: '📚' },
];

function ProfessionalSphere({ position, color, label, emoji }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Slower, more subtle rotation
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      // Gentle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const handleClick = () => setClicked(!clicked);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.4}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={0.15}
        />
      </mesh>
      {hovered && (
        <Html position={[0, 0.9, 0]} center>
          <div className="bg-white shadow-lg px-4 py-2 rounded-full text-gray-900 text-sm font-medium whitespace-nowrap border border-gray-200">
            {label}
          </div>
        </Html>
      )}
      {clicked && (
        <Html position={[0, 1.4, 0]} center>
          <div className="bg-white rounded-xl shadow-xl p-5 w-64 text-center border border-gray-100">
            <div className="text-3xl mb-2">{emoji}</div>
            <div className="font-bold text-gray-900 text-lg">{label}</div>
            <div className="text-sm text-gray-600 mt-2 leading-relaxed">
              {label === 'Data & Analytics' && 'Turn data into insights. Drive decisions.'}
              {label === 'Engineering & Tech' && 'Build solutions that shape the future.'}
              {label === 'Creative & Design' && 'Bring ideas to life through design.'}
              {label === 'Business & Strategy' && 'Lead teams, analyze markets, drive growth.'}
              {label === 'Healthcare & Science' && 'Advance human health and discovery.'}
              {label === 'Education & Impact' && 'Empower others through knowledge.'}
            </div>
            <button
              onClick={() => setClicked(false)}
              className="mt-4 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-1 rounded-full transition"
            >
              Close
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function ThreeScene() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX((e.clientX / window.innerWidth) * 2 - 1);
      setMouseY((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} shadows gl={{ alpha: false }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.3} />
        <group rotation={[mouseY * 0.1, mouseX * 0.1, 0]}>
          {objects.map((obj, i) => (
            <ProfessionalSphere key={i} {...obj} />
          ))}
        </group>
        <Float speed={0.8} rotationIntensity={0.1}>
          <Text
            position={[0, 2.2, -2.5]}
            fontSize={0.65}
            color="#1E293B"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            CareerBridge Way
          </Text>
        </Float>
      </Canvas>
    </div>
  );
}