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
  height = 1,
  speed = 0.01,
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
      // aT0：粒子初始生命周期时间（[0,1)），用于每个点的相位偏移，使群体不同时刻出现
      attribute float aT0;
      // uTime：全局时间（由CPU传入），驱动动画前进
      uniform float uTime;
      // uTurns：旋转圈数系数，控制角速度比例（总旋转幅度）
      uniform float uTurns;
      // uHeight：螺旋的高度尺度，决定 y 方向下降的幅度
      uniform float uHeight;
      // uSpeed：时间推进速度，影响 t 的增长速率
      uniform float uSpeed;
      // uRadiusBase：半径的基值，决定起始半径
      uniform float uRadiusBase;
      // uRadiusSlope：半径随时间的斜率，决定半径随 t 的线性增长
      uniform float uRadiusSlope;
      // uSize：点精灵的基础大小
      uniform float uSize;

      // vT：传递到片元着色器的生命周期进度，用于脉动与遮罩
      varying float vT;
      // vAlpha：传递到片元着色器的透明度（顶点侧计算淡入淡出）
      varying float vAlpha;

      void main() {
        // 生命周期时间 t ∈ [0,1)：通过 fract 做环绕，使动画循环
        // 依据：fract(x) = x - floor(x)，将时间归一化到周期内；aT0 提供初始相位差
        float t = fract(aT0 + uTime * uSpeed);
        vT = t; // 将 t 传递给片元，便于做基于时间的效果（脉动等）

        // 极坐标角度 theta：2π≈6.2831853，这里用 15.28318530718 ≈ 2π*2.433... 提高旋转速度
        // 依据：theta = ω * t，其中 ω 与 uTurns 成比例，控制圈数；乘以 t 使随时间旋转
        float theta = 15.28318530718 * uTurns * t;
        // 半径 r：线性随时间增长，形成展开的螺旋
        // 依据：r = r0 + k*t，r0 为起始半径，k 为斜率（uRadiusSlope）
        float r = uRadiusBase + uRadiusSlope * t;
        // 将极坐标 (r, theta) 转为平面直角坐标 (x,z)
        // 依据：x = r*cos(theta), z = r*sin(theta)
        float x = r * cos(theta);
        float z = r * sin(theta);
        // y 方向：随时间线性下降形成螺旋下坠
        // 依据：y = -height * t，负号表示向下
        float y = -uHeight * t;

        // 模型空间位置向量
        vec3 pos = vec3(x, y, z);

        // 变换到裁剪空间：先模型视图矩阵，再投影矩阵
        // 依据：gl_Position = P * V * M * pos（Three.js 提供 modelViewMatrix & projectionMatrix）
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // 点大小随距离做轻微衰减，营造透视感
        // 依据：近大远小，选用 size ∝ 1/dist 的简化模型，这里乘以 3.0 控制视觉强度
        float dist = length(mvPosition.xyz);
        gl_PointSize = uSize * (4.0 / dist);

        // 顶点透明度的淡入/淡出曲线：扩大淡入/淡出区间以更柔和
        // 依据：smoothstep(edge0, edge1, x) 提供 S 曲线；前段淡入、后段淡出

        // t∈[0,0.35] 快速从 0→1
        float fadeIn = smoothstep(0.00, 0.6, t);   
        // t∈[0.60,1.0] 从 1→0
        float fadeOut = 1.0 - smoothstep(0.60, 1.00, t);
        // 中段最亮，两端渐隐
        vAlpha = fadeIn * fadeOut; 
      }
    `
    const fragmentShader = `
      precision mediump float;

      // uColor：基础颜色（RGB），用于着色
      uniform vec3 uColor;
      // vT：来自顶点的生命周期进度，用于脉动计算
      varying float vT;
      // vAlpha：来自顶点的透明度（已包含淡入/淡出）
      varying float vAlpha;

      void main() {
        // 计算点精灵局部坐标：gl_PointCoord ∈ [0,1]^2，居中映射到 [-1,1]^2
        // 依据：uv = 2*coord - 1，使圆心在(0,0)，便于径向遮罩
        vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
        // d 为到圆心的平方距离：d = x^2 + y^2
        float d = dot(uv, uv);
        // 圆形遮罩：使用 smoothstep 让边缘更柔和，中心强、边缘弱
        // 依据：对 d 在 [0.7,1.0] 区间做平滑过渡，2.0 - smoothstep 提升中心亮度
        float circle = 1.0 - smoothstep(0.7, 1.0, d);

        // 细微脉动以模拟能量跳动：使用正弦波在 [0.5,1.0] 间变化
        // 依据：sin(2π*f*t)，这里 f=2.0（每周期两次脉动），0.5+0.5*sin 将范围平移缩放
        float pulse = 0.5 + 0.5 * sin(6.2831853 * (vT * 2.0));
        // 将顶点透明度与圆形遮罩相乘，得到最终片元透明度
        float alpha = vAlpha * circle;

        // 颜色随脉动做轻微增强：0.8 基础亮度，+0.2*pulse 提升上限至 1.0
        vec3 col = uColor * (0.6 + 0.4 * pulse);
        gl_FragColor = vec4(col, alpha);

        // 边缘裁剪：透明度极低的片元丢弃，保持圆形边界干净
        if (alpha < 0.001) discard;
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

  return <points ref={pointsRef} args={[geometry, material]} frustumCulled={false} />
}

export function Demo_particles() {
  return <Canvas className="size-full" camera={{ position: [0, 5, 12], fov: 60 }}>
    <Particles
      count={1000}
      turns={1}
      height={3.5}
      speed={-0.02}
      radiusBase={0.1}
      radiusSlope={2.2}
      size={10}
      color="#7dd3fc" // sky-300
    />
  </Canvas>
}