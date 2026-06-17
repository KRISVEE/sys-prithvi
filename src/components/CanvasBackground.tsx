"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { subscribeSystemState } from "@/lib/store";

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 2000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = Math.random() * 20.0;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  const [cogLoad, setCogLoad] = useState(85);
  useEffect(() => {
    const unsub = subscribeSystemState((state) => setCogLoad(state.cognitiveLoad));
    return () => { unsub(); };
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
    
    const loadNormalized = Math.max(0, Math.min(1, cogLoad / 100));
    const gravityStrength = 0.02 + loadNormalized * 0.08;
    
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      
      let curX = positionsAttr.array[idx] as number;
      let curY = positionsAttr.array[idx + 1] as number;
      let curZ = positionsAttr.array[idx + 2] as number;
      
      const dx = curX - mouseX;
      const dy = curY - mouseY;
      const distMouse = Math.sqrt(dx * dx + dy * dy);
      
      const distCenter = Math.sqrt(curX * curX + curY * curY + curZ * curZ);
      let isRepulsed = false;
      
      if (distMouse < 4) {
        const force = (4 - distMouse) * 0.05;
        curX += (dx / distMouse) * force;
        curY += (dy / distMouse) * force;
        isRepulsed = true;
      }
      
      if (!isRepulsed && distCenter > 0) {
        curX -= (curX / distCenter) * gravityStrength;
        curY -= (curY / distCenter) * gravityStrength;
        curZ -= (curZ / distCenter) * gravityStrength;
      }
      
      if (distCenter < 1.0) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 15.0 + Math.random() * 5.0;
        
        curX = radius * Math.sin(phi) * Math.cos(theta);
        curY = radius * Math.sin(phi) * Math.sin(theta);
        curZ = radius * Math.cos(phi);
      }
      
      positionsAttr.array[idx] = curX;
      positionsAttr.array[idx + 1] = curY;
      positionsAttr.array[idx + 2] = curZ;
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
