/* eslint-disable react-hooks/immutability */
"use client";

import { Component, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HeroSceneFallback } from "./HeroFallback";
import { InkFlowSculpture } from "./InkFlowSculpture";

/* ---------- Environment detection ---------- */

let webglCached: boolean | undefined;
function detectWebGL(): boolean {
  if (webglCached !== undefined) return webglCached;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    webglCached = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglCached = false;
  }
  return webglCached;
}

function detectLowPower(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
}

const noopSubscribe = () => () => {};

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("[inkloom] 3D scene failed, showing fallback:", error.message);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ---------- Atmospheric background ---------- */

const atmosphereVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uAccent;
  uniform float uTime;
  
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 r = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 3; i++){ v += a * vnoise(p); p = r * p; a *= 0.5; }
    return v;
  }
  
  void main() {
    vec2 uv = vWorldPosition.xy * 0.08;
    
    // Layered atmospheric depth
    float fog1 = fbm(uv + vec2(uTime * 0.03, uTime * 0.02)) * 0.5 + 0.5;
    float fog2 = fbm(uv * 1.5 - vec2(uTime * 0.02, uTime * 0.025)) * 0.5 + 0.5;
    
    // Color mixing based on depth
    float depthFactor = length(vWorldPosition) * 0.05;
    vec3 baseColor = mix(uColor1, uColor2, fog1 * 0.6);
    vec3 accentGlow = uAccent * fog2 * 0.15;
    
    vec3 finalColor = baseColor + accentGlow;
    finalColor *= 1.0 - depthFactor * 0.2;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function AtmosphericBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        side: THREE.BackSide,
        uniforms: {
          uColor1: { value: new THREE.Color(0x0a0d0b) },
          uColor2: { value: new THREE.Color(0x0d100f) },
          uAccent: { value: new THREE.Color(0x1a2420) },
          uTime: { value: 0 },
        },
      }),
    []
  );
  
  useEffect(() => () => material.dispose(), [material]);
  
  useFrame((state) => {
    if (material.uniforms?.uTime) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[30, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ---------- Enhanced lighting ---------- */

function SceneLighting() {
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (lightRef1.current) {
      lightRef1.current.intensity = 0.6 + Math.sin(t * 0.5) * 0.15;
    }
    
    if (lightRef2.current) {
      lightRef2.current.position.x = Math.cos(t * 0.3) * 4;
      lightRef2.current.position.z = Math.sin(t * 0.3) * 4;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.15} color={0xffffff} />
      <pointLight
        ref={lightRef1}
        position={[4, 3, 5]}
        intensity={0.6}
        color={0x6BA37A}
        distance={15}
        decay={2}
      />
      <pointLight
        ref={lightRef2}
        position={[-3, 2, 3]}
        intensity={0.35}
        color={0x8ec19d}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[0, -3, 2]}
        intensity={0.25}
        color={0x4a5850}
        distance={10}
        decay={2}
      />
    </>
  );
}

/* ---------- Camera controller with pointer interaction ---------- */

function CameraController({ animate, scrollProgress }: { animate: boolean; scrollProgress: number }) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const targetPos = useRef(new THREE.Vector3(0, 0, 7));
  
  useEffect(() => {
    if (!animate) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animate]);
  
  useFrame(() => {
    if (!animate) return;
    
    // Subtle parallax based on pointer
    const targetX = pointer.current.x * 0.3;
    const targetY = pointer.current.y * 0.2;
    
    // Scroll-based camera movement
    const scrollZ = 7 - scrollProgress * 2;
    const scrollY = scrollProgress * 1.5;
    
    targetPos.current.set(targetX, targetY + scrollY, scrollZ);
    
    camera.position.lerp(targetPos.current, 0.03);
    camera.lookAt(0, scrollY * 0.5, 0);
  });
  
  return null;
}

/* ---------- Main scene composition ---------- */

interface SceneProps {
  animate: boolean;
  loadProgress: number;
  scrollProgress: number;
}

