import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";

import sequelize from "../../../config/dataBase";

export const SLOT_STATUS = {
  AVAILABLE: "AVAILABLE",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  MISSED: "MISSED",
} as const;

class DeliverySlot extends Model<
  InferAttributes<DeliverySlot>,
  InferCreationAttributes<DeliverySlot>
> {
  declare id: CreationOptional<number>;

  declare deliveryAgentId: number;

  declare date: string;

  declare startTime: string;

  declare endTime: string;

  declare slotStatus: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

DeliverySlot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    deliveryAgentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    slotStatus: {
      type: DataTypes.ENUM(...Object.values(SLOT_STATUS)),

      allowNull: false,

      defaultValue: SLOT_STATUS.AVAILABLE,
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

    modelName: "DeliverySlot",

    tableName: "delivery_slots",

    timestamps: true,
  },
);

export default DeliverySlot;
