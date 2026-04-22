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

  check(res, {
    "login status is 200": (r) => r.status === 200,
  });

  return res;
}
