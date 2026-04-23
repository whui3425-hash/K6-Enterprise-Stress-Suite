import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { BASE_URL, getApiPaths } from "../config/env.js";

/**
 * 【关键交付物】商品查询接口独立延迟指标
 * 在 Grafana / Prometheus 中可与 http_req_duration 解耦，单独出图，支撑「连接池/DB 瓶颈」叙事。
 * 指标名必须与 config/env.js 中 THRESHOLDS 键名一致。
 */
export const goodsQueryDuration = new Trend("goods_query_duration");

/**
 * 查询商品详情（压测火力集中点）
 * @param {Record<string, string>} headers 请求头（可含 Authorization；SKU 查询在网关中为白名单也可不带）
 * @param {string} skuId SKU 标识
 * @returns {import("k6/http").RefinedResponse<"text">}
 */
export function queryGoods(headers, skuId) {
  const paths = getApiPaths();
  const url = `${BASE_URL}${paths.goodsBySku(skuId)}`;

  const res = http.get(url, {
    headers: headers || {},
    tags: { name: "GoodsQuery", endpoint: "goods-detail" },
  });

  // 记录端到端请求耗时（ms），与 k6 http 时间语义一致，便于客户对标 SLI
  if (res.timings && typeof res.timings.duration === "number") {
    goodsQueryDuration.add(res.timings.duration);
  }

  check(res, {
    "goods query http 2xx": (r) => r.status >= 200 && r.status < 300,
    "goods query business ok": (r) => {
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