function Scene({ animate, loadProgress, scrollProgress }: SceneProps) {
  const [sceneReady, setSceneReady] = useState(false);
  
  useEffect(() => {
    if (loadProgress >= 1) {
      const timer = setTimeout(() => setSceneReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loadProgress]);
  
  const displayOpacity = sceneReady ? 1 : loadProgress * loadProgress;
  
  return (
    <>
      <CameraController animate={animate} scrollProgress={scrollProgress} />
      <SceneLighting />
      <AtmosphericBackground />
      <InkFlowSculpture opacity={displayOpacity} scrollProgress={scrollProgress} />
    </>
  );
}

/* ---------- Hook to track scroll progress ---------- */

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / Math.max(scrollHeight * 0.3, 1), 1);
      setProgress(progress);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return progress;
}

/* ---------- Main component ---------- */

export function ImmersiveHeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const scrollProgress = useScrollProgress();
  
  const supported = useSyncExternalStore(noopSubscribe, detectWebGL, () => true);
  const lowPower = useSyncExternalStore(noopSubscribe, detectLowPower, () => false);
  const reduced = useReducedMotion();
  
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  
  // Progressive loading simulation
  useEffect(() => {
    if (!supported || contextLost) return;
    
    let frame = 0;
    const animate = () => {
      frame++;
      const progress = Math.min(frame / 50, 1);
      setLoadProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timer = setTimeout(() => requestAnimationFrame(animate), 150);
    return () => clearTimeout(timer);
  }, [supported, contextLost]);
  
  const fallback = <HeroSceneFallback animated={!reduced} />;
  const animate = visible && !reduced;
  const showLoading = loadProgress < 0.95;
  
  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0d100f]"
      aria-hidden="true"
      style={{ height: "100vh", position: "fixed" }}
    >
      {!supported || contextLost ? (
        fallback
      ) : (
        <SceneBoundary fallback={fallback}>
          {/* Loading overlay with premium animation */}
          {showLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d100f] transition-opacity duration-1000"
              style={{ opacity: 1 - loadProgress }}
            >
              <div className="text-center">
                {/* Animated loading mark */}
                <div className="mb-6 flex justify-center">
                  <svg
                    className="h-16 w-16"
                    viewBox="0 0 64 64"
                    fill="none"
                    style={{
                      opacity: 0.4 + loadProgress * 0.6,
                      transform: `rotate(${loadProgress * 360}deg)`,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#6BA37A"
                      strokeWidth="2"
                      strokeDasharray="175.93"
                      strokeDashoffset={175.93 * (1 - loadProgress)}
                      strokeLinecap="round"
                      fill="none"
                      style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
                    />
                    <circle cx="32" cy="32" r="18" fill="#6BA37A" opacity="0.15" />
                    <circle cx="32" cy="32" r="10" fill="#6BA37A" opacity="0.3" />
                  </svg>
                </div>
                
                {/* Progress bar */}
                <div className="mb-3 h-0.5 w-56 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#6BA37A]/50 to-[#6BA37A] transition-all duration-300 ease-out"
                    style={{ width: `${loadProgress * 100}%` }}
                  />
                </div>
                
                <p className="text-xs tracking-wider text-white/40">
                  ASSEMBLING EXPERIENCE
                </p>
              </div>
            </div>
          )}
          
          <Canvas
            frameloop={animate ? "always" : "demand"}
            dpr={[1, lowPower ? 1.25 : 1.75]}
            camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 100 }}
            gl={{
              antialias: !lowPower,
              alpha: false,
              powerPreference: "high-performance",
            }}
            flat
            style={{ pointerEvents: "none" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x0d100f, 1);
              gl.domElement.addEventListener(
                "webglcontextlost",
                (e) => {
                  e.preventDefault();
                  setContextLost(true);
                },
                { once: true }
              );
            }}
          >
            <Scene
              animate={animate}
              loadProgress={loadProgress}
              scrollProgress={scrollProgress}
            />
          </Canvas>
        </SceneBoundary>
      )}
      
      {/* Depth gradients for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,16,15,0.3)_0%,rgba(13,16,15,0)_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0d100f] via-[#0d100f]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0d100f]/80 to-transparent" />
    </div>
  );
}
