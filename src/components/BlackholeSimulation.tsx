"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { subscribeSystemState, getSystemState } from "@/lib/store";

const BlackholeShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uCogLoad: { value: 85 },
    uOnline: { value: 1.0 },
    uResolution: { value: new THREE.Vector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uCogLoad;
    uniform float uOnline;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    // Minimalist noise function
    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
    float noise(vec2 x) {
      vec2 i = floor(x);
      vec2 f = fract(x);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;
      
      float dist = length(uv);
      
      // Dynamic parameters based on metrics
      float intensity = smoothstep(0.0, 100.0, uCogLoad);
      float speed = uTime * (0.5 + intensity * 2.5);
      
      // Jitter if offline
      vec2 jitter = vec2(0.0);
      if (uOnline < 0.5) {
        jitter = vec2(noise(vec2(uTime * 10.0)), noise(vec2(uTime * 12.0))) * 0.02;
        uv += jitter;
      }
      
      // Event horizon
      float eventHorizon = smoothstep(0.25, 0.26, dist);
      
      // Accretion disk
      float angle = atan(uv.y, uv.x);
      float diskNoise = noise(vec2(dist * 12.0 - speed, angle * 4.0 + speed * 1.5));
      
      float diskCore = smoothstep(0.25, 0.45, dist) * smoothstep(0.7, 0.45, dist);
      float diskGlow = diskCore * diskNoise * (1.0 + intensity * 2.0);
      
      // Cold blue-white color gradient
      vec3 col = vec3(0.7, 0.85, 1.0) * diskGlow;
      col *= eventHorizon;
      
      gl_FragColor = vec4(col, diskGlow * eventHorizon);
    }
  `
};

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
      materialRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[20, 20]} />
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
      </Canvas>
    </div>
  );
}
