import mongoose, { Schema } from "mongoose";
import { ITeam } from "../types";

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, "Please provide a team name"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add owner to members array on creation
teamSchema.pre("save", function (next) {
  if (this.isNew) {
    this.members.push({
      user: this.owner,
      role: "owner",
      joinedAt: new Date(),
    });
  }
  next();
});

const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;
