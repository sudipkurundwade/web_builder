import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TemplateCollection } from "../models/collection.model.js";
import { CommunityTemplate } from "../models/template.model.js";

const templateFields = "name description category tags owner liveUrl previewHtml previewCss html css pages remixCount likes comments reviews createdAt updatedAt";

const serializeTemplate = (template) => {
    const doc = template.toObject ? template.toObject() : template;
    const reviews = Array.isArray(doc.reviews) ? doc.reviews : [];
    return {
        ...doc,
        likesCount: Array.isArray(doc.likes) ? doc.likes.length : 0,
        commentsCount: Array.isArray(doc.comments) ? doc.comments.length : 0,
        reviewsCount: reviews.length,
        ratingAverage: reviews.length
            ? Number((reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1))
            : 0,
    };
};

const serializeCollection = (collection) => {
    const doc = collection.toObject ? collection.toObject() : collection;
    return {
        ...doc,
        templates: (doc.templates || []).map(serializeTemplate),
        templateCount: doc.templates?.length || 0,
    };
};

const getCollections = asyncHandler(async (req, res) => {
    const collections = await TemplateCollection.find({ owner: req.user?._id })
        .populate({
            path: "templates",
            select: templateFields,
            match: { isPublic: true },
            populate: { path: "owner", select: "name email bio avatarUrl followers following" },
        })
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, collections.map(serializeCollection), "Collections fetched successfully")
    );
});

const createCollection = asyncHandler(async (req, res) => {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim().slice(0, 240);

    if (!name) {
        throw new ApiError(400, "Collection name is required");
    }

    const collection = await TemplateCollection.create({
        name,
        description,
        owner: req.user?._id,
    });

    return res.status(201).json(
        new ApiResponse(201, serializeCollection(collection), "Collection created successfully")
    );
});

const addTemplateToCollection = asyncHandler(async (req, res) => {
    const { collectionId, templateId } = req.params;

    if (!mongoose.isValidObjectId(collectionId) || !mongoose.isValidObjectId(templateId)) {
        throw new ApiError(404, "Invalid collection or template ID format");
    }

    const [collection, template] = await Promise.all([
        TemplateCollection.findOne({ _id: collectionId, owner: req.user?._id }),
        CommunityTemplate.findOne({ _id: templateId, isPublic: true }),
    ]);

    if (!collection) {
        throw new ApiError(404, "Collection not found");
    }
    if (!template) {
        throw new ApiError(404, "Template not found");
    }

    const exists = collection.templates.some((id) => String(id) === String(templateId));
    if (!exists) {
        collection.templates.push(templateId);
        await collection.save();
    }

    await collection.populate({
        path: "templates",
        select: templateFields,
        match: { isPublic: true },
        populate: { path: "owner", select: "name email bio avatarUrl followers following" },
    });

    return res.status(200).json(
        new ApiResponse(200, serializeCollection(collection), "Template saved to collection")
    );
});

const removeTemplateFromCollection = asyncHandler(async (req, res) => {
    const { collectionId, templateId } = req.params;

    if (!mongoose.isValidObjectId(collectionId) || !mongoose.isValidObjectId(templateId)) {
        throw new ApiError(404, "Invalid collection or template ID format");
    }

    const collection = await TemplateCollection.findOne({ _id: collectionId, owner: req.user?._id });
    if (!collection) {
        throw new ApiError(404, "Collection not found");
    }

    collection.templates = collection.templates.filter((id) => String(id) !== String(templateId));
    await collection.save();
    await collection.populate({
        path: "templates",
        select: templateFields,
        match: { isPublic: true },
        populate: { path: "owner", select: "name email bio avatarUrl followers following" },
    });

    return res.status(200).json(
        new ApiResponse(200, serializeCollection(collection), "Template removed from collection")
    );
});

export {
    getCollections,
    createCollection,
    addTemplateToCollection,
    removeTemplateFromCollection,
};
