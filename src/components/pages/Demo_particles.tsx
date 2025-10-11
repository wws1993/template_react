import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

type SpiralUniforms = {
  uTime: { value: number }
  uTurns: { value: number }
  uHeight: { value: number }
  uSpeed: { value: number }
  uRadiusBase: { value: number }
  uRadiusSlope: { value: number }
  uSize: { value: number }
  uColor: { value: THREE.Color }
}

function Particles({
  count = 9000,
  turns = 12,
  height = 28,
  speed = 0.08,
  radiusBase = 0.2,
  radiusSlope = 2.2,
  size = 5, // 调整为更柔和的粒径
  color = "#7dd3fc",
}: {
  count?: number
  turns?: number
  height?: number
  speed?: number
  radiusBase?: number
  radiusSlope?: number
  size?: number
  color?: string
}) {
  const pointsRef = useRef<THREE.Points>(null)

  // Attribute buffers: initial phase t0 in [0,1)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const t0 = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      t0[i] = Math.random()
    }
    // 占位 position，用于确立顶点数量（实际位置在着色器内计算）
    const pos = new Float32Array(count * 3)
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    geo.setAttribute("aT0", new THREE.BufferAttribute(t0, 1))
    return geo
  }, [count])

  const uniforms = useMemo<SpiralUniforms>(
    () => ({
      uTime: { value: 0 },
      uTurns: { value: turns },
      uHeight: { value: height },
      uSpeed: { value: speed },
      uRadiusBase: { value: radiusBase },
      uRadiusSlope: { value: radiusSlope },
      uSize: { value: size },
      uColor: { value: new THREE.Color(color) },
    }),
    [turns, height, speed, radiusBase, radiusSlope, size, color]
  )

  const material = useMemo(() => {
    const vertexShader = `
      attribute float aT0;
      uniform float uTime;
      uniform float uTurns;
      uniform float uHeight;
      uniform float uSpeed;
      uniform float uRadiusBase;
      uniform float uRadiusSlope;
      uniform float uSize;

      varying float vT;
      varying float vAlpha;

      void main() {
        // lifecycle time [0,1): advance and wrap
        float t = fract(aT0 + uTime * uSpeed);
        vT = t;

        float theta = 6.28318530718 * uTurns * t;
        float r = uRadiusBase + uRadiusSlope * t;
        float x = r * cos(theta);
        float z = r * sin(theta);
        float y = -uHeight * t;

        // position in model space
        vec3 pos = vec3(x, y, z);

        // project
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // point size with mild perspective attenuation
        float dist = length(mvPosition.xyz);
        gl_PointSize = uSize * (5.0 / dist);

        // 更柔和的透明度曲线：扩大淡入/淡出区间
        float fadeIn = smoothstep(0.00, 0.35, t);
        float fadeOut = 1.0 - smoothstep(0.60, 1.00, t);
        vAlpha = fadeIn * fadeOut;
      }
    `
    const fragmentShader = `
      precision mediump float;

      uniform vec3 uColor;
      varying float vT;
      varying float vAlpha;

      void main() {
        // circular sprite mask
        vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
        float d = dot(uv, uv);
        // 修正遮罩：中心强、边缘弱
        float circle = 1.0 - smoothstep(0.7, 1.0, d);

        // subtle pulsation to mimic energy
        float pulse = 0.5 + 0.5 * sin(6.2831853 * (vT * 2.0));
        float alpha = vAlpha * circle;

        vec3 col = uColor * (0.8 + 0.2 * pulse);
        gl_FragColor = vec4(col, alpha);

        // discard edges to keep round points
        if (alpha < 0.01) discard;
      }
    `
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
    })
    return mat
  }, [uniforms])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
  })

  return (
    <points ref={pointsRef} args={[geometry, material]} frustumCulled={false} />
  )
}

export function Demo_particles() {
  return (
    <div className="relative h-svh w-full bg-black">
      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <color attach="background" args={["#020617"]} /> {/* slate-950 */}
        <ambientLight intensity={0.1} />
        <Particles
          count={9000}
          turns={12}
          height={28}
          speed={0.08}
          radiusBase={0.2}
          radiusSlope={2.2}
          size={5}
          color="#7dd3fc" // sky-300
        />
      </Canvas>

      {/* 顶部固定标题条，避免遮挡内容 */}
      <div className="pointer-events-none fixed left-0 top-0 z-10 w-full pt-4">
        <div className="mx-auto max-w-6xl px-4">
          <div className="inline-flex rounded-2xl bg-white/10 px-4 py-2 backdrop-blur">
            <span className="text-sm font-medium text-white/90">螺丝钉粒子效果</span>
          </div>
        </div>
      </div>
    </div>
  )
}