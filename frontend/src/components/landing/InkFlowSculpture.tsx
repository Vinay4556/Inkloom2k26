/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
    for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = r * p; a *= 0.5; }
    return v;
  }
`;

// Liquid ink ribbon shader
const inkRibbonVertex = /* glsl */ `
  uniform float uTime;
  uniform float uFlowSpeed;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying float vDisplacement;
  
  ${NOISE_GLSL}
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    
    vec3 pos = position;
    float wave = fbm(vec2(pos.y * 0.8 + uTime * uFlowSpeed, pos.x * 0.5)) * 0.25;
    float ripple = sin(pos.y * 4.0 - uTime * 2.0) * 0.08;
    
    pos.x += wave + ripple;
    pos.z += wave * 0.6;
    
    vDisplacement = wave;
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = viewMatrix * worldPosition;
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const inkRibbonFragment = /* glsl */ `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uIridescence;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying float vDisplacement;
  
  ${NOISE_GLSL}
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Fresnel for edge glow
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
    
    // Iridescent color shift
    float iridShift = fbm(vWorldPosition.xz * 0.5 + uTime * 0.05) * uIridescence;
    vec3 baseColor = mix(uColor1, uColor2, iridShift * 0.5 + 0.5);
    
    // Internal flow pattern
    float flow = fbm(vec2(vWorldPosition.y * 0.3 - uTime * 0.2, vWorldPosition.x * 0.4)) * 0.3;
    
    // Edge highlighting
    float edge = pow(fresnel, 1.5);
    
    vec3 finalColor = baseColor * (0.6 + flow + edge * 0.8);
    float alpha = (0.35 + fresnel * 0.45 + edge * 0.2) * uOpacity;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface InkRibbonProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color1: number;
  color2: number;
  flowSpeed: number;
  opacity: number;
  iridescence: number;
}

function InkRibbon({ 
  position, 
  rotation, 
  scale, 
  color1, 
  color2, 
  flowSpeed, 
  opacity,
  iridescence 
}: InkRibbonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(0.4, -1, 0.2),
      new THREE.Vector3(-0.3, 0, -0.1),
      new THREE.Vector3(0.2, 1, 0.3),
      new THREE.Vector3(0, 2, 0),
    ]);
    
    return new THREE.TubeGeometry(curve, 80, 0.15, 12, false);
  }, []);
  
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: inkRibbonVertex,
        fragmentShader: inkRibbonFragment,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uColor1: { value: new THREE.Color(color1) },
          uColor2: { value: new THREE.Color(color2) },
          uTime: { value: 0 },
          uFlowSpeed: { value: flowSpeed },
          uOpacity: { value: opacity },
          uIridescence: { value: iridescence },
        },
      }),
    [color1, color2, flowSpeed, opacity, iridescence]
  );
  
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);
  
  useFrame((state) => {
    if (material.uniforms?.uTime) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={geometry}
      material={material}
    />
  );
}

// Flowing particle system
function FlowingParticles({ opacity }: { opacity: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | undefined>(undefined);
  
  const [geometry, material] = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 2.5;
      const height = (Math.random() - 0.5) * 6;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = 0.015 + Math.random() * 0.015;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    velocitiesRef.current = velocities;
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0x6BA37A,
      size: 0.025,
      transparent: true,
      opacity: opacity * 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return [geom, mat];
  }, [opacity]);
  
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);
  
  useFrame(() => {
    if (!particlesRef.current || !velocitiesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;
    
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];
      
      // Reset particles that flow too high
      if (positions[i * 3 + 1] > 4) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 2.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = -4;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return <points ref={particlesRef} geometry={geometry} material={material} />;
}

// Main sculpture composition
export function InkFlowSculpture({ opacity, scrollProgress = 0 }: { opacity: number; scrollProgress?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y = t * 0.05 + scrollProgress * 0.5;
      groupRef.current.position.y = Math.sin(t * 0.3) * 0.08;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Central core light */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={0x6BA37A} transparent opacity={opacity * 0.95} />
      </mesh>
      
      {/* Primary ink ribbons */}
      <InkRibbon
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
        color1={0x1a2420}
        color2={0x6BA37A}
        flowSpeed={0.4}
        opacity={opacity}
        iridescence={1.0}
      />
      
      <InkRibbon
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 3, 0]}
        scale={0.95}
        color1={0x0f1612}
        color2={0x4a8c5f}
        flowSpeed={0.35}
        opacity={opacity * 0.85}
        iridescence={0.8}
      />
      
      <InkRibbon
        position={[0, 0, 0]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={0.9}
        color1={0x162119}
        color2={0x5fb077}
        flowSpeed={0.45}
        opacity={opacity * 0.75}
        iridescence={0.9}
      />
      
      {/* Secondary accent ribbons */}
      <InkRibbon
        position={[0, 0, 0]}
        rotation={[Math.PI / 6, Math.PI / 2, 0]}
        scale={0.7}
        color1={0x6BA37A}
        color2={0x8ec19d}
        flowSpeed={0.5}
        opacity={opacity * 0.6}
        iridescence={1.2}
      />
      
      <InkRibbon
        position={[0, 0, 0]}
        rotation={[-Math.PI / 6, -Math.PI / 2, 0]}
        scale={0.65}
        color1={0x5a9370}
        color2={0x7bb88a}
        flowSpeed={0.38}
        opacity={opacity * 0.55}
        iridescence={1.1}
      />
      
      {/* Flowing particles */}
      <FlowingParticles opacity={opacity} />
    </group>
  );
}
