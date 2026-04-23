import http from "k6/http";
import { check } from "k6";
import { ENV } from "../config/env.js";

/**
 * 注册接口占位实现
 */
export function registerUser(payload) {
  const res = http.post(`${ENV.BASE_URL}/api/user/register`, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "register status is 200": (r) => r.status === 200,
  });

  return res;
}

/**
 * 登录接口占位实现
 */
export function loginUser(payload) {
  const res = http.post(`${ENV.BASE_URL}/api/user/login`, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });

  let body = null;
  try {
    body = res.json();
  } catch (error) {
    body = null;
  }

  check(res, {
    "login http status is 200": (r) => r.status === 200,
    "login biz code is 20000": () => body && body.code === 20000,
  });

  if (res.status !== 200 || !body || body.code !== 20000) {
    console.error(
      `login failed: http_status=${res.status}, biz_code=${body ? body.code : "N/A"}, body=${String(res.body).slice(0, 300)}`
    );
  }

  return res;
}
