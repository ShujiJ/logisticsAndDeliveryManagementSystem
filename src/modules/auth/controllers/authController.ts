import { Request, Response } from "express";
import authService from "../services/authService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return responseHandler(res, 201, "User registered successfully", result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return responseHandler(res, 200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  //new access token
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.refreshAccessToken(refreshToken);
    return responseHandler(res, 200, "Access token refreshed", result);
  });

  //userlogout
  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    await authService.logout(refreshToken);
    res.clearCookie("refreshToken");
    return responseHandler(res, 200, "Logout successful");
  });
}

export default new AuthController();
