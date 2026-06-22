import express from "express";
import "./database/associations";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./modules/auth/routes/authRoutes";
import shipmentRoutes from "./modules/shipment/routes/shipmentRoutes";
import deliveryAgentRoutes from "./modules/deliveryAgent/routes/deliveryAgentRoutes";
import deliverySlotRoutes from "./modules/deliverySlot/routes/deliverySlotRoutes";
import paymentRoutes from "./modules/payment/routes/paymentRoutes";
import notificationRoutes from "./modules/notifications/routes/notificationRoutes";
import dashboardRoutes from "./modules/dashboard/routes/dashboardRoutes";
import errorMiddleware from "./shared/middlewares/errorMiddleware";
import complaintRoutes from "./modules/complaints/routes/complaintRoutes";
import chatRoutes from "./modules/chat/routes/chatRoutes";
import pricingRoutes from "./modules/pricing/routes/pricingRoutes";


const app = express();

app.use(express.json());
const allowedOrigins = [
  "https://ldms-lac.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://192.168.0.21:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/deliveryAgents", deliveryAgentRoutes);
app.use("/api/v1/deliverySlots", deliverySlotRoutes);
app.use("/api/v1/payments", paymentRoutes); 
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/pricing", pricingRoutes);

app.use(errorMiddleware);


export default app;
