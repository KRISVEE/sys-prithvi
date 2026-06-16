"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 2000;
  
  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const base = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
    }
    return { positions: pos, basePositions: base };
  }, []);

  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse to -1 to +1
      mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.025;
    
    const geometry = pointsRef.current.geometry;
    const positionsAttr = geometry.attributes.position as THREE.BufferAttribute;
    
    // Scale normalized coordinates to the particle bounding box roughly
    const mouseX = mousePos.current.x * 10;
    const mouseY = mousePos.current.y * 10;
    
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const baseX = basePositions[idx];
      const baseY = basePositions[idx + 1];
      
      let curX = positionsAttr.array[idx] as number;
      let curY = positionsAttr.array[idx + 1] as number;
      
      const dx = curX - mouseX;
      const dy = curY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 4) {
        const force = (4 - dist) * 0.03; // Gentle fluid repel
        curX += (dx / dist) * force;
        curY += (dy / dist) * force;
      }
      
      // Spring back
      curX += (baseX - curX) * 0.02;
      curY += (baseY - curY) * 0.02;
      
      positionsAttr.array[idx] = curX;
      positionsAttr.array[idx + 1] = curY;
    }
    
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#888888"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function CanvasBackground() {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <fog attach="fog" args={["#050505", 5, 15]} />
        <Particles />
      </Canvas>
    </div>
  );
}
