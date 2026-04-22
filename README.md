# K6-Enterprise-Stress-Suite

用于 `wh-mall` 项目的自动化性能测试套件，基于 `k6`。

## 目录结构

```text
K6-Enterprise-Stress-Suite/
├── config/
│   └── env.js
├── core/
│   ├── user.js
│   └── cart.js
├── scenarios/
│   ├── register.js
│   ├── login.js
│   └── workflow.js
├── reports/
└── README.md
```

## 当前状态

- 已创建项目基础目录与脚本骨架
- 业务接口与断言为占位实现，后续可逐步按需求细化