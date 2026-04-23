/**
 * 全局环境与压测策略配置（企业交付 / 客户可调）
 *
 * 网关基址：优先读取 k6 环境变量 __ENV.BASE_URL，便于 CI/CD 与多环境切换。
 * 示例：k6 run -e BASE_URL=http://shop1.whmall.test scenarios/workflow.js
 */

/** @type {string} 压测目标网关根地址（不含末尾斜杠） */
export const BASE_URL = (__ENV.BASE_URL || "http://localhost:8088").replace(/\/$/, "");

/** 固定验证码（与 wh-mall 用户服务 STRESS_TEST_CAPTCHA 对齐，便于无人值守压测） */
export const FIXED_CAPTCHA = __ENV.FIXED_CAPTCHA || "PERF-TEST";

/** 租户 ID（与 C 端 shop1 域名解析一致，网关/用户注册强依赖） */
export const TENANT_ID = __ENV.TENANT_ID || "1001";

/**
 * 压测重点 SKU（须存在于目标环境库中）
 * wh-mall 初始化数据常见为 SKU001（租户 1001）
 */
export const TARGET_SKU_ID = __ENV.TARGET_SKU_ID || "SKU001";

/**
 * 单迭代内「商品详情查询」重复次数 —— 用于放大 DB / 连接池压力，便于 Grafana 上拉出明显曲线
 * 可按机器与目标 SLA 调整，例如 5～30
 */
export const GOODS_QUERY_LOOPS = Number(__ENV.GOODS_QUERY_LOOPS || 20);

/**
 * 压测阶段（Stages）
 * 要求：1 分钟内爬升到 300 并发 → 保持 2 分钟 → 30 秒降到 0
 */
export const STAGES = [
  { duration: "1m", target: 300 },
  { duration: "2m", target: 300 },
  { duration: "30s", target: 0 },
];

/**
 * 性能红线（Thresholds）
 * - http_req_failed：整体失败率 < 1%
 * - goods_query_duration：商品查询自定义 Trend 的 P95 < 500ms（未加缓存前通常会被打穿，用于「证据化」瓶颈）
 */
export const THRESHOLDS = {
  http_req_failed: ["rate<0.01"],
  goods_query_duration: ["p(95)<500"],
};

/**
 * 网关相对路径（与本地 wh-mall 一致，勿写 /mall-user 等虚构前缀）
 *
 * 依据：
 * - 网关：`mall-api-gateway` → `bootstrap.yml`（Path=/api/user/**、/api/sku/**、/api/cart/**、/api/order/**）
 * - 用户：`UserInfoController` → `@RequestMapping("/api/user")` + `/register`、`/login`
 * - SKU：`SkuController` → `@RequestMapping("/api/sku")` + `GET /{id}`（非 /mall-goods/api/v1/goods/...）
 * - 订单：`OrderController` → `POST /api/order/submit` + 请求体 `cartItemIds`（非 /order/create）
 *
 * @returns {{
 *   register: string,
 *   login: string,
 *   goodsBySku: (skuId: string) => string,
 *   cartAdd: string,
 *   cartList: string | null,
 *   orderSubmit: string,
 *   orderBodyForSubmit: (cartId: string) => string,
 *   cartAddBody: (skuId: string) => string,
 * }}
 */
export function getApiPaths() {
  return {
    register: "/api/user/register",
    login: "/api/user/login",
    goodsBySku: (skuId) => `/api/sku/${encodeURIComponent(skuId)}`,
    cartAdd: "/api/cart/add",
    cartList: "/api/cart/list",
    orderSubmit: "/api/order/submit",
    orderBodyForSubmit: (cartId) => JSON.stringify({ cartItemIds: [String(cartId)] }),
    cartAddBody: (skuId) => JSON.stringify({ skuId: String(skuId), num: 1 }),
  };
}
