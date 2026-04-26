import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    category: { type: String, required: true },
    tags: [String],
    html: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const UIComponent = mongoose.model("UIComponent", blockSchema, "ui_components");
export const PageBlock = mongoose.model("PageBlock", blockSchema, "page_blocks");
