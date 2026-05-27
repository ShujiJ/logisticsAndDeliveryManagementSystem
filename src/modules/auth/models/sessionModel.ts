import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../config/dataBase";

interface SessionAttributes {
  id?: number;
  userId: number;
  refreshToken: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionCreationAttributes extends Optional<SessionAttributes, "id"> {}

class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  public id!: number;
  public userId!: number;
  public refreshToken!: string;
  public expiresAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init(
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

    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "sessions",
    timestamps: true,
  },
);
export default Session