import mongoose, { Schema } from "mongoose";
import { IColumn } from "../types";

const columnSchema = new Schema<IColumn>(
  {
    name: {
      type: String,
      required: [true, "Please provide a column name"],
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure columns are ordered within a project
columnSchema.index({ project: 1, order: 1 });

const Column = mongoose.model<IColumn>("Column", columnSchema);

export default Column;
