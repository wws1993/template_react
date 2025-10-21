import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export function Cube() {
  const CubeRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    CubeRef.current.rotation.x = Math.sin(t)
    CubeRef.current.rotation.y = Math.sin(t)
  })

  return <mesh ref={CubeRef}>
    <directionalLight color="red" position={[0, 60, 20]} />

    <boxGeometry args={[2, 1, 1]} />
    <meshStandardMaterial />
  </mesh>
}

export function Demo_learn() {
  return <Canvas
    scene={{
      background: new THREE.Color('skyblue'), // 场景背景色
      fog: new THREE.Fog(0x000000, 10, 50),   // 雾效
    }}
    frameloop='demand'
    camera={{ position: [0, 0, 10] }}>
    <Cube />
  </Canvas>;
}