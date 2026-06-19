import { Resend } from "resend";
import { env } from "../../config/env";

const resend = new Resend(env.RESEND_API_KEY);

export const sendOtpEmail = async (to: string, trackingId: string, otp: string) => {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Delivery OTP for shipment ${trackingId}`,
    html: `<p>Your delivery OTP for shipment <strong>${trackingId}</strong> is <strong>${otp}</strong>. Valid for 30 minutes.</p>`,
  });
};
