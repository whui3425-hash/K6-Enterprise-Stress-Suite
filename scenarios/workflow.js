import { sleep } from "k6";
import { STAGES, THRESHOLDS, TARGET_SKU_ID, GOODS_QUERY_LOOPS, getApiPaths } from "../config/env.js";
import { register, login } from "../core/auth.js";
import { queryGoods } from "../core/goods.js";
import {
  addToCart,
  fetchCartItems,
  submitOrder,
  tryParseCartLineIdFromAddResponse,
} from "../core/order.js";

/**
 * k6 执行选项：阶段加压 + 性能红线
 * 说明：thresholds 中 goods_query_duration 与 core/goods.js 内 Trend 名称一致
 */
export const options = {
  stages: STAGES,
  thresholds: THRESHOLDS,
};

/**
 * 生成单次迭代内全局唯一的用户名（VU + 迭代序号 + 时间戳 + 随机数，避免注册冲突）
 */
function buildUsername() {
  return `perf_u${__VU}_i${__ITER}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/**
 * 主场景：注册 → 登录 → 思考 → 高频查商品 → 加购 → 下单
 */
export default function () {
  const username = buildUsername();
  const password = "K6Perf@2026";

  register(username, password);
  const authHeaders = login(username, password);

  // 模拟用户思考时间 1～2 秒
  sleep(1 + Math.random());

  const skuId = TARGET_SKU_ID;
  for (let i = 0; i < GOODS_QUERY_LOOPS; i++) {
    queryGoods(authHeaders, skuId);
  }

  const addRes = addToCart(authHeaders, skuId);

  const paths = getApiPaths();
  let cartLineId = tryParseCartLineIdFromAddResponse(addRes);

  if (cartLineId == null && paths.cartList) {
    const items = fetchCartItems(authHeaders);
    if (items && items.length > 0 && items[0].id != null) {
      cartLineId = String(items[0].id);
    }
  }

  if (cartLineId != null) {
    submitOrder(authHeaders, cartLineId);
  }
}
