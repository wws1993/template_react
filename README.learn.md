# r3f + Shader 粒子效果学习计划（4-6周）

## 总目标
- 熟练使用 React Three Fiber（r3f）构建场景
- 能独立编写 GLSL 着色器，完成百万级粒子的 GPU 驱动与交互
- 掌握性能优化与工程化（调试、热更新、模块化）

## 第0周：准备与环境
- 安装与模板
  - Node.js 18+，Vite + React + TypeScript；安装 @react-three/fiber、@react-three/drei、three、leva
  - 建一个最小场景：Canvas、<mesh> + <boxGeometry> + <meshStandardMaterial>
- 基础阅读
  - r3f 文档（官网）：Canvas、useFrame、useThree、性能指南
  - three.js 文档：BufferGeometry、ShaderMaterial、Points、InstancedMesh
  - The Book of Shaders：uniform、varying、noise、颜色空间
- 目标产出
  - 启动项目并提交到 Git（main + feature/shaders 分支）
  - 用 useFrame 驱动一个旋转 Box，理解渲染循环

## 第1周：three.js 与 r3f 基础巩固
- 几何与材质
  - BufferGeometry：position、color、custom attributes 的创建与更新
  - Points 与 PointsMaterial：基础点渲染、点大小、纹理精灵（sprites）
- r3f 习惯用法
  - useMemo 创建几何与材质；useRef 引用对象；drei 的 OrbitControls、Stats、Environment
- 小练习
  - 1万点随机分布，使用 PointsMaterial + alpha 纹理做简单星空
  - 鼠标交互：hover 改变粒子颜色（用 raycaster 或 shader 中距离判断）
- 里程碑
  - 完成一个“可交互星空”并记录 FPS

## 第2周：GLSL 入门与自定义 ShaderMaterial
- 顶点/片元着色器
  - 顶点控制：position 偏移（基于时间的正弦波）、传递 varying
  - 片元控制：渐变、基于距离的衰减、软边（smoothstep）
- 数据喂入
  - uniforms：time、mouse、resolution；attributes：初始位置、速度、随机因子
- 小练习
  - 自定义 ShaderMaterial 的点渲染：顶点中根据 attribute 偏移，片元中绘制圆形点（discard 非圆区域）
- 里程碑
  - 用纯 ShaderMaterial 实现“”（随时间脉动）

## 第3周：粒子系统（CPU vs GPU）
- CPU 驱动的基线
  - useFrame 中更新 BufferAttribute（positions/velocities），理解瓶颈
- GPU 驱动思想
  - 用顶点着色器做位置更新的局限；引入“数据纹理”（data textures）与 FBO（帧缓冲对象）
  - WebGL2：浮点纹理、ping-pong（读写交替）；在片元着色器中做位置计算，再在顶点阶段采样使用
- 小练习
  - 5万粒子：CPU 驱动 vs GPU ping-pong 的性能对比（记录帧率、内存占用）
- 里程碑
  - 成功实现 GPU 粒子位置更新管线（两套 shader：simulation + render）

## 第4周：高级效果与交互
- 噪声与流场
  - Perlin/Simplex/Curl Noise；基于噪声的速度场，形成涡流效果
- 纹理与形态迁移
  - 采样图片/文字生成目标点云；从随机分布平滑迁移到目标形状（基于 lerp/curl 引导）
- 交互
  - 鼠标/触摸吸引或排斥；基于距离的力场；响应音频频谱（WebAudio）
- 小练习
  - 百万级粒子：基于 curl noise 的流动 + 鼠标吸引圈
- 里程碑
  - 发布一个“交互式流场粒子”页面，移动端可用，60fps

## 第5周：工程化与优化
- 性能优化
  - frustumCulling、动态分辨率、粒子大小与片元开销控制、合批/实例化
  - 避免频繁 setState；将 uniform 更新集中在 useFrame；降低数据从 JS 到 GPU 的频繁传输
- 调试与工具
  - WebGL Inspector、Spector.js 抓帧；Leva 做参数面板；Stats 面板记录
- 结构与复用
  - 将 shader、FBO 管线、粒子组件模块化；TSDoc 注释公共 API
- 里程碑
  - 整理成可复用的粒子系统组件（支持配置：粒子数、噪声强度、交互模式）

## 项目建议（逐步难度）
- P1 星河：PointsMaterial + sprite 纹理，基础交互
- P2 呼吸云：自定义 ShaderMaterial，时间驱动变化
- P3 GPU 粒子：ping-pong 仿真 + render，5万-50万粒子
- P4 形态迁移：图片/文字点云目标，平滑过渡
- P5 交互流场：百万级粒子，鼠标/音频驱动，性能优化到 60fps

## 关键知识清单
- r3f：Canvas、useFrame、useThree、useMemo、drei 工具、性能指南
- three.js：BufferGeometry/Attributes、Points/InstancedMesh、ShaderMaterial、WebGLRenderer
- WebGL/GLSL：uniform/attribute/varying、顶点/片元、FBO、浮点纹理、ping-pong
- 噪声：Perlin/Simplex/Curl、smoothstep、mix/lerp
- 调试/优化：Spector.js、Stats、避免过度 CPU 更新、减少片元负载

## 资源与参考
- React Three Fiber 文档：https://docs.pmnd.rs/react-three-fiber
- drei 文档：https://docs.pmnd.rs/drei
- three.js 文档：https://threejs.org/docs/
- The Book of Shaders：https://thebookofshaders.com/
- Spector.js（WebGL 调试）：https://spector.babylonjs.com/
- 示例学习：Bruno Simon、Matt DesLauriers、ykob、Shadertoy

## 实践建议
- 每周至少完成一个可视化小成品并记录 FPS 与技术要点
- 所有 shader 文件与公共组件用 TSDoc 注释；复杂算法每行注释依据和原理
- 保持一个参数面板（Leva），方便调整与对比；写周报总结（问题/优化/灵感）