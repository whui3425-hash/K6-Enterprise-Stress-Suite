import { ENV } from "../config/env.js";
import { registerUser } from "../core/user.js";

export const options = {
  vus: ENV.VUS,
  duration: ENV.DURATION,
};

export default function () {
  const ts = Date.now();
  const payload = {
    username: `k6_user_${ts}`,
    password: "Test@123456",
    captcha: ENV.FIXED_CAPTCHA,
  };

  registerUser(payload);
}
