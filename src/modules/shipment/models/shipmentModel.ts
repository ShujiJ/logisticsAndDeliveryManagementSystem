import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/dataBase";
import {
  PAYMENT_STATUS,
  SHIPMENT_STATUS,
  SHIPMENT_TYPE,
} from "../constants/shipmentConstants";

class Shipment extends Model<
  InferAttributes<Shipment>,
  InferCreationAttributes<Shipment>
> {
  declare id: CreationOptional<number>;

  declare customerId: number;
  declare deliveryAgentId: CreationOptional<number | null>;
  declare trackingId: string;

  // Package details
  declare itemName: string;
  declare quantity: number;
  declare packageWeight: number;
  declare description: CreationOptional<string | null>;

  // Sender details
  declare senderName: string;
  declare senderPhone: string;
  declare senderEmail: CreationOptional<string | null>;

  // Pickup address details
  declare pickupAddress: string;
  declare pickupCity: string;
  declare pickupPincode: string;

  // Receiver details
  declare receiverName: string;
  declare receiverPhone: string;
  declare receiverEmail: CreationOptional<string | null>;

  // Delivery details
  declare deliveryAddress: string;
  declare deliveryCity: string;
  declare deliveryPincode: string;

  // Delivery preferences
  declare shipmentPriority: CreationOptional<string>;
  declare isFragile: CreationOptional<boolean>;

  declare preferredDeliveryFrom: CreationOptional<Date | null>;
  declare preferredDeliveryTo: CreationOptional<Date | null>;

  declare amount: number;
  // updated recently
  declare deliverySlotId: number | null;
  declare deliveryRemarks: string | null;

  declare paymentStatus: CreationOptional<string>;
  declare shipmentStatus: CreationOptional<string>;

  declare deliveryOtp: CreationOptional<string | null>;
  declare otpExpiresAt: CreationOptional<Date | null>;
  declare otpUsed: CreationOptional<boolean>;
  declare deliveredAt: CreationOptional<Date | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Shipment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliveryAgentId: {
      type: DataTypes.INTEGER,

      allowNull: true,
    },
    trackingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Package details
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    packageWeight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    senderPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    senderEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pickupAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pickupCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pickupPincode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    receiverName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    receiverPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    receiverEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    deliveryCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    deliveryPincode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    shipmentPriority: {
      type: DataTypes.ENUM(...Object.values(SHIPMENT_TYPE)),
      defaultValue: SHIPMENT_TYPE.STANDARD,
    },

    isFragile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    preferredDeliveryFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    preferredDeliveryTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },

    shipmentStatus: {
      type: DataTypes.ENUM(...Object.values(SHIPMENT_STATUS)),
      defaultValue: SHIPMENT_STATUS.PENDING,
    },
    deliverySlotId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    deliveryRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deliveryOtp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    otpUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    deliveredAt: {
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
    modelName: "Shipment",
    tableName: "shipments",
    timestamps: true,
  },
);

export default Shipment;
