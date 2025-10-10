import * as THREE from 'three'
import { useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { getProject } from '@theatre/core'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import { editable as e, SheetProvider } from '@theatre/r3f'
import { PerspectiveCamera } from '@theatre/r3f'
import state1 from '@/state/state1.json'

// our Theatre.js project sheet, we'll use this later
const demoSheet = getProject('Demo Project', {state: state1}).sheet('Demo Sheet')

studio.initialize()
studio.extend(extension)

function Cube() {
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  useLayoutEffect(() => {
    demoSheet.project.ready.then(() => demoSheet.sequence.play({ iterationCount: Infinity, range: [0, 5] }))
  }, [])

  return <e.mesh
    theatreKey='cube'
    scale={active ? 1.5 : 1}
    onClick={() => setActive(!active)}
    onPointerOver={() => setHover(true)}
    onPointerOut={() => setHover(false)}
  >
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
  </e.mesh>
}

export function Demo_3D() {
  return <Canvas>
    <SheetProvider sheet={demoSheet}>
      <PerspectiveCamera theatreKey="Camera" makeDefault position={[5, 5, -5]} fov={75} />

      <e.ambientLight theatreKey='Ambient Light' color='#ff0' />
      <e.pointLight theatreKey='Light' position={[3, 10, 10]} />

      <Cube />
    </SheetProvider>
  </Canvas>
}