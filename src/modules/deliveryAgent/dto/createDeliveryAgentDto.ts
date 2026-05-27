export interface CreateDeliveryAgentDto {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  serviceZone?: string;
}
