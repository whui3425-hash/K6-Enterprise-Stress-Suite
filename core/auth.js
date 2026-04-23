import http from "k6/http";
import { check } from "k6";
import { BASE_URL, FIXED_CAPTCHA, TENANT_ID, getApiPaths } from "../config/env.js";

/**
 * 公共请求头：租户（注册/登录及后续受保护接口均建议显式携带，与浏览器 C 端行为一致）
 */
function baseHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Tenant-Id": TENANT_ID,
  };
}

/**
 * 从 11 位手机号规则生成与 VU/迭代相关的唯一号码（避免注册冲突）
 * @param {string} username 用于派生哈希盐值
 */
function phoneForUser(username) {
  const n = Math.abs(
    (__VU * 7919 + __ITER * 9973 + hashCode(username)) % 100000000
  );
  const tail = String(100000000 + n).slice(-8);
  return `138${tail}`;
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

/**
 * C 端注册
 * @param {string} username
 * @param {string} password
 * @returns {import("k6/http").RefinedResponse<"text">}
 */
export function register(username, password) {
  const paths = getApiPaths();
  const url = `${BASE_URL}${paths.register}`;

  // wh-mall 后端 RegisterRequest 必填 phone；SaaS 模式仅传用户名密码（可按客户后端再扩展）
  const isWhMall = paths.cartList != null;
  const body = isWhMall
    ? JSON.stringify({
        username,
        password,
        captcha: FIXED_CAPTCHA,
        phone: phoneForUser(username),
        name: username,
      })
    : JSON.stringify({ username, password });

  const res = http.post(url, body, {
    headers: baseHeaders(),
    tags: { name: "AuthRegister" },
  });

  check(res, {
    "register http 2xx": (r) => r.status >= 200 && r.status < 300,
    "register business ok": (r) => {
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
 * C 端登录，解析 JWT，返回带 Authorization 的完整请求头（供购物车/订单等受保护接口使用）
 * @param {string} username
 * @param {string} password
 * @returns {Record<string, string>} headers（含 Bearer Token）
 */
export function login(username, password) {
  const paths = getApiPaths();
  const url = `${BASE_URL}${paths.login}`;
  const isWhMall = paths.cartList != null;
  const body = isWhMall
    ? JSON.stringify({
        username,
        password,
        captcha: FIXED_CAPTCHA,
      })
    : JSON.stringify({ username, password });

  const res = http.post(url, body, {
    headers: baseHeaders(),
    tags: { name: "AuthLogin" },
  });

  check(res, {
    "login http 2xx": (r) => r.status >= 200 && r.status < 300,
    "login business ok": (r) => {
      try {
        const j = r.json();
        return j && (j.code === 20000 || j.code === 200) && j.data && j.data.token;
      } catch (e) {
        return false;
      }
    },
  });

  let token = "";
  try {
    token = res.json("data.token") || "";
  } catch (e) {
    token = "";
  }

  return {
    ...baseHeaders(),
    Authorization: token ? `Bearer ${token}` : "",
  };
}
