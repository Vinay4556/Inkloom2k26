/* eslint-disable react-hooks/immutability -- Three.js/R3F patterns require mutable refs */

"use client";

import { Component, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HeroSceneFallback } from "./HeroFallback";

/* ---------- shaders (procedural only: no textures, no remote assets) ---------- */

const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 r = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++){ v += a * vnoise(p); p = r * p; a *= 0.5; }
    return v;
  }
`;

// Glass orb vertex shader
const glassOrbVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Glass orb fragment shader
const glassOrbFragment = /* glsl */ `
  uniform vec3 uGlassColor;
  uniform vec3 uAccentColor;
  uniform float uTime;
  uniform float uOpacity;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldNormal;
  
  ${NOISE_GLSL}
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Fresnel effect for glass edge glow
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.5);
    
    // Subtle internal shimmer
    float shimmer = fbm(vWorldNormal.xy * 2.0 + uTime * 0.08) * 0.15;
    
    // Rim lighting
    float rim = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
    
    // Combine effects
    vec3 glassBase = uGlassColor * (0.12 + shimmer);
    vec3 accent = uAccentColor * fresnel * 0.85;
    vec3 rimLight = uAccentColor * rim * 0.3;
    
    vec3 finalColor = glassBase + accent + rimLight;
    float alpha = (0.08 + fresnel * 0.35 + rim * 0.15) * uOpacity;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Wireframe ring shader
const wireframeVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const wireframeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.5);
    
    vec3 col = uColor * (0.4 + fresnel * 0.6);
    float alpha = (0.25 + fresnel * 0.35) * uOpacity;
    
    gl_FragColor = vec4(col, alpha);
  }
`;

// Document card shader (simplified, clean)
const cardVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const cardFragment = /* glsl */ `
  uniform vec3 uCardColor;
  uniform vec3 uTextColor;
  uniform float uOpacity;
  uniform float uSeed;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  float hash11(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Text lines
    float rows = 18.0;
    float r = floor(vUv.y * rows);
    float fr = fract(vUv.y * rows);
    float len = 0.25 + 0.65 * hash11(vec2(r, uSeed));
    float lineThickness = 0.22;
    float body = step(0.38, fr) * step(fr, 0.38 + lineThickness) * 
                 step(0.08, vUv.x) * step(vUv.x, 0.08 + len * 0.84) * 
                 step(0.12, vUv.y) * step(vUv.y, 0.82);
    
    // Header bar
    float header = step(0.88, vUv.y) * step(vUv.y, 0.94) * step(0.08, vUv.x) * step(vUv.x, 0.72);
    
    // Edge fade
    float edgeFade = 0.022;
    float inner = smoothstep(0.0, edgeFade, vUv.x) * smoothstep(0.0, edgeFade, 1.0 - vUv.x) * 
                  smoothstep(0.0, edgeFade, vUv.y) * smoothstep(0.0, edgeFade, 1.0 - vUv.y);
    
    // Fresnel rim
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.8);
    
    vec3 col = mix(uCardColor, uTextColor, clamp(body * 0.45 + header * 0.65, 0.0, 1.0));
    col += uCardColor * fresnel * 0.18;
    
    float alpha = (0.88 + inner * 0.12 + fresnel * 0.15) * uOpacity;
    
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ---------- environment detection (cached, SSR-safe via useSyncExternalStore) ---------- */

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
    () => false,
  );
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error("[inkloom] 3D hero failed, showing fallback:", error.message); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/* ---------- scene components ---------- */

const color = (hex: number) => new THREE.Color(hex);

