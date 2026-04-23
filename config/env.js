/**
 * 全局环境配置（可按客户环境调整）
 */
export const ENV = {
  // 被压测系统的基础地址（协议 + 域名）
  // 例如: http://shop1.whmall.test 或 http://127.0.0.1:8080
  BASE_URL: "http://localhost:8088",

  // 固定验证码：当测试环境验证码被写死时使用
  // 如果后续改为动态验证码，这里可以不再使用
  FIXED_CAPTCHA: "PERF-TEST",

  // 虚拟用户数（Virtual Users）
  // 表示同时在线执行脚本的用户数量
  VUS: 10,

  // 固定压测时长（配合 VUS 使用）
  // 例如 "1m"=1分钟，"30s"=30秒
  DURATION: "1m",

  // 分阶段加压策略（ramp-up / hold / ramp-down）
  // 每一段格式：{ duration: "持续时间", target: "目标并发数" }
  // 下面示例含义：
  // 1) 30秒内升到10并发
  // 2) 再保持10并发30秒
  // 3) 最后30秒降到0并发并结束
  STAGES: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 10 },
    { duration: "30s", target: 0 },
  ],
};
