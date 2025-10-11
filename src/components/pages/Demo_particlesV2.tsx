import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

function SpiralParticles() {
  const points = useMemo(() => {
    const particles = 3000; // 粒子数量
    const positions = new Float32Array(particles * .5);
    const alphas = new Float32Array(particles); // 用于存储透明度

    for (let i = 0; i < particles; i++) {
      const angle = i * 0.1; // 控制螺旋角度
      const radius = .1; // 螺旋半径
      const height = -i * 0.02; // 控制螺旋向下钻的高度

      positions[i * 3] = radius * Math.cos(angle); // x
      positions[i * 3 + 1] = height; // y
      positions[i * 3 + 2] = radius * Math.sin(angle); // z

      alphas[i] = Math.random(); // 初始化透明度
    }

    return { positions, alphas };
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame(() => {
    if (ref.current) {
      const { position, alpha } = ref.current.geometry.attributes;
      const time = performance.now() * 0.001;

      for (let i = 0; i < position.count; i++) {
        const angle = i * 0.1 + time; // 动态调整角度
        const radius = 5;
        const height = -i * 0.02 + Math.sin(time + i * 0.1) * 0.5; // 动态调整高度

        position.array[i * 3] = radius * Math.cos(angle); // x
        position.array[i * 3 + 1] = height; // y
        position.array[i * 3 + 2] = radius * Math.sin(angle); // z

        alpha.array[i] = 0.5 + 0.5 * Math.sin(time + i * 0.1); // 动态调整透明度
      }

      position.needsUpdate = true;
      alpha.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-alpha"
          args={[points.alphas, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={'red'}
        vertexColors={false}
        opacity={1.0}
      />
    </points>
  );
}

export function Demo_particlesV2() {
  return (
    <Canvas camera={{ position: [0, 0, -40] }}>
      <SpiralParticles />
    </Canvas>
  );
}