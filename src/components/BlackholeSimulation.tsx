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
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uCogLoad;
    uniform float uOnline;
    uniform vec2 uResolution;
    
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

    vec3 getThermoColor(float t) {
      // Deep space reds on outer, vibrant oranges in mid, hot intense white near event horizon
      t = clamp(t, 0.0, 1.0);
      vec3 col = vec3(0.0);
      if (t < 0.3) {
        col = mix(vec3(0.0), vec3(0.5, 0.0, 0.0), t / 0.3); // Fade from black to dark red
      } else if (t < 0.7) {
        col = mix(vec3(0.5, 0.0, 0.0), vec3(1.0, 0.4, 0.0), (t - 0.3) / 0.4);
      } else {
        col = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 0.9, 0.8), (t - 0.7) / 0.3);
      }
      return col;
    }

    void main() {
      // Robust UV coordinates, immune to clipping and scaling glitches
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
      
      uv *= 3.0; // Scale the view
      float r = length(uv);
      
      // Dynamic metrics
      float loadNormalized = clamp(uCogLoad / 100.0, 0.0, 1.0);
      float speed = uTime * (0.2 + loadNormalized * 0.8);
      float angle = atan(uv.y, uv.x);
      
      // EVENT HORIZON
      float EH = 0.5;
      float eventHorizon = smoothstep(EH, EH + 0.02, r);
      
      // FRONT DISK
      vec2 frontUv = vec2(uv.x, uv.y * 8.0);
      float frontR = length(frontUv);
      
      // GRAVITATIONAL LENSING (BACK DISK)
      // Gravity pulls the UVs inward based on inverse square law
      float gravity = 0.8 / (r * r + 0.05);
      vec2 lensedUv = uv * (1.0 - gravity * 0.5);
      
      vec2 backUv = vec2(lensedUv.x, lensedUv.y * 4.0);
      float backR = length(backUv);
      
      // MASKS
      float frontMask = smoothstep(3.5, 1.2, frontR) * smoothstep(0.8, 1.2, frontR);
      float backMask = smoothstep(3.5, 1.2, backR) * smoothstep(0.8, 1.2, backR);
      
      // Hide the back disk where the front disk crosses over
      backMask *= smoothstep(0.1, 0.4, abs(uv.y));
      
      // TURBULENCE & ROTATION
      vec2 polarFront = vec2(frontR * 3.0 - speed, angle * 4.0 + speed * 1.5);
      float turbFront = fbm(polarFront * (1.0 + loadNormalized));
      
      vec2 polarBack = vec2(backR * 3.0 - speed, angle * 4.0 + speed * 1.5);
      float turbBack = fbm(polarBack * (1.0 + loadNormalized));
      
      // TEMPERATURE (Brightness and Color Mapping)
      float tempFront = smoothstep(3.5, 1.0, frontR) * frontMask;
      float tempBack = smoothstep(3.5, 1.0, backR) * backMask;
      
      tempFront = clamp(tempFront * (0.7 + 0.6 * turbFront) + loadNormalized * 0.2, 0.0, 1.0);
      tempBack = clamp(tempBack * (0.7 + 0.6 * turbBack) + loadNormalized * 0.2, 0.0, 1.0);
      
      // COMPOSE
      vec3 backCol = getThermoColor(tempBack) * backMask;
      backCol *= eventHorizon; // The Black Hole physically occludes the back disk
      
      vec3 frontCol = getThermoColor(tempFront) * frontMask;
      // Front disk is NOT occluded because it is in front of the black hole
      
      vec3 finalCol = backCol + frontCol;
      
      // GLOBAL GLOW
      float globalGlow = smoothstep(2.0, 0.5, r) * 0.15;
      finalCol += getThermoColor(globalGlow * (0.5 + loadNormalized * 0.5));
      
      // SYS.ONLINE JITTER
      if (uOnline < 0.5) {
         finalCol *= (0.8 + 0.2 * noise(vec2(uTime * 20.0)));
      }
      
      float alpha = clamp(dot(finalCol, vec3(0.5)), 0.0, 1.0);
      gl_FragColor = vec4(finalCol, alpha);
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
      // Use actual drawing buffer dimensions to fix clipping and dpi scaling
      materialRef.current.uniforms.uResolution.value.set(
        state.gl.domElement.width, 
        state.gl.domElement.height
      );
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
      </Canvas>
    </div>
  );
}
