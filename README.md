# K6-Enterprise-Stress-Suite

面向 **wh-mall**（Spring Cloud 微服务商城）的全链路 **k6** 压测资产，用于在 Grafana 等监控中量化 **商品查询** 延迟与错误率，并为 **MySQL 连接池 / 缓存（Redis）** 类优化提供数据依据。

## 目录结构

```text
K6-Enterprise-Stress-Suite/
├── config/
│   └── env.js              # 基址、阶段、阈值、SKU、API 模式等
├── core/
│   ├── auth.js             # 注册、登录、鉴权 Header
│   ├── goods.js            # 商品查询 + Trend 指标 goods_query_duration
│   └── order.js            # 加购、购物车列表、下单
├── scenarios/
│   └── workflow.js         # 默认主场景：注册 → 登录 → 思考 → 高频查商品 → 加购 → 下单
├── reports/
└── README.md
```

## 快速运行

在项目根目录执行（需已安装 [k6](https://k6.io/)）：

```bash
k6 run scenarios/workflow.js
```

常用环境变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `BASE_URL` | 网关根地址 | `http://localhost:8088` |
| `TARGET_SKU_ID` | 压测 SKU | `SKU001` |
| `GOODS_QUERY_LOOPS` | 每轮迭代内商品查询次数（放大 DB 压力） | `20` |
| `TENANT_ID` | 租户（与 shop 域名一致） | `1001` |

示例：

```bash
k6 run -e BASE_URL=http://shop1.whmall.test scenarios/workflow.js
```

## 性能红线（Thresholds）

在 `config/env.js` 中配置：

- `http_req_failed`：整体失败率小于 1%
- `goods_query_duration`：商品查询 Trend 的 **P95 小于 500ms**（未做缓存前通常易失败，用于在报告中「显式」标红瓶颈）

## Grafana / Prometheus

脚本对商品详情请求写入自定义 Trend **`goods_query_duration`**（见 `core/goods.js`）。将 k6 结果导出到 Prometheus / InfluxDB 后，可在 Grafana 中单独为该指标建 Panel，与全量 `http_req_duration` 区分展示。

## 接口路径说明

脚本中的路径与 **wh-mall 网关** 及 **Controller** 一致（例如 `POST /api/user/register`、`GET /api/sku/{id}`、`POST /api/order/submit`）。若你方在其他环境使用了不同网关前缀，只需在 `config/env.js` 的 `getApiPaths()` 中调整返回值即可。
