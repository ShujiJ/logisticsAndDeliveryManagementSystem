import express from "express";
import "./database/associations";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./modules/auth/routes/authRoutes";
import shipmentRoutes from "./modules/shipment/routes/shipmentRoutes";
import deliveryAgentRoutes from "./modules/deliveryAgent/routes/deliveryAgentRoutes";
import deliverySlotRoutes from "./modules/deliverySlot/routes/deliverySlotRoutes";
import paymentRoutes from "./modules/payment/routes/paymentRoutes"; // pay
import notificationRoutes from "./modules/notifications/routes/notificationRoutes";
import errorMiddleware from "./shared/middlewares/errorMiddleware";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/deliveryAgents", deliveryAgentRoutes);
app.use("/api/v1/deliverySlots", deliverySlotRoutes);
app.use("/api/v1/payments", paymentRoutes); // NEW
app.use("/api/v1/notifications", notificationRoutes);

app.use(errorMiddleware);

export default app;
