import { ENV } from "../config/env.js";
import { registerUser, loginUser } from "../core/user.js";
import { addToCart } from "../core/cart.js";

export const options = {
  stages: ENV.STAGES,
};

export default function () {
  const ts = Date.now();
  const username = `k6_flow_${ts}`;
  const password = "Test@123456";

  registerUser({
    username,
    password,
    captcha: ENV.FIXED_CAPTCHA,
  });

  const loginRes = loginUser({
    username,
    password,
    captcha: ENV.FIXED_CAPTCHA,
  });

  let token = "";
  try {
    token = loginRes.json("data.token") || "";
  } catch (e) {
    token = "";
  }

  addToCart(
    {
      skuId: 10001,
      quantity: 1,
    },
    token
  );
}
