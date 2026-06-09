import { Response, Request } from "express";
import Notification from "../models/Notification";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const notifications = await Notification.find({
      recipient: authReq.user?._id,
    })
      .populate("sender", "name email avatar")
      .populate("project", "name key")
      .sort("-createdAt")
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: authReq.user?._id,
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    await Notification.updateMany(
      { recipient: authReq.user?._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};
