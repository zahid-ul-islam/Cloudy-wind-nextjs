import mongoose, { Schema, Document } from "mongoose";

export interface IInvitation extends Document {
  email: string;
  team: mongoose.Types.ObjectId;
  inviter: mongoose.Types.ObjectId;
  role: "admin" | "member";
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending invites for same email/team
invitationSchema.index(
  { email: 1, team: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

const Invitation = mongoose.model<IInvitation>("Invitation", invitationSchema);

export default Invitation;
