import { Resend } from "resend";
import { env } from "../../config/env";

const resend = new Resend(env.RESEND_API_KEY);

export const sendOtpEmail = async (
  to: string,
  otp: string,
  trackingId: string,
): Promise<void> => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `Your delivery OTP - ${trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Delivery OTP</h2>
        <p>Your one-time password for receiving shipment <strong>${trackingId}</strong> is:</p>
        <h1 style="letter-spacing: 8px; color: #333;">${otp}</h1>
        <p>This OTP is valid for <strong>30 minutes</strong>. Share it with the delivery agent to confirm receipt.</p>
        <p style="color: #999; font-size: 12px;">Do not share this OTP with anyone other than the delivery agent at your door.</p>
      </div>
    `,
  });
};
