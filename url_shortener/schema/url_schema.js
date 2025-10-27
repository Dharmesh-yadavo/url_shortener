import mongoose from "mongoose";

const urlSchema = {
  id: { type: Number },
  url: { type: String },
  shortCode: { type: String },
};

export const urls = mongoose.model("url", urlSchema);
