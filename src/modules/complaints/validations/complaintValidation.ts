import { z } from "zod";
import { COMPLAINT_SUBJECT, COMPLAINT_STATUS } from "../constants/complaintConstants";

const complaintSubjectValues = Object.values(COMPLAINT_SUBJECT) as [string, ...string[]];
const complaintStatusValues = Object.values(COMPLAINT_STATUS) as [string, ...string[]];

export const createComplaintSchema = z.object({
  subject: z.string().refine((val) => complaintSubjectValues.includes(val), {
    message: "Invalid complaint subject",
  }),
  description: z.string().min(1, "Description is required"),
});

export const updateComplaintStatusSchema = z.object({
  status: z.string().refine((val) => complaintStatusValues.includes(val), {
    message: "Invalid complaint status",
  }),
});