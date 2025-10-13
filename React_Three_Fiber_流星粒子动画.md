# React Three Fiber 流星粒子动画

## Core Features

- 拖尾朝右上约25°方向扩散

- 透明度由1衰减至0

- 拖尾长度动态变化

- 抛物线轨迹（重力）

- 着色器颜色渐变（亮白→橙红）

- 参数面板新增“打印参数”按钮

## Tech Stack

{
  "Web": {
    "arch": "react",
    "component": "shadcn"
  },
  "iOS": null,
  "Android": null
}

## Design

在面板顶部加入打印按钮，调用 console.log 输出 params，用于调试与记录。

## Plan

Note: 

- [ ] is holding
- [/] is doing
- [X] is done

---

[X] 环境与依赖检查

[X] 组件API与参数面板设计

[X] 粒子缓冲与发射器实现

[X] GLSL着色器编写并增强

[/] 集成并调试（性能/观感）

[/] 可调参数联动与默认值调优

[/] 文档与TSDoc补充
