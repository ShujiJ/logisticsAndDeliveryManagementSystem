export interface CreateComplaintDto {
  shipmentId: number;
  customerId: number;
  subject: string;
  description: string;
}