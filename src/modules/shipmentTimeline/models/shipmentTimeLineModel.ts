import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";

import sequelize from "../../../config/dataBase";

class ShipmentTimeline extends Model<
  InferAttributes<ShipmentTimeline>,
  InferCreationAttributes<ShipmentTimeline>
> {
  declare id: CreationOptional<number>;

  declare shipmentId: number;

  declare updatedByUserId: number;

  declare fromStatus: CreationOptional<string> | null;

  declare toStatus: string;

  declare remarks: CreationOptional<string> | null;

  declare createdAt: CreationOptional<Date>;
  // declare updatedAt: CreationOptional<Date>;
}

ShipmentTimeline.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    shipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    updatedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    fromStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    toStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
    },
    // updatedAt: {
    //   type: DataTypes.DATE,
    // },
  },
  {
    sequelize,

    modelName: "ShipmentTimeline",

    tableName: "shipment_timelines",

    timestamps: true,

    updatedAt: false,
  },
);

export default ShipmentTimeline;
