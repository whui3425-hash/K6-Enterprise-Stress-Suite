import http from "k6/http";
import { check } from "k6";
import { ENV } from "../config/env.js";

/**
 * 购物车接口占位实现
 */
export function addToCart(payload, token = "") {
  const res = http.post(`${ENV.BASE_URL}/api/cart/add`, JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  check(res, {
    "cart status is 200": (r) => r.status === 200,
  });

  return res;
}
