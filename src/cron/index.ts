import { startDelayDetectionCron } from "./delayDetection";
import { startUnassignedShipmentCron } from "./unassignedShipmentCron";

export const startCronJobs = () => {
  startDelayDetectionCron();
  startUnassignedShipmentCron();

  console.log("[Cron] All cron jobs started.");
};
