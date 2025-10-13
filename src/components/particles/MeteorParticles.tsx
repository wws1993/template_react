import React, { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * MeteorParticles
 * 使用 Points + ShaderMaterial 的流星粒子系统。
 * 特性：
 * - 拖尾朝右上方约 25° 方向扩散（通过初速度角度与微小抖动模拟）
 * - 粒子初始透明度为 1，逐渐衰减至 0（片元着色器）
 * - 拖尾长度动态变化（由年龄与发射频率共同决定）
 * - 抛物线轨迹（顶点着色器按重力计算）
 * - 颜色渐变（亮白 → 橙红，片元着色器中实现）
 *
 * 性能与实现说明：
 * - 使用环形缓冲复用粒子，避免频繁分配与释放。
 * - 顶点着色器读取 aAge/aLife/aVelocity/aSeed，为每个点计算位置与大小。
 * - 片元着色器基于 vAgeNorm 插值颜色与透明度，并用 gl_PointCoord 柔化边缘。
 */
export function MeteorParticles(props: {
  count: number
  size: number
  spawnRate: number
  tailLength: number
  alphaDecay: number
  gravity: number
  speed: number
  angleDeg: number
  pulseSize: boolean
  enableEmitter: boolean
}) {
  const {
    count,
    size,
    spawnRate,
    tailLength,
    alphaDecay,
    gravity,
    speed,
    angleDeg,
    pulseSize,
    enableEmitter,
  } = props

  // 计算发射基础方向（右上 25°）
  const baseDir = useMemo(() => {
    const rad = (angleDeg * Math.PI) / 180
    return new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0).normalize()
  }, [angleDeg])

  // 几何与属性缓冲
  const geometryRef = useRef<THREE.BufferGeometry>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const attributesReady = useRef(false) // 几何属性是否已绑定

  // 预分配缓冲区
  const buffers = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const ages = new Float32Array(count)
    const lifes = new Float32Array(count)
    const seeds = new Float32Array(count)

    // 初始化：全部置为未激活（age 超过 life 会立即重生）
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = -10 // 初始位置偏左（屏幕外），便于看到拖尾进入
      positions[i * 3 + 1] = -5 // 初始位置偏下（屏幕外）
      positions[i * 3 + 2] = 0
      velocities[i * 3 + 0] = 0
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = 0
      ages[i] = 1e9 // 使其在第一帧被重生
      lifes[i] = 1
      seeds[i] = Math.random()
    }

    return { positions, velocities, ages, lifes, seeds }
  }, [count])

  // 设置 BufferGeometry 属性：等待 ref 与 buffers 就绪后再绑定
  useEffect(() => {
    const geom = geometryRef.current
    if (!geom) return
    geom.setAttribute("position", new THREE.BufferAttribute(buffers.positions, 3))
    geom.setAttribute("aVelocity", new THREE.BufferAttribute(buffers.velocities, 3))
    geom.setAttribute("aAge", new THREE.BufferAttribute(buffers.ages, 1))
    geom.setAttribute("aLife", new THREE.BufferAttribute(buffers.lifes, 1))
    geom.setAttribute("aSeed", new THREE.BufferAttribute(buffers.seeds, 1))
    attributesReady.current = true
  }, [buffers])

  // 发射计时器与环形索引
  const spawnAccumulator = useRef(0)
  const nextIndex = useRef(0)

  /**
   * 重生一个粒子（环形复用）
   * 逐行注释：复杂算法
   * - 计算带扩散的初速度方向（在基础 25° 附近加入小抖动）
   * - life 与 tailLength、alphaDecay、速度等共同决定可见拖尾长度
   * - 初始位置略偏左下，保证拖尾朝右上方进入视野
   */
  const respawn = (idx: number) => {
    // 1) 为每个粒子生成微小的方向扰动（依据：模拟拖尾扩散）
    const spread = 0.08 // 扩散强度（越大越散）
    const jitterX = (Math.random() * 2 - 1) * spread
    const jitterY = (Math.random() * 2 - 1) * spread

    // 2) 基于基础方向与抖动构建方向向量
    const dir = new THREE.Vector3(baseDir.x + jitterX, baseDir.y + jitterY, 0).normalize()

    // 3) 初速度向量（依据：速度标量与方向角决定）
    const v = dir.clone().multiplyScalar(speed)

    // 4) 赋值到缓冲
    buffers.positions[idx * 3 + 0] = -10 + Math.random() * 2 // 初始 X（左侧屏外）
    buffers.positions[idx * 3 + 1] = -5 + Math.random() * 1.5 // 初始 Y（下侧屏外）
    buffers.positions[idx * 3 + 2] = 0

    buffers.velocities[idx * 3 + 0] = v.x
    buffers.velocities[idx * 3 + 1] = v.y
    buffers.velocities[idx * 3 + 2] = 0

    // 5) 初始年龄为 0（依据：新发射）
    buffers.ages[idx] = 0

    // 6) 计算生命周期（依据：拖尾长度 + 衰减速率 + 速度）
    // 拖尾长度越大，生命周期越长；alphaDecay 越大，视觉消失越快
    const baseLife = 1.5 + tailLength * 2.0 // 基础生命周期区间
    const decayFactor = Math.max(0.4, 1.6 - alphaDecay * 0.4) // 衰减对 life 的影响
    buffers.lifes[idx] = baseLife * decayFactor

    // 7) 随机种子（用于着色器脉动与细节）
    buffers.seeds[idx] = Math.random()

    // 8) 标记几何属性已更新（位置与自定义属性）
    const geom = geometryRef.current
    if (!geom) return
    if (!attributesReady.current) return
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute | undefined
    const velAttr = geom.getAttribute("aVelocity") as THREE.BufferAttribute | undefined
    const ageAttr = geom.getAttribute("aAge") as THREE.BufferAttribute | undefined
    const lifeAttr = geom.getAttribute("aLife") as THREE.BufferAttribute | undefined
    const seedAttr = geom.getAttribute("aSeed") as THREE.BufferAttribute | undefined
    if (posAttr) posAttr.needsUpdate = true
    if (velAttr) velAttr.needsUpdate = true
    if (ageAttr) ageAttr.needsUpdate = true
    if (lifeAttr) lifeAttr.needsUpdate = true
    if (seedAttr) seedAttr.needsUpdate = true
  }

  // 帧更新：年龄推进与定时发射
  useFrame((_, dt) => {
    // 在属性未绑定前不进行几何更新，避免 getAttribute 为空
    if (!attributesReady.current) return
    // 逐行注释：复杂算法
    // 1) 年龄推进（依据：每帧时间增量 dt）
    for (let i = 0; i < count; i++) {
      buffers.ages[i] += dt
      // 2) 超龄复用（依据：age 超过 life）
      if (buffers.ages[i] > buffers.lifes[i]) {
        // 若发射器启用，则立即重生；否则保持超龄状态不显示
        if (enableEmitter) respawn(i)
      }
    }

    // 3) 根据 spawnRate 累计并发射新粒子（依据：每秒发射频率）
    if (enableEmitter) {
      spawnAccumulator.current += dt * spawnRate
      // 4) 每累计到 1 以上，发射一个粒子（整数部分）
      const toSpawn = Math.floor(spawnAccumulator.current)
      if (toSpawn > 0) {
        spawnAccumulator.current -= toSpawn
        for (let s = 0; s < toSpawn; s++) {
          const idx = nextIndex.current
          nextIndex.current = (nextIndex.current + 1) % count
          respawn(idx)
        }
      }
    }

    // 5) 将年龄属性标记需要更新（保持着色器读取到最新 age）
    const geom = geometryRef.current
    if (geom) {
      ;(geom.getAttribute("aAge") as THREE.BufferAttribute).needsUpdate = true
    }
  })

  // 顶点着色器（逐行注释）
  const vertexShader = /* glsl */ `
    // 顶点着色器：根据年龄计算抛物线位置与点大小
    uniform float uGravity;   // 重力加速度（屏幕坐标系下的 Y 方向）
    uniform float uSize;      // 基础点大小
    uniform float uPulse;     // 是否启用尺寸脉动（1 启用 / 0 关闭）
    attribute float aAge;     // 粒子年龄
    attribute float aLife;    // 粒子生命周期
    attribute float aSeed;    // 随机种子（用于细微差异）
    attribute vec3 aVelocity; // 初速度向量
    varying float vAgeNorm;   // 归一化年龄，用于片元着色器

    void main() {
      // 1) 将年龄归一化到 [0,1]（依据：aAge / aLife）
      float t = aAge;
      float ageNorm = clamp(t / max(aLife, 0.0001), 0.0, 1.0);
      vAgeNorm = ageNorm;

      // 2) 计算抛物线位移（依据：x = v.x * t；y = v.y * t - 0.5*g*t^2）
      vec3 pos = position;
      pos.x += aVelocity.x * t;
      pos.y += aVelocity.y * t - 0.5 * uGravity * t * t;

      // 3) 点大小随年龄动态变化（依据：早期更大更亮，后期减小）
      float sizePulse = 1.0;
      if (uPulse > 0.5) {
        // 3.1) 轻微脉动：用 seed 生成相位差，避免同步
        sizePulse = 0.85 + 0.25 * sin(6.28318 * (t + aSeed));
      }
      // 3.2) 年龄影响：前半段略增，后半段下降
      float sizeAge = mix(1.2, 0.6, ageNorm);
      float pointSize = uSize * sizePulse * sizeAge;

      // 4) 设置裁剪空间坐标（假设已处于合适的世界/视图变换）
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = pointSize;
    }
  `

  // 片元着色器（逐行注释）
  const fragmentShader = /* glsl */ `
    // 片元着色器：颜色渐变、透明度随年龄衰减，并沿 25° 方向实现拖尾拉伸与头部增亮
    precision highp float;
    uniform float uAlphaDecay;   // 透明度衰减速率
    uniform float uDirAngleRad;  // 拖尾方向角（弧度），默认约 25°
    uniform float uTailLength;   // 拖尾拉伸长度系数（越大越长）
    uniform float uHeadBoost;    // 头部亮度提升系数
    varying float vAgeNorm;      // 归一化年龄

    void main() {
      // 1) 点内坐标与居中
      vec2 uv = gl_PointCoord;
      vec2 p = uv - 0.5;

      // 2) 沿指定角度旋转坐标，使 +X 方向与拖尾方向对齐（右上约 25°）
      float c = cos(uDirAngleRad);
      float s = sin(uDirAngleRad);
      vec2 pr = mat2(c, s, -s, c) * p;

      // 3) 各向异性半径（沿拖尾方向放宽，使拖尾更“长”）
      vec2 aniso = vec2(0.55, 1.0); // 横向更宽，纵向保持
      float r = length(pr * aniso);

      // 4) 边缘柔化（圆心越亮，边缘越暗）
      float edge = smoothstep(0.5, 0.22, r);

      // 5) 颜色从亮白到橙红（依据年龄）
      vec3 colStart = vec3(1.0, 1.0, 1.0);
      vec3 colEnd = vec3(1.0, 0.35, 0.0);
      vec3 color = mix(colStart, colEnd, vAgeNorm);

      // 6) 年龄透明度衰减
      float alpha = pow(1.0 - vAgeNorm, max(uAlphaDecay, 0.0001));

      // 7) 拖尾方向拉伸与头部增亮
      //    pr.x > 0 表示沿拖尾方向；使用线性衰减形成更长的尾巴
      float tail = clamp(1.0 - (max(0.0, pr.x) / (uTailLength + 0.0001)), 0.0, 1.0);
      //    pr.x < 0 表示头部区域，提升亮度以突出“更亮的头部”
      float headGlow = 1.0 + uHeadBoost * smoothstep(-0.5, -0.12, pr.x);

      // 8) 组合透明度：边缘柔化 * 拖尾拉伸 * 头部增亮
      alpha *= edge * max(tail, 0.15) * headGlow;

      // 9) 过滤过暗像素避免硬边
      if (alpha < 0.02) discard;

      gl_FragColor = vec4(color, alpha);
    }
  `

  // 材质（ShaderMaterial）
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uGravity: { value: gravity },
        uSize: { value: size },
        uPulse: { value: pulseSize ? 1 : 0 },
        uAlphaDecay: { value: alphaDecay },
        uDirAngleRad: { value: (angleDeg * Math.PI) / 180.0 },
        uTailLength: { value: Math.max(0.2, tailLength * 1.6) }, // 放大以强调拉伸
        uHeadBoost: { value: 0.6 }, // 头部亮度提升
      },
      vertexShader,
      fragmentShader,
    })
  }, [gravity, size, pulseSize, alphaDecay, angleDeg, tailLength])

  // 同步材质 Uniform（当 props 改变时）
  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uGravity.value = gravity
    materialRef.current.uniforms.uSize.value = size
    materialRef.current.uniforms.uPulse.value = pulseSize ? 1 : 0
    materialRef.current.uniforms.uAlphaDecay.value = alphaDecay
    if (materialRef.current.uniforms.uDirAngleRad)
      materialRef.current.uniforms.uDirAngleRad.value = (angleDeg * Math.PI) / 180.0
    if (materialRef.current.uniforms.uTailLength)
      materialRef.current.uniforms.uTailLength.value = Math.max(0.2, tailLength * 1.6)
    if (materialRef.current.uniforms.uHeadBoost)
      materialRef.current.uniforms.uHeadBoost.value = 0.6
  }, [gravity, size, pulseSize, alphaDecay, angleDeg, tailLength])

  return (
    <points>
      <bufferGeometry ref={geometryRef} />
      <shaderMaterial ref={materialRef} args={[material]} />
    </points>
  )
}