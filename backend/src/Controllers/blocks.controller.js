import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UIComponent, PageBlock } from "../models/block.model.js";

const groupByCategory = (blocks) =>
  blocks.reduce((acc, block) => {
    const key = block.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(block);
    return acc;
  }, {});

const getAllUIComponents = asyncHandler(async (_req, res) => {
  const blocks = await UIComponent.find({ isActive: true }).sort({ category: 1, label: 1 });
  return res
    .status(200)
    .json(new ApiResponse(200, groupByCategory(blocks), "UI components fetched successfully"));
});

const getAllPageBlocks = asyncHandler(async (_req, res) => {
  const blocks = await PageBlock.find({ isActive: true }).sort({ category: 1, label: 1 });
  return res
    .status(200)
    .json(new ApiResponse(200, groupByCategory(blocks), "Page blocks fetched successfully"));
});

const getBlockById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { collection } = req.query;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid block id");
  }

  if (collection !== "ui" && collection !== "page") {
    throw new ApiError(400, "Query param collection must be 'ui' or 'page'");
  }

  const Model = collection === "ui" ? UIComponent : PageBlock;
  const block = await Model.findById(id);

  if (!block || !block.isActive) {
    throw new ApiError(404, "Block not found");
  }

  return res.status(200).json(new ApiResponse(200, block, "Block fetched successfully"));
});

export { getAllUIComponents, getAllPageBlocks, getBlockById };
