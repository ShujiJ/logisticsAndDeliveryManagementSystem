import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";

import sequelize from "../../../config/dataBase";

class DeliveryAgent extends Model<
  InferAttributes<DeliveryAgent>,
  InferCreationAttributes<DeliveryAgent>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare phoneNumber: string;
  declare vehicleType: CreationOptional<string | null>;
  declare vehicleNumber: CreationOptional<string | null>;
  declare licenseNumber: CreationOptional<string | null>;
  declare serviceZone: CreationOptional<string | null>;
  declare availabilityStatus: CreationOptional<string>;
  declare shipmentCount: CreationOptional<number>;
  declare createdByAdminId: number;
  declare isActive: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DeliveryAgent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serviceZone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    availabilityStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "AVAILABLE",
    },
    shipmentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: "DeliveryAgent",
    tableName: "delivery_agents",
    timestamps: true,
  },
);

export default DeliveryAgent;
