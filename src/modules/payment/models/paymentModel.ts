import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/dataBase";

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

class Payment extends Model<
  InferAttributes<Payment>,
  InferCreationAttributes<Payment>
> {
  declare id: CreationOptional<number>;
  declare shipmentId: number;
  declare customerId: number;
  declare transactionId: CreationOptional<string | null>;
  declare amount: number;
  declare paymentStatus: CreationOptional<string>;
  declare paidAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare razorpayOrderId: CreationOptional<string | null>;
  declare razorpayPaymentId: CreationOptional<string | null>;
  declare priceBreakdown: CreationOptional<object | null>; // price breakdown
  declare razorpayRefundId: CreationOptional<string | null>;
  declare refundedAt: CreationOptional<Date | null>;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // one payment record per shipment
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      allowNull: false,
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    // NEW: Store Razorpay payment ID received from webhook
    razorpayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    priceBreakdown: {
      type: DataTypes.JSON,
      allowNull: true, // price breakdown
    },
    razorpayRefundId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
  },
);

export default Payment;
