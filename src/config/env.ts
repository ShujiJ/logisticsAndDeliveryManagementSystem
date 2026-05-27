import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT),
  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: Number(process.env.DB_PORT),
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID as string,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET as string,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET as string,
};

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing in .env");
}
// Validate Razorpay credentials
if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in .env",
  );
}

// ?