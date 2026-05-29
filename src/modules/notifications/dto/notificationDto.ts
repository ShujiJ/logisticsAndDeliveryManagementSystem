export interface CreateNotificationDto {
  userId: number;
  shipmentId?: number | null;
  title: string;
  message: string;
  type: string;
}
