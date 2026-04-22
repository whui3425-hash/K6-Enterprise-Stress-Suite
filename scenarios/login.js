import { ENV } from "../config/env.js";
import { loginUser } from "../core/user.js";

export const options = {
  stages: ENV.STAGES,
};

export default function () {
  const payload = {
    username: "demo_user",
    password: "Test@123456",
    captcha: ENV.FIXED_CAPTCHA,
  };

  loginUser(payload);
}
