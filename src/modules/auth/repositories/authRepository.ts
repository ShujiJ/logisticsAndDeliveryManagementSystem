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
}

export default new AuthRepository();
