import User from "../models/userModel";
import Session from "../models/sessionModel";
// import { InferCreationAttributes } from "sequelize";

class AuthRepository {
  async findUserByEmail(email: string) {
    return await User.findOne({
      where: { email },
    });
  }

  async createUser(data: any) {
    return await User.create(data);
  }
  //stores refresh token session in DB
  async createSession(data: any) {
    return await Session.create(data);
  }
  //Does this refresh token still represent a valid active session
  async findSessionByRefreshToken(refreshToken: string) {
    return await Session.findOne({
      where: { refreshToken },
    });
  }
  //user logout
  async deleteSession(refreshToken: string) {
    return await Session.destroy({
      where: {
        refreshToken,
      },
    });
  }

  //finding user
  async findUserById(id: number) {
    return User.findByPk(id);
  }

  async updateUserById(id: number, data: { name?: string; phoneNumber?: string }) {
    await User.update(data, { where: { id } });
    return User.findByPk(id, {
      attributes: ["id", "name", "email", "role", "phoneNumber"],
    });
  }

  async updatePasswordById(id: number, hashedPassword: string) {
    return User.update({ password: hashedPassword }, { where: { id } });
  }

  async deleteSessionsByUserId(userId: number) {
    return Session.destroy({ where: { userId } });
  }
}

export default new AuthRepository();
