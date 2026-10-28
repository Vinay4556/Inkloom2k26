/* eslint-disable react-hooks/immutability */
"use client";

import { Component, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HeroSceneFallback } from "./HeroFallback";
import {
  FragmentedTypography,
  AlignedTypography,
  ValidationTypography,
  ClarityTypography,
  StructureGrid,
  AccentParticles,
} from "./KineticTypography";

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
    console.error("[inkloom] Kinetic typography failed, showing fallback:", error.message);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ---------- Scene lighting ---------- */

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.3} color={0xffffff} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        color={0xffffff}
        castShadow={false}
      />
      <directionalLight
        position={[-3, 2, 4]}
        intensity={0.4}
        color={0x6BA37A}
      />
      <pointLight
        position={[0, 0, 3]}
        intensity={0.3}
        color={0x8ec19d}
        distance={10}
        decay={2}
      />
    </>
  );
}

/* ---------- Camera controller ---------- */

function CameraController({
  animate,
  scrollProgress,
}: {
  animate: boolean;
  scrollProgress: number;
}) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));
  
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
    
    // Subtle parallax
    const targetX = pointer.current.x * 0.2;
    const targetY = pointer.current.y * 0.15;
    
    // Scroll-based camera pull
    const scrollZ = 8 - scrollProgress * 1.5;
    const scrollY = scrollProgress * 0.8;
    
    targetPos.current.set(targetX, targetY + scrollY, scrollZ);
    
    camera.position.lerp(targetPos.current, 0.025);
    camera.lookAt(0, scrollY * 0.3, 0);
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
      
      {/* Background atmosphere */}
      <mesh position={[0, 0, -3]}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial
          color={0x0a0d0b}
          transparent
          opacity={displayOpacity}
        />
      </mesh>
      
      {/* Structure grid */}
      <StructureGrid opacity={displayOpacity} progress={scrollProgress} />
      
      {/* Kinetic typography - layered narrative */}
      <FragmentedTypography opacity={displayOpacity} progress={scrollProgress} />
      <ValidationTypography opacity={displayOpacity} progress={scrollProgress} />
      <ClarityTypography opacity={displayOpacity} progress={scrollProgress} />
      <AlignedTypography opacity={displayOpacity} progress={scrollProgress} />
      
      {/* Accent particles */}
      <AccentParticles opacity={displayOpacity} />
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
      const progress = Math.min(scrolled / Math.max(scrollHeight * 0.25, 1), 1);
      setProgress(progress);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return progress;
}

/* ---------- Main component ---------- */

export function KineticHeroScene() {
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
  
  // Progressive loading
  useEffect(() => {
    if (!supported || contextLost) return;
    
    let frame = 0;
    const animate = () => {
      frame++;
      const progress = Math.min(frame / 40, 1);
      setLoadProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timer = setTimeout(() => requestAnimationFrame(animate), 200);
    return () => clearTimeout(timer);
  }, [supported, contextLost]);
  
  const fallback = <HeroSceneFallback animated={!reduced} />;
  const animate = visible && !reduced;
  const showLoading = loadProgress < 0.9;
  
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
          {/* Loading overlay */}
          {showLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d100f] transition-opacity duration-700"
              style={{ opacity: 1 - loadProgress }}
            >
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="relative h-12 w-12">
                    <div
                      className="absolute inset-0 rounded-full border-2 border-[#6BA37A]/20"
                    />
                    <div
                      className="absolute inset-0 rounded-full border-2 border-[#6BA37A] border-t-transparent animate-spin"
                      style={{ animationDuration: "1.5s" }}
                    />
                  </div>
                </div>
                <p className="text-xs tracking-widest text-white/30">
                  LOADING TYPOGRAPHY
                </p>
              </div>
            </div>
          )}
          
          <Canvas
            frameloop={animate ? "always" : "demand"}
            dpr={[1, lowPower ? 1.25 : 1.5]}
            camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
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
      
      {/* Depth gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,16,15,0.2)_0%,rgba(13,16,15,0)_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0d100f] via-[#0d100f]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0d100f]/90 to-transparent" />
    </div>
  );
}