// Central glass orb with layers
function GlassOrb({ opacity }: { opacity: number }) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  
  const glassMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: glassOrbVertex,
      fragmentShader: glassOrbFragment,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uGlassColor: { value: color(0x1a2420) },
        uAccentColor: { value: color(0x6BA37A) },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
      },
    }),
    [opacity],
  );
  
  const innerGlassMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: glassOrbVertex,
      fragmentShader: glassOrbFragment,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uGlassColor: { value: color(0x0f1612) },
        uAccentColor: { value: color(0x6BA37A) },
        uTime: { value: 0 },
        uOpacity: { value: opacity * 0.6 },
      },
    }),
    [opacity],
  );
  
  const ringMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: wireframeVertex,
      fragmentShader: wireframeFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: color(0x6BA37A) },
        uOpacity: { value: opacity * 0.7 },
      },
    }),
    [opacity],
  );
  
  useEffect(() => () => { 
    glassMat.dispose(); 
    innerGlassMat.dispose(); 
    ringMat.dispose(); 
  }, [glassMat, innerGlassMat, ringMat]);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (glassMat.uniforms?.uTime) glassMat.uniforms.uTime.value = t;
    if (innerGlassMat.uniforms?.uTime) innerGlassMat.uniforms.uTime.value = t;
    
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.08;
      outerRef.current.rotation.x = Math.sin(t * 0.15) * 0.06;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.12;
      innerRef.current.rotation.z = t * 0.05;
    }
    
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.y = t * (0.1 + i * 0.04) * (i % 2 ? 1 : -1);
        ring.rotation.x = Math.sin(t * 0.2 + i * 1.2) * 0.08;
      }
    });
  });
  
  return (
    <group>
      {/* Outer glass sphere */}
      <mesh ref={outerRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 48, 48]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      
      {/* Inner glass sphere */}
      <mesh ref={innerRef} position={[0, 0, 0]} scale={0.65}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <primitive object={innerGlassMat} attach="material" />
      </mesh>
      
      {/* Orbital rings */}
      {[0, 60, 120].map((angle, i) => (
        <mesh
          key={i}
          ref={(el) => { ringRefs.current[i] = el; }}
          rotation={[Math.PI / 2, 0, (angle * Math.PI) / 180]}
        >
          <torusGeometry args={[1.45 + i * 0.15, 0.006, 16, 64]} />
          <primitive object={ringMat} attach="material" />
        </mesh>
      ))}
      
      {/* Core light point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={0x6BA37A} transparent opacity={opacity * 0.9} />
      </mesh>
    </group>
  );
}

// Floating document cards representing brand workflow
function DocumentCards({ opacity }: { opacity: number }) {
  const cardRefs = useRef<(THREE.Group | null)[]>([]);
  
  const cardMats = useMemo(
    () => [0.21, 0.47, 0.73, 0.92].map((seed, i) => new THREE.ShaderMaterial({
      vertexShader: cardVertex,
      fragmentShader: cardFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uCardColor: { value: color(0xf8f7f4) },
        uTextColor: { value: color(0x20231f) },
        uSeed: { value: seed },
        uOpacity: { value: opacity * [1.0, 0.88, 0.75, 0.68][i] },
      },
    })),
    [opacity],
  );
  
  useEffect(() => () => cardMats.forEach((m) => m.dispose()), [cardMats]);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    cardRefs.current.forEach((group, i) => {
      if (!group) return;
      const phase = i * 1.8;
      const targetY = Math.sin(t * 0.28 + phase) * 0.18;
      const currentY = group.position.y - (group.userData.baseY as number);
      group.position.y = (group.userData.baseY as number) + currentY + (targetY - currentY) * 0.022;
      group.rotation.z = (group.userData.baseRotZ as number) + Math.sin(t * 0.18 + phase) * 0.015;
      group.rotation.x = (group.userData.baseRotX as number) + Math.cos(t * 0.12 + phase * 1.5) * 0.012;
    });
  });
  
  const placements = [
    { x: -2.8, y: 0.6, z: -0.5, rx: -0.12, ry: 0.35, rz: 0.05, scale: 0.95, label: "CONTENT" },
    { x: 2.9, y: -0.3, z: -0.3, rx: 0.08, ry: -0.38, rz: -0.06, scale: 0.88, label: "RULES" },
    { x: -2.4, y: -1.2, z: 0.2, rx: 0.15, ry: 0.28, rz: -0.08, scale: 0.72, label: "EVIDENCE" },
    { x: 2.2, y: 1.3, z: 0.1, rx: -0.18, ry: -0.25, rz: 0.07, scale: 0.65, label: "REVIEW" },
  ];
  
  return (
    <group>
      {placements.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
            if (el) { 
              el.userData.baseY = p.y; 
              el.userData.baseRotZ = p.rz; 
              el.userData.baseRotX = p.rx;
            }
          }}
          position={[p.x, p.y, p.z]}
          rotation={[p.rx, p.ry, p.rz]}
          scale={p.scale}
        >
          <mesh>
            <planeGeometry args={[1.8, 2.4]} />
            <primitive object={cardMats[i]} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Subtle floating particles
function Particles({ opacity }: { opacity: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions, particleMat] = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.5 + Math.random() * 2.5;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    
    const mat = new THREE.PointsMaterial({
      color: 0x6BA37A,
      size: 0.018,
      transparent: true,
      opacity: opacity * 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return [positions, mat];
  }, [opacity]);
  
  useEffect(() => () => particleMat.dispose(), [particleMat]);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <primitive object={particleMat} attach="material" />
    </points>
  );
}

function Scene({ animate, loadProgress }: { animate: boolean; loadProgress: number }) {
  const camera = useThree((s) => s.camera);
  const pointer = useRef({ x: 0, y: 0 });
  const [sceneReady, setSceneReady] = useState(false);
  
  useEffect(() => {
    if (loadProgress >= 1) {
      // Small delay to ensure all geometries are ready
      const timer = setTimeout(() => setSceneReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loadProgress]);
  
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
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * 0.25, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * 0.18, 0.035);
    camera.lookAt(0, 0, 0);
  });
  
  // Smooth opacity fade-in during loading
  const displayOpacity = sceneReady ? 1 : loadProgress * loadProgress;
  
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.4} color={0x6BA37A} />
      <pointLight position={[-3, -2, 3]} intensity={0.25} color={0x4a5850} />
      
      <GlassOrb opacity={displayOpacity} />
      <DocumentCards opacity={displayOpacity} />
      <Particles opacity={displayOpacity} />
    </>
  );
}

export function HeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const supported = useSyncExternalStore(noopSubscribe, detectWebGL, () => true);
  const lowPower = useSyncExternalStore(noopSubscribe, detectLowPower, () => false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  
  // Simulate progressive loading
  useEffect(() => {
    if (!supported || contextLost) return;
    
    let frame = 0;
    const animate = () => {
      frame++;
      const progress = Math.min(frame / 45, 1); // ~1.5 seconds at 30fps
      setLoadProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timer = setTimeout(() => requestAnimationFrame(animate), 100);
    return () => clearTimeout(timer);
  }, [supported, contextLost]);

  const fallback = <HeroSceneFallback animated={!reduced} />;
  const animate = visible && !reduced;
  const showLoading = loadProgress < 1;

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh] overflow-hidden bg-[#0d100f]" aria-hidden="true">
      {!supported || contextLost ? fallback : (
        <SceneBoundary fallback={fallback}>
          {/* Loading overlay */}
          {showLoading && (
            <div 
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d100f] transition-opacity duration-1000"
              style={{ opacity: 1 - loadProgress }}
            >
              <div className="text-center">
                <div className="mb-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
                  <div 
                    className="h-full bg-[#6BA37A] transition-all duration-300 ease-out"
                    style={{ width: `${loadProgress * 100}%` }}
                  />
                </div>
                <p className="text-sm text-white/50">Loading experience...</p>
              </div>
            </div>
          )}
          
          <Canvas
            frameloop={animate ? "always" : "demand"}
            dpr={[1, lowPower ? 1 : 1.75]}
            camera={{ position: [0, 0, 6.5], fov: 42, near: 0.1, far: 50 }}
            gl={{ antialias: !lowPower, alpha: false, powerPreference: "high-performance" }}
            flat
            style={{ pointerEvents: "none" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x0d100f, 1);
              gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setContextLost(true); }, { once: true });
            }}
          >
            <Scene animate={animate} loadProgress={loadProgress} />
          </Canvas>
        </SceneBoundary>
      )}
      
      {/* Legibility gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,16,15,0.4)_0%,rgba(13,16,15,0)_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#0d100f]" />
    </div>
  );
}
