/**
 * 全局环境配置（可按客户环境调整）
 */
export const ENV = {
  BASE_URL: "http://192.168.31.101:8088",
  FIXED_CAPTCHA: "123456",
  VUS: 10,
  DURATION: "1m",
  STAGES: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 10 },
    { duration: "30s", target: 0 },
  ],
};
