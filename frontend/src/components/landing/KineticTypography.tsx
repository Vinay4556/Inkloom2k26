/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface KineticLetterProps {
  char: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  opacity?: number;
  targetPosition?: [number, number, number];
  targetRotation?: [number, number, number];
  progress: number;
  dispersed?: boolean;
}

// Create simple 3D letter using planes with text texture
function createLetterGeometry(char: string, color: string): {
  geometry: THREE.PlaneGeometry;
  material: THREE.MeshStandardMaterial;
  canvas: HTMLCanvasElement;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  
  if (ctx) {
    ctx.fillStyle = color;
    ctx.font = "bold 180px 'Newsreader', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 128, 128);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    metalness: 0.1,
    roughness: 0.6,
  });
  
  return { geometry, material, canvas };
}

// Kinetic letter with smooth transitions
export function KineticLetter({
  char,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = "#f8f7f4",
  opacity = 1,
  targetPosition,
  targetRotation,
  progress,
  dispersed = false,
}: KineticLetterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const resourcesRef = useRef<{
    geometry: THREE.PlaneGeometry;
    material: THREE.MeshStandardMaterial;
    canvas: HTMLCanvasElement;
  } | undefined>(undefined);
  
  // Create geometry and material
  useEffect(() => {
    const resources = createLetterGeometry(char, color);
    resourcesRef.current = resources;
    
    if (meshRef.current) {
      meshRef.current.geometry = resources.geometry;
      meshRef.current.material = resources.material;
    }
    
    return () => {
      resources.geometry.dispose();
      resources.material.dispose();
      resources.material.map?.dispose();
    };
  }, [char, color]);
  
  // Update opacity
  useEffect(() => {
    if (resourcesRef.current) {
      resourcesRef.current.material.opacity = opacity;
    }
  }, [opacity]);
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const current = meshRef.current;
    const lerpFactor = dispersed ? 0.015 : 0.035;
    
    // Interpolate position
    const targetPos = targetPosition || position;
    current.position.x += (targetPos[0] - current.position.x) * lerpFactor;
    current.position.y += (targetPos[1] - current.position.y) * lerpFactor;
    current.position.z += (targetPos[2] - current.position.z) * lerpFactor;
    
    // Interpolate rotation
    const targetRot = targetRotation || rotation;
    current.rotation.x += (targetRot[0] - current.rotation.x) * lerpFactor;
    current.rotation.y += (targetRot[1] - current.rotation.y) * lerpFactor;
    current.rotation.z += (targetRot[2] - current.rotation.z) * lerpFactor;
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

// Fragmented typography for problem state - CONSISTENCY broken apart
export function FragmentedTypography({ opacity, progress }: { opacity: number; progress: number }) {
  const dispersed = progress < 0.3;
  
  const letters = useMemo(() => {
    const text = "CONSISTENCY";
    const baseSpacing = 0.65;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => {
      const basePos: [number, number, number] = [
        startX + i * baseSpacing,
        1.2,
        0
      ];
      
      if (dispersed) {
        return {
          char,
          pos: [
            basePos[0] + (Math.random() - 0.5) * 4.5,
            basePos[1] + (Math.random() - 0.5) * 3.2,
            basePos[2] + (Math.random() - 0.5) * 2.5,
          ] as [number, number, number],
          rot: [
            (Math.random() - 0.5) * 0.7,
            (Math.random() - 0.5) * 0.9,
            (Math.random() - 0.5) * 0.5,
          ] as [number, number, number],
          target: basePos,
        };
      }
      
      return {
        char,
        pos: basePos,
        rot: [0, 0, 0] as [number, number, number],
        target: basePos,
      };
    });
  }, [dispersed]);
  
  const letters2 = useMemo(() => {
    const text = "BRAND DNA";
    const baseSpacing = 0.62;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => {
      const basePos: [number, number, number] = [
        startX + i * baseSpacing,
        0.0,
        0
      ];
      
      if (dispersed) {
        return {
          char,
          pos: [
            basePos[0] + (Math.random() - 0.5) * 3.8,
            basePos[1] + (Math.random() - 0.5) * 2.8,
            basePos[2] + (Math.random() - 0.5) * 2.2,
          ] as [number, number, number],
          rot: [
            (Math.random() - 0.5) * 0.6,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.4,
          ] as [number, number, number],
          target: basePos,
        };
      }
      
      return {
        char,
        pos: basePos,
        rot: [0, 0, 0] as [number, number, number],
        target: basePos,
      };
    });
  }, [dispersed]);
  
  return (
    <group>
      {letters.map((letter, i) => (
        <KineticLetter
          key={`c-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={letter.rot}
          targetPosition={letter.target}
          targetRotation={[0, 0, 0]}
          scale={0.48}
          color="#6BA37A"
          opacity={opacity * 0.9}
          progress={progress}
          dispersed={dispersed}
        />
      ))}
      {letters2.map((letter, i) => (
        <KineticLetter
          key={`b-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={letter.rot}
          targetPosition={letter.target}
          targetRotation={[0, 0, 0]}
          scale={0.45}
          color="#6BA37A"
          opacity={opacity * 0.85}
          progress={progress}
          dispersed={dispersed}
        />
      ))}
    </group>
  );
}

