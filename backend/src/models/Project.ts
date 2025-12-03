import mongoose, { Schema } from "mongoose";
import { IProject } from "../types";

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Please provide a project name"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    key: {
      type: String,
      required: [true, "Please provide a project key"],
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2,5}$/, "Project key must be 2-5 uppercase letters"],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique project key per team
projectSchema.index({ team: 1, key: 1 }, { unique: true });

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;
