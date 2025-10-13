import React from "react"
import { useState, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { MeteorParticles } from "@/components/particles/MeteorParticles"

/**
 * Demo_particlesV2
 * React Three Fiber 流星粒子参数面板占位组件。
 * 说明：
 * - 本组件先提供参数可视化面板，后续将把这些参数传递给 r3f 粒子系统与着色器。
 * - 参数包括粒子数量、大小、发射频率、拖尾长度、透明度衰减、重力、速度、角度（默认25°）。
 * - 所有参数通过 useState 管理，并提供交互控件（shadcn/ui）。
 * - 后续将把这些参数通过 Context 或 props 传给具体粒子系统组件。
 *
 * 可扩展性：
 * - 可将参数持久化到 URL 或本地存储；
 * - 可增加预设方案（柔和/强烈/长拖尾等）。
 */
export function Demo_particlesV2() {
  // 参数状态，提供合理默认值
  const [count, setCount] = useState(800)
  const [size, setSize] = useState(3) // 单位：像素或 gl_PointSize 基准
  const [spawnRate, setSpawnRate] = useState(120) // 每秒发射粒子数
  const [tailLength, setTailLength] = useState(0.6) // 0~1 的归一化拖尾系数
  const [alphaDecay, setAlphaDecay] = useState(1.2) // 透明度衰减速率，越大越快
  const [gravity, setGravity] = useState(9.8) // 抛物线重力加速度（可按场景缩放）
  const [speed, setSpeed] = useState(35) // 初速度标量
  const [angleDeg, setAngleDeg] = useState(25) // 初速度方向角（默认 25° 朝右上）
  const [pulseSize, setPulseSize] = useState(true) // 是否开启粒子尺寸脉动
  const [enableEmitter, setEnableEmitter] = useState(true) // 是否启用发射器

  // 供未来传入粒子系统的 memo 化参数对象
  const params = useMemo(
    () => ({
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
    }),
    [
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
    ]
  )

  // 仅展示参数面板；后续将挂载 Canvas 与粒子系统
  /**
   * 打印当前参数
   * 用途：调试/记录当前面板参数，辅助着色器与发射器调优
   */
  const handlePrint = () => {
    console.log("Meteor params:", params)
  }

  return (
    <div className="flex min-h-svh flex-col bg-black/70 text-white">

      {/* 主体内容上方预留高度以免被固定栏遮挡 */}
      <div className="flex grow">
        <div className="mx-auto flex w-xl max-w-5xl flex-col gap-6 px-4 py-6">
          {/* 工具栏：打印参数 */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="cursor-pointer" onClick={handlePrint}>
              打印参数
            </Button>
            <span className="text-xs opacity-70">在控制台查看当前参数 JSON</span>
          </div>
          {/* 开关控制 */}
          <div className="grid grid-cols-1 gap-6 rounded-lg border border-white/10 bg-neutral-900/50 p-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">启用发射器</Label>
              <Switch checked={enableEmitter} onCheckedChange={setEnableEmitter} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">粒子尺寸脉动</Label>
              <Switch checked={pulseSize} onCheckedChange={setPulseSize} />
            </div>
          </div>

          {/* 数量、大小、发射频率 */}
          <PanelSection title="基础参数">
            <SliderRow
              label="粒子数量"
              value={count}
              min={100}
              max={5000}
              step={50}
              onValueChange={(v) => setCount(v)}
            />
            <SliderRow
              label="粒子大小"
              value={size}
              min={1}
              max={12}
              step={1}
              onValueChange={(v) => setSize(v)}
            />
            <SliderRow
              label="发射频率（每秒）"
              value={spawnRate}
              min={10}
              max={600}
              step={10}
              onValueChange={(v) => setSpawnRate(v)}
            />
          </PanelSection>

          {/* 拖尾与透明度 */}
          <PanelSection title="拖尾/透明度">
            <SliderRow
              label="拖尾长度（0~1）"
              value={tailLength}
              min={0}
              max={1}
              step={0.05}
              onValueChange={(v) => setTailLength(v)}
            />
            <SliderRow
              label="透明度衰减速率"
              value={alphaDecay}
              min={0.2}
              max={3}
              step={0.1}
              onValueChange={(v) => setAlphaDecay(v)}
            />
          </PanelSection>

          {/* 物理与方向 */}
          <PanelSection title="运动/方向">
            <SliderRow
              label="重力加速度"
              value={gravity}
              min={0}
              max={25}
              step={0.5}
              onValueChange={(v) => setGravity(v)}
            />
            <SliderRow
              label="初速度标量"
              value={speed}
              min={5}
              max={120}
              step={5}
              onValueChange={(v) => setSpeed(v)}
            />
            <AngleRow angle={angleDeg} onChange={setAngleDeg} />
          </PanelSection>
        </div>

        {/* 预览区域：集成 r3f Canvas 与流星粒子系统 */}
        <div className="flex-1 rounded-lg border border-white/10 bg-neutral-900/40 p-0">
          <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
            {/* 背景与微光效果 */}
            <color attach="background" args={["#0b0b0b"]} />
            <ambientLight intensity={0.4} />
            {/* 流星粒子系统 */}
            <MeteorParticles
              count={params.count}
              size={params.size}
              spawnRate={params.spawnRate}
              tailLength={params.tailLength}
              alphaDecay={params.alphaDecay}
              gravity={params.gravity}
              speed={params.speed}
              angleDeg={params.angleDeg}
              pulseSize={params.pulseSize}
              enableEmitter={params.enableEmitter}
            />
          </Canvas>
        </div>
      </div>
    </div>
  )
}

/**
 * PanelSection
 * 带标题的卡片分区。
 */
function PanelSection(props: { title: string; children: React.ReactNode }) {
  const { title, children } = props
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/50 p-4">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

/**
 * SliderRow
 * 组合标签、滑块与数值输入的行组件。
 */
function SliderRow(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onValueChange: (next: number) => void
}) {
  const { label, value, min, max, step, onValueChange } = props

  // 输入框变化时，限定范围并更新
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value)
    const clamped = Math.min(max, Math.max(min, num))
    onValueChange(clamped)
  }

  return (
    <div className="flex items-center gap-4">
      <Label className="w-32 text-sm">{label}</Label>
      <div className="flex grow flex-col gap-2">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(arr) => {
            const clamped = Math.min(max, Math.max(min, Number(arr[0])))
            onValueChange(clamped)
          }}
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="w-32"
            value={value}
            onChange={onInputChange}
          />
          <span className="text-xs opacity-70">
            范围：{min} ~ {max}，步进：{step}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * AngleRow
 * 角度控制行（默认 25°），范围 [-10°, 80°]，用于控制拖尾朝向与初速度方向。
 */
function AngleRow(props: { angle: number; onChange: (next: number) => void }) {
  const { angle, onChange } = props
  const min = -10
  const max = 80
  const step = 1

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value)
    const clamped = Math.min(max, Math.max(min, num))
    onChange(clamped)
  }

  return (
    <div className="flex items-center gap-4">
      <Label className="w-32 text-sm">方向角度（°）</Label>
      <div className="flex grow flex-col gap-2">
        <Slider
          value={[angle]}
          min={min}
          max={max}
          step={step}
          onValueChange={(arr) => {
            const clamped = Math.min(max, Math.max(min, Number(arr[0])))
            onChange(clamped)
          }}
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="w-24"
            value={angle}
            onChange={onInputChange}
          />
          <span className="text-xs opacity-70">
            默认 25°（向右上），范围：{min}° ~ {max}°，步进：{step}°
          </span>
        </div>
      </div>
    </div>
  )
}