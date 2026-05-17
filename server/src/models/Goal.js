import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    quarter: { type: String, enum: ["Q1", "Q2", "Q3", "Q4"], required: true },
    planned: { type: Number, min: 0, max: 100, required: true },
    actual: { type: Number, min: 0, max: 100, required: true },
    comment: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    weightage: { type: Number, min: 10, max: 100, required: true },
    planned: { type: Number, min: 0, max: 100, default: 0 },
    actual: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ["Not Started", "On Track", "Completed"], default: "Not Started" },
    approvalStatus: { type: String, enum: ["Draft", "Submitted", "Approved", "Rejected"], default: "Draft" },
    rejectionReason: { type: String, default: "" },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    checkIns: [checkInSchema]
  },
  { timestamps: true }
);

goalSchema.virtual("weightedProgress").get(function weightedProgress() {
  return Math.round((this.actual * this.weightage) / 100);
});

goalSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Goal", goalSchema);
