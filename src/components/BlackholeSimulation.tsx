"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { subscribeSystemState, getSystemState } from "@/lib/store";

const BlackholeShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uCogLoad: { value: 85 },
    uOnline: { value: 1.0 }
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uCogLoad;
    uniform float uOnline;
    varying vec3 vPosition;
    
    // Minimalist noise function
    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
    float noise(vec2 x) {
      vec2 i = floor(x);
      vec2 f = fract(x);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 x) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Use world position to perfectly align with the particle system
      vec2 uv = vPosition.xy * 0.4;
      
      float r = length(uv);
      
      // Dynamic metrics
      float loadNormalized = clamp(uCogLoad / 100.0, 0.0, 1.0);
      float speed = uTime * (0.2 + loadNormalized * 0.8);
      float angle = atan(uv.y, uv.x);
      
      // GRAVITATIONAL LENSING (Continuous push outward)
      float gravity = 0.08 / (r * r + 0.01);
      vec2 warpedUv = uv * (1.0 + gravity);
      
      // The Accretion Disk is a flattened ellipse in the warped space
      float diskR = length(vec2(warpedUv.x, warpedUv.y * 4.0));
      
      // Smooth continuous ring
      float diskMask = smoothstep(2.5, 0.6, diskR) * smoothstep(0.3, 0.6, diskR);
      
      // Fade out at extreme poles slightly for a smoother look
      diskMask *= smoothstep(0.0, 0.2, abs(warpedUv.x) + 0.2);
      
      // TURBULENCE
      vec2 polar = vec2(diskR * 4.0 - speed, angle * 3.0 + speed * 1.5);
      float turb = fbm(polar * (1.0 + loadNormalized));
      diskMask *= (0.5 + 0.5 * turb);
      
      // EVENT HORIZON
      float EH = 0.35;
      float eventHorizon = smoothstep(EH, EH + 0.01, r);
      
      // MONOCHROME PALETTE
      vec3 col = vec3(1.0) * diskMask * eventHorizon;
      
      // Inner hot glow
      float innerGlow = smoothstep(0.6, 0.35, r) * 0.5 * eventHorizon;
      col += vec3(innerGlow);
      
      // Global ambient glow
      float globalGlow = smoothstep(2.0, 0.4, r) * 0.1 * eventHorizon;
      col += vec3(globalGlow);
      
      // SYS.ONLINE JITTER
      if (uOnline < 0.5) {
         col *= (0.8 + 0.2 * noise(vec2(uTime * 20.0)));
      }
      
      float alpha = clamp(dot(col, vec3(0.333)) * 1.5, 0.0, 1.0);
      gl_FragColor = vec4(col, alpha);
    }
  `
};

function GravityParticles() {
  const count = 1000;
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  // Initialize particles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const params = new Float32Array(count * 3); // x: radius, y: angle, z: speed
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 4.0 + 1.0;
      const theta = Math.random() * Math.PI * 2;
      params[i * 3] = r;
      params[i * 3 + 1] = theta;
      params[i * 3 + 2] = Math.random() * 0.5 + 0.1; // Speed multiplier
      
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    return { positions, params };
  }, [count]);

  const [cogLoad, setCogLoad] = useState(85);
  useEffect(() => {
    const unsub = subscribeSystemState((state) => setCogLoad(state.cognitiveLoad));
    return () => { unsub(); };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    const loadNormalized = Math.max(0, Math.min(1, cogLoad / 100));
    const pullSpeed = 0.3 + loadNormalized * 1.5;
    const orbitSpeed = 0.8 + loadNormalized * 2.0;
    
    for (let i = 0; i < count; i++) {
      let r = particles.params[i * 3];
      let theta = particles.params[i * 3 + 1];
      const speed = particles.params[i * 3 + 2];
      
      // Spiral inward
      r -= speed * pullSpeed * delta * (1.0 / (r + 0.1));
      theta += speed * orbitSpeed * delta * (1.0 / (r * r + 0.1));
      
      // Reset if crosses event horizon (0.35 in shader uv space, which is 0.35 / 0.4 = 0.875 in world space)
      if (r < 0.875) {
        r = Math.random() * 2.0 + 4.0;
        theta = Math.random() * Math.PI * 2;
      }
      
      particles.params[i * 3] = r;
      particles.params[i * 3 + 1] = theta;
      
      // Calculate true unlensed screen position (squash Y by 4.0)
      let screenX = r * Math.cos(theta);
      let screenY = (r * Math.sin(theta)) * 0.25;
      
      // Apply exact gravitational lensing push as the shader
      // uv = vPosition.xy * 0.4, r = length(uv)
      let uvX = screenX * 0.4;
      let uvY = screenY * 0.4;
      let uvR = Math.sqrt(uvX * uvX + uvY * uvY);
      
      let gravity = 0.08 / (uvR * uvR + 0.01);
      
      positions[i * 3] = screenX * (1.0 + gravity);
      positions[i * 3 + 1] = screenY * (1.0 + gravity);
      positions[i * 3 + 2] = 0;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        ref={materialRef}
        size={0.03} 
        color="#ffffff" 
        transparent 
        opacity={0.4} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </points>
  );
}

function BlackholeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const unsub = subscribeSystemState((state) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uCogLoad.value = state.cognitiveLoad;
        materialRef.current.uniforms.uOnline.value = state.sysOnline ? 1.0 : 0.0;
      }
    });
    return () => { unsub(); };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial 
        ref={materialRef}
        args={[BlackholeShaderMaterial]}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function BlackholeSimulation() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cogLoad, setCogLoad] = useState(85);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Init state for CSS fallback
    setCogLoad(getSystemState().cognitiveLoad);
    const unsub = subscribeSystemState((state) => {
      setCogLoad(state.cognitiveLoad);
    });

    return () => {
      window.removeEventListener("resize", checkMobile);
      unsub();
    };
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    // Hyper-optimized, zero-GPU CSS fallback
    const scale = 0.8 + (cogLoad / 100) * 0.4;
    const opacity = 0.3 + (cogLoad / 100) * 0.7;
    return (
      <div 
        className="fixed inset-0 z-[-10] pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(circle at center, rgba(10, 15, 25, 0.8) 0%, rgba(5,5,5,1) 70%)"
        }}
      >
        <div 
          className="absolute w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle at center, rgba(5,5,5,1) 30%, rgba(200, 230, 255, 0.3) 45%, rgba(5,5,5,0) 70%)",
            transform: `scale(${scale})`,
            opacity: opacity,
            transition: "transform 1s ease-out, opacity 1s ease-out"
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <BlackholeMesh />
        <GravityParticles />
      </Canvas>
    </div>
  );
}
