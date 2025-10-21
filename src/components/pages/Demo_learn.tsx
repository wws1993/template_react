import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

// 动画立方体组件
export function AnimatedCube() {
  const cubeRef = useRef<THREE.Mesh>(null!)
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    cubeRef.current.rotation.x = Math.sin(t) * 0.5
    cubeRef.current.rotation.y = Math.cos(t) * 0.5
  })

  return (
    <mesh ref={cubeRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff6b6b" />
    </mesh>
  )
}

// 静态立方体组件
export function StaticCube() {
  return (
    <mesh position={[3, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4ecdc4" />
    </mesh>
  )
}

// FPS 监控组件
export function FPSMonitor() {
  const [fps, setFps] = useState(0)
  
  useFrame(({performance}) => {
    setFps(Math.round(performance.current * 60))
  })
  
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace'
    }}>
      FPS: {fps}
    </div>
  )
}

export function Demo_learn() {
  const [frameloopMode, setFrameloopMode] = useState<'always' | 'demand' | 'never'>('always')
  const [renderCount, setRenderCount] = useState(0)

  // 手动渲染控制（用于 never 模式）
  const manualRender = () => {
    setRenderCount(prev => prev + 1)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 控制面板 */}
      <div style={{ padding: '10px', background: '#333', color: 'white' }}>
        <label>
          渲染模式:
          <select 
            value={frameloopMode} 
            onChange={(e) => setFrameloopMode(e.target.value as any)}
            style={{ marginLeft: '10px' }}
          >
            <option value="always">持续渲染 (always)</option>
            <option value="demand">按需渲染 (demand)</option>
            <option value="never">手动控制 (never)</option>
          </select>
        </label>
        
        {frameloopMode === 'never' && (
          <button 
            onClick={manualRender}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            手动渲染 (点击次数: {renderCount})
          </button>
        )}
        
        <div style={{ marginTop: '5px', fontSize: '12px' }}>
          {frameloopMode === 'always' && '每帧都渲染 - 最高性能消耗'}
          {frameloopMode === 'demand' && '只在变化时渲染 - 平衡性能'}
          {frameloopMode === 'never' && '完全手动控制 - 最低性能消耗'}
        </div>
      </div>

      {/* 3D场景 */}
      <Canvas
        frameloop={frameloopMode}
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ flex: 1, background: '#1a1a2e' }}
      >
        {/* 基础光照 */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        
        {/* 场景内容 */}
        <AnimatedCube />
        <StaticCube />
        
        {/* 控制器和辅助工具 */}
        <OrbitControls />
        <axesHelper args={[5]} />
        <Stats /> {/* 性能统计面板 */}
      </Canvas>
      
      {/* FPS 显示 */}
      <FPSMonitor />
    </div>
  )
}
