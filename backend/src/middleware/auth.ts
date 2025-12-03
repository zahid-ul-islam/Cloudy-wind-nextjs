import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
  team?: any;
  memberRole?: "owner" | "admin" | "member";
}

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      // Get user from token
      req.user = (await User.findById(decoded.id).select("-password")) as IUser;

      if (!req.user) {
        res.status(401).json({ message: "Not authorized, user not found" });
        return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }
};

// Check team membership
export const checkTeamMembership = (
  minimumRole: "owner" | "admin" | "member" = "member"
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const Team = (await import("../models/Team")).default;
      const team = await Team.findById(teamId);

      if (!team) {
        res.status(404).json({ message: "Team not found" });
        return;
      }

      const member = team.members.find(
        (m) => m.user.toString() === userId.toString()
      );

      if (!member) {
        res.status(403).json({ message: "Not a team member" });
        return;
      }

      // Role hierarchy: owner > admin > member
      const roleHierarchy: Record<string, number> = {
        owner: 3,
        admin: 2,
        member: 1,
      };
      if (roleHierarchy[member.role] < roleHierarchy[minimumRole]) {
        res.status(403).json({ message: "Insufficient permissions" });
        return;
      }

      req.team = team;
      req.memberRole = member.role;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
};
