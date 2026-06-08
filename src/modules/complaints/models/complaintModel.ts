import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/dataBase";
import {
  COMPLAINT_SUBJECT,
  COMPLAINT_STATUS,
} from "../constants/complaintConstants";

class Complaint extends Model<
  InferAttributes<Complaint>,
  InferCreationAttributes<Complaint>
> {
  declare id: CreationOptional<number>;
  declare shipmentId: number;
  declare customerId: number;
  declare subject: string;
  declare description: string;
  declare status: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Complaint.init(
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
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: {
      type: DataTypes.ENUM(...Object.values(COMPLAINT_SUBJECT)),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(COMPLAINT_STATUS)),
      allowNull: false,
      defaultValue: COMPLAINT_STATUS.OPEN,
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
    modelName: "Complaint",
    tableName: "complaints",
    timestamps: true,
  },
);

export default Complaint;