// Aligned typography for resolved state - TRUST and REFINE
export function AlignedTypography({ opacity, progress }: { opacity: number; progress: number }) {
  const converged = progress > 0.6;
  
  const letters1 = useMemo(() => {
    const text = "BRAND VOICE";
    const baseSpacing = 0.62;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => ({
      char,
      pos: [startX + i * baseSpacing, -0.9, 0] as [number, number, number],
    }));
  }, []);
  
  const letters2 = useMemo(() => {
    const text = "TRUST";
    const baseSpacing = 0.85;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => ({
      char,
      pos: [startX + i * baseSpacing, -2.4, 0] as [number, number, number],
    }));
  }, []);
  
  return (
    <group>
      {letters1.map((letter, i) => (
        <KineticLetter
          key={`v-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={[0, 0, 0]}
          scale={0.43}
          color="#f8f7f4"
          opacity={opacity * (converged ? 1 : 0.2)}
          progress={progress}
        />
      ))}
      {letters2.map((letter, i) => (
        <KineticLetter
          key={`t-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={[0, 0, 0]}
          scale={0.58}
          color="#f8f7f4"
          opacity={opacity * (converged ? 1 : 0.2)}
          progress={progress}
        />
      ))}
    </group>
  );
}

// Grid lines for structure visualization
export function StructureGrid({ opacity, progress }: { opacity: number; progress: number }) {
  const linesRef = useRef<THREE.Group>(null);
  
  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(0x6BA37A),
        transparent: true,
        opacity: opacity * Math.min(progress * 2, 0.12),
      }),
    [opacity, progress]
  );
  
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial]);
  
  const lines = useMemo(() => {
    const gridLines: THREE.BufferGeometry[] = [];
    
    // Horizontal lines
    for (let i = -4; i <= 4; i++) {
      const points = [
        new THREE.Vector3(-8, i * 0.8, -1),
        new THREE.Vector3(8, i * 0.8, -1),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      gridLines.push(geometry);
    }
    
    // Vertical lines
    for (let i = -10; i <= 10; i++) {
      const points = [
        new THREE.Vector3(i * 0.8, -4, -1),
        new THREE.Vector3(i * 0.8, 4, -1),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      gridLines.push(geometry);
    }
    
    return gridLines;
  }, []);
  
  useEffect(() => {
    return () => {
      lines.forEach(line => line.dispose());
    };
  }, [lines]);
  
  useFrame(() => {
    if (linesRef.current && lineMaterial) {
      lineMaterial.opacity = opacity * Math.min(progress * 2, 0.12);
    }
  });
  
  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <lineSegments key={i}>
          <primitive object={line} attach="geometry" />
          <primitive object={lineMaterial} attach="material" />
        </lineSegments>
      ))}
    </group>
  );
}

// Middle-scroll typography - VALIDATE and ALIGNMENT (appears at 0.3-0.6 scroll progress)
export function ValidationTypography({ opacity, progress }: { opacity: number; progress: number }) {
  const visible = progress > 0.25 && progress < 0.7;
  const localProgress = Math.max(0, Math.min(1, (progress - 0.25) / 0.35));
  
  const letters1 = useMemo(() => {
    const text = "VALIDATE";
    const baseSpacing = 0.68;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => ({
      char,
      pos: [startX + i * baseSpacing, 0.5, 0] as [number, number, number],
    }));
  }, []);
  
  const letters2 = useMemo(() => {
    const text = "REFINE";
    const baseSpacing = 0.75;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => ({
      char,
      pos: [startX + i * baseSpacing, -1.0, 0] as [number, number, number],
    }));
  }, []);
  
  const displayOpacity = visible ? opacity * Math.sin(localProgress * Math.PI) : 0;
  
  return (
    <group>
      {letters1.map((letter, i) => (
        <KineticLetter
          key={`val-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={[0, 0, 0]}
          scale={0.5}
          color="#8ec19d"
          opacity={displayOpacity * 0.75}
          progress={progress}
        />
      ))}
      {letters2.map((letter, i) => (
        <KineticLetter
          key={`ref-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={[0, 0, 0]}
          scale={0.52}
          color="#6BA37A"
          opacity={displayOpacity * 0.8}
          progress={progress}
        />
      ))}
    </group>
  );
}

// Clarity layer - ALIGNMENT and COHERENCE (appears at 0.4-0.75 scroll progress)
export function ClarityTypography({ opacity, progress }: { opacity: number; progress: number }) {
  const visible = progress > 0.38 && progress < 0.78;
  const localProgress = Math.max(0, Math.min(1, (progress - 0.38) / 0.4));
  
  const letters1 = useMemo(() => {
    const text = "ALIGNMENT";
    const baseSpacing = 0.62;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => ({
      char,
      pos: [startX + i * baseSpacing, 1.8, -0.5] as [number, number, number],
    }));
  }, []);
  
  const letters2 = useMemo(() => {
    const text = "COHERENCE";
    const baseSpacing = 0.6;
    const startX = -(text.length * baseSpacing) / 2;
    
    return text.split("").map((char, i) => ({
      char,
      pos: [startX + i * baseSpacing, -0.3, -0.5] as [number, number, number],
    }));
  }, []);
  
  const displayOpacity = visible ? opacity * Math.sin(localProgress * Math.PI) * 0.6 : 0;
  
  return (
    <group>
      {letters1.map((letter, i) => (
        <KineticLetter
          key={`aln-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={[0, 0, 0]}
          scale={0.44}
          color="#f8f7f4"
          opacity={displayOpacity}
          progress={progress}
        />
      ))}
      {letters2.map((letter, i) => (
        <KineticLetter
          key={`coh-${i}`}
          char={letter.char}
          position={letter.pos}
          rotation={[0, 0, 0]}
          scale={0.42}
          color="#f8f7f4"
          opacity={displayOpacity * 0.9}
          progress={progress}
        />
      ))}
    </group>
  );
}

// Subtle accent particles
export function AccentParticles({ opacity }: { opacity: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [geometry, material] = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1.5;
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0x6BA37A,
      size: 0.025,
      transparent: true,
      opacity: opacity * 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return [geom, mat];
  }, [opacity]);
  
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });
  
  return <points ref={particlesRef} geometry={geometry} material={material} />;
}

