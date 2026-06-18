import bcrypt from "bcrypt";
import ApiError from "../../../shared/utils/apiError";
import authRepository from "../repositories/authRepository";
import { UserAttributes } from "../interfaces/userInterface";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenutils";
import { JwtPayload } from "../interfaces/jwtPayloadInterface";
import jwt from "jsonwebtoken";
import { env } from "../../../config/env";

class AuthService {
  async register(data: UserAttributes) {
    const existingUser = await authRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await authRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,

      role: "customer",
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  }
  //login
  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    // console.log(email);
    // console.log(user);
    if (!user) {
      throw new ApiError(401, "Email not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
    });

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      accessToken,
      refreshToken,
    };
  }

  //new access token
  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }
    jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
    const session =
      await authRepository.findSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new ApiError(401, "Invalid session");
    }
    if (new Date() > session.expiresAt) {
      throw new ApiError(401, "Session expired");
    }
    const user = await authRepository.findUserById(session.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async updateProfile(userId: number, data: { name?: string; phoneNumber?: string }) {
    const user = await authRepository.updateUserById(userId, data);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new ApiError(401, "Current password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePasswordById(userId, hashedPassword);
    await authRepository.deleteSessionsByUserId(userId);
    return null;
  }

  //user logout
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }
    await authRepository.deleteSession(refreshToken);
    return null;
  }
}
export default new AuthService();
