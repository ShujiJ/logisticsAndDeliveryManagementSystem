import { startDelayDetectionCron } from "./delayDetection";

export const startCronJobs = () => {
  startDelayDetectionCron();

  console.log("[Cron] All cron jobs started.");
};
