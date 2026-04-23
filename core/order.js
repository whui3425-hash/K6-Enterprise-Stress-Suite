import http from "k6/http";
import { check } from "k6";
import { BASE_URL, getApiPaths } from "../config/env.js";

/**
 * 加入购物车
 * @param {Record<string, string>} headers 须含 Authorization（网关 JWT）
 * @param {string} skuId SKU
 */
export function addToCart(headers, skuId) {
  const paths = getApiPaths();
  const url = `${BASE_URL}${paths.cartAdd}`;
  const body = paths.cartAddBody(skuId);

  const res = http.post(url, body, {
    headers: headers || {},
    tags: { name: "CartAdd" },
  });

  check(res, {
    "cart add http 2xx": (r) => r.status >= 200 && r.status < 300,
    "cart add business ok": (r) => {
      try {
        const j = r.json();
        return j && (j.code === 20000 || j.code === 200);
      } catch (e) {
        return false;
      }
    },
  });

  return res;
}

/**
 * 尝试从「加购」响应体中解析购物车行 ID（SaaS 或自定义后端若直接返回 ID 时可省去 list 步骤）
 * @param {import("k6/http").RefinedResponse<"text">} res
 * @returns {string|null}
 */
export function tryParseCartLineIdFromAddResponse(res) {
  try {
    const j = res.json();
    if (!j || !j.data) {
      return null;
    }
    const d = j.data;
    if (typeof d === "number" || typeof d === "string") {
      return String(d);
    }
    if (typeof d === "object") {
      if (d.id != null) {
        return String(d.id);
      }
      if (d.cartItemId != null) {
        return String(d.cartItemId);
      }
      if (d.cartId != null) {
        return String(d.cartId);
      }
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

/**
 * 拉取购物车列表（wh-mall 加购接口不返回行 ID，需 list 后取第一条用于下单）
 * @param {Record<string, string>} headers
 * @returns {any[]|null}
 */
export function fetchCartItems(headers) {
  const paths = getApiPaths();
  if (!paths.cartList) {
    return null;
  }
  const url = `${BASE_URL}${paths.cartList}`;
  const res = http.get(url, {
    headers: headers || {},
    tags: { name: "CartList" },
  });

  check(res, {
    "cart list http 2xx": (r) => r.status >= 200 && r.status < 300,
  });

  try {
    const j = res.json();
    if (j && j.data && Array.isArray(j.data)) {
      return j.data;
    }
  } catch (e) {
    /* ignore */
  }
  return [];
}

/**
 * 提交订单（转化漏斗末端）
 * @param {Record<string, string>} headers
 * @param {string|number} cartId wh-mall 下为购物车行 mall_cart.id；SaaS 模式下为业务定义的 cartId
 */
export function submitOrder(headers, cartId) {
  const paths = getApiPaths();
  const url = `${BASE_URL}${paths.orderSubmit}`;
  const body = paths.orderBodyForSubmit(String(cartId));

  const res = http.post(url, body, {
    headers: headers || {},
    tags: { name: "OrderSubmit" },
  });

  check(res, {
    "order submit http 2xx": (r) => r.status >= 200 && r.status < 300,
    "order submit business ok": (r) => {
      try {
        const j = r.json();
        return j && (j.code === 20000 || j.code === 200);
      } catch (e) {
        return false;
      }
    },
  });

  return res;
}
