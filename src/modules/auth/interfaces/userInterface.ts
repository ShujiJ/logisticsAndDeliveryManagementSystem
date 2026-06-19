export interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: string;
  phoneNumber?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  // phoneNumber: string;
}

export interface RegisterDeliveryAgentInput {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}