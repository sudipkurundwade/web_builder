import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { CommunityTemplate } from "../models/template.model.js";
import { User } from "../models/user.model.js";

const cleanTags = (tags) => {
    if (Array.isArray(tags)) {
        return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean).slice(0, 12);
    }

    return String(tags || "")
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12);
};

const copyPages = (pages = []) =>
    pages.map((page) => ({
        id: page.id,
        name: page.name,
        html: page.html,
        css: page.css,
        slug: page.slug,
        title: page.title,
        description: page.description,
        faviconUrl: page.faviconUrl,
        ogImageUrl: page.ogImageUrl,
    }));

const toId = (value) => String(value?._id || value || "");

const getReviewStats = (reviews = [], currentId = "") => {
    const ratings = Array.isArray(reviews) ? reviews.map((review) => Number(review.rating || 0)).filter(Boolean) : [];
    const ratingAverage = ratings.length
        ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
        : 0;
    const userReview = currentId && Array.isArray(reviews)
        ? reviews.find((review) => toId(review.user) === currentId)
        : null;

    return {
        ratingAverage,
        reviewsCount: ratings.length,
        reviewedByMe: Boolean(userReview),
        myRating: userReview?.rating || null,
    };
};

const sortTemplates = (templates, sort = "newest") => {
    const sorted = [...templates];
    switch (sort) {
        case "top-rated":
            return sorted.sort((a, b) => (
                (b.ratingAverage || 0) - (a.ratingAverage || 0) ||
                (b.reviewsCount || 0) - (a.reviewsCount || 0) ||
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        case "most-liked":
            return sorted.sort((a, b) => (
                (b.likesCount || 0) - (a.likesCount || 0) ||
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        case "most-remixed":
            return sorted.sort((a, b) => (
                (b.remixCount || 0) - (a.remixCount || 0) ||
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        case "most-commented":
            return sorted.sort((a, b) => (
                (b.commentsCount || 0) - (a.commentsCount || 0) ||
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        case "newest":
        default:
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
};

const serializeTemplate = async (template, currentUserId) => {
    const doc = template.toObject ? template.toObject() : template;
    const ownerId = toId(doc.owner);
    const currentId = toId(currentUserId);
    const [projectCount, templateCount] = ownerId
        ? await Promise.all([
            Project.countDocuments({ owner: ownerId }),
            CommunityTemplate.countDocuments({ owner: ownerId, isPublic: true }),
        ])
        : [0, 0];

    const followerIds = Array.isArray(doc.owner?.followers) ? doc.owner.followers.map(toId) : [];

    return {
        ...doc,
        likesCount: Array.isArray(doc.likes) ? doc.likes.length : 0,
        likedByMe: currentId ? (doc.likes || []).map(toId).includes(currentId) : false,
        commentsCount: Array.isArray(doc.comments) ? doc.comments.length : 0,
        ...getReviewStats(doc.reviews, currentId),
        ownerStats: {
            projectCount,
            templateCount,
            followersCount: followerIds.length,
            followingCount: Array.isArray(doc.owner?.following) ? doc.owner.following.length : 0,
            followedByMe: currentId ? followerIds.includes(currentId) : false,
        },
    };
};

const shareProjectAsTemplate = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(404, "Invalid project ID format");
    }

    const project = await Project.findOne({
        _id: projectId,
        owner: req.user?._id,
    });

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    const {
        name = project.name,
        description = "",
        category = "Website",
        tags = [],
    } = req.body;

    const pages = copyPages(project.pages || []);
    const firstPage = pages[0];

    const template = await CommunityTemplate.create({
        name: String(name || project.name).trim(),
        description: String(description || "").trim(),
        category: String(category || "Website").trim(),
        tags: cleanTags(tags),
        owner: req.user?._id,
        sourceProject: project._id,
        liveUrl: project.liveUrl || null,
        projectData: project.projectData || {},
        html: project.html || firstPage?.html || "",
        css: project.css || firstPage?.css || "",
        pages,
        remixSettings: project.remixSettings || null,
        previewHtml: firstPage?.html || project.html || "",
        previewCss: firstPage?.css || project.css || "",
        isPublic: true,
    });

    return res.status(201).json(
        new ApiResponse(201, template, "Project shared with community templates")
    );
});

const getCommunityTemplates = asyncHandler(async (req, res) => {
    const { q = "", category = "", following = "", sort = "newest" } = req.query;

    const filter = { isPublic: true };
    if (category && category !== "All") {
        filter.category = String(category);
    }
    if (String(following) === "true") {
        const followedCreatorIds = (req.user?.following || []).map((id) => id);
        filter.owner = { $in: followedCreatorIds };
    }
    if (q) {
        filter.$text = { $search: String(q) };
    }

    const templates = await CommunityTemplate.find(filter)
        .populate("owner", "name email bio avatarUrl followers following")
        .sort({ createdAt: -1 })
        .limit(250);
    const data = await Promise.all(templates.map((template) => serializeTemplate(template, req.user?._id)));

    return res.status(200).json(
        new ApiResponse(200, sortTemplates(data, String(sort)).slice(0, 100), "Community templates fetched successfully")
    );
});

const getTemplateCategories = asyncHandler(async (_, res) => {
    const categories = await CommunityTemplate.distinct("category", { isPublic: true });

    return res.status(200).json(
        new ApiResponse(200, categories.filter(Boolean).sort(), "Template categories fetched successfully")
    );
});

const getCommunityTemplateById = asyncHandler(async (req, res) => {
    const { templateId } = req.params;

    if (!mongoose.isValidObjectId(templateId)) {
        throw new ApiError(404, "Invalid template ID format");
    }

    const template = await CommunityTemplate.findOne({
        _id: templateId,
        isPublic: true,
    })
        .populate("owner", "name email bio avatarUrl followers following")
        .populate("comments.user", "name email avatarUrl")
        .populate("reviews.user", "name email avatarUrl");

    if (!template) {
        throw new ApiError(404, "Template not found");
    }

    return res.status(200).json(
        new ApiResponse(200, await serializeTemplate(template, req.user?._id), "Community template fetched successfully")
    );
});

const useCommunityTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;

    if (!mongoose.isValidObjectId(templateId)) {
        throw new ApiError(404, "Invalid template ID format");
    }

    const template = await CommunityTemplate.findOne({
        _id: templateId,
        isPublic: true,
    });

    if (!template) {
        throw new ApiError(404, "Template not found");
    }

    const pages = copyPages(template.pages || []);

    const project = await Project.create({
        name: `${template.name} Remix`,
        owner: req.user?._id,
        projectData: template.projectData || {},
        html: template.html,
        css: template.css,
        pages,
        remixSettings: template.remixSettings || null,
        githubRepo: null,
        isPublished: false,
        liveUrl: null,
    });

    template.remixCount += 1;
    await template.save();

    return res.status(201).json(
        new ApiResponse(201, project, "Template copied to your projects")
    );
});

const toggleTemplateLike = asyncHandler(async (req, res) => {
    const { templateId } = req.params;

    if (!mongoose.isValidObjectId(templateId)) {
        throw new ApiError(404, "Invalid template ID format");
    }

    const template = await CommunityTemplate.findOne({ _id: templateId, isPublic: true });
    if (!template) {
        throw new ApiError(404, "Template not found");
    }

    const userId = req.user?._id;
    const alreadyLiked = template.likes.some((id) => String(id) === String(userId));
    if (alreadyLiked) {
        template.likes = template.likes.filter((id) => String(id) !== String(userId));
    } else {
        template.likes.push(userId);
    }
    await template.save();

    return res.status(200).json(
        new ApiResponse(200, {
            likedByMe: !alreadyLiked,
            likesCount: template.likes.length,
        }, alreadyLiked ? "Template unliked" : "Template liked")
    );
});

const addTemplateComment = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(templateId)) {
        throw new ApiError(404, "Invalid template ID format");
    }
    if (!text || !String(text).trim()) {
        throw new ApiError(400, "Comment text is required");
    }

    const template = await CommunityTemplate.findOne({ _id: templateId, isPublic: true });
    if (!template) {
        throw new ApiError(404, "Template not found");
    }

    template.comments.push({
        user: req.user?._id,
        text: String(text).trim().slice(0, 500),
    });
    await template.save();
    await template.populate("comments.user", "name email avatarUrl");

    return res.status(201).json(
        new ApiResponse(201, {
            comment: template.comments[template.comments.length - 1],
            commentsCount: template.comments.length,
        }, "Comment added")
    );
});

const addTemplateReview = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const rating = Number(req.body.rating);
    const text = String(req.body.text || "").trim().slice(0, 800);

    if (!mongoose.isValidObjectId(templateId)) {
        throw new ApiError(404, "Invalid template ID format");
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const template = await CommunityTemplate.findOne({ _id: templateId, isPublic: true });
    if (!template) {
        throw new ApiError(404, "Template not found");
    }

    const userId = req.user?._id;
    const existingReview = template.reviews.find((review) => String(review.user) === String(userId));

    if (existingReview) {
        existingReview.rating = rating;
        existingReview.text = text;
        existingReview.updatedAt = new Date();
    } else {
        template.reviews.push({
            user: userId,
            rating,
            text,
        });
    }

    await template.save();
    await template.populate("reviews.user", "name email avatarUrl");

    const stats = getReviewStats(template.reviews, toId(userId));

    return res.status(existingReview ? 200 : 201).json(
        new ApiResponse(existingReview ? 200 : 201, {
            review: template.reviews.find((review) => String(review.user?._id || review.user) === String(userId)),
            ...stats,
            reviews: template.reviews,
        }, existingReview ? "Review updated" : "Review added")
    );
});

const toggleFollowCreator = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid user ID format");
    }
    if (String(userId) === String(currentUserId)) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const creator = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);
    if (!creator || !currentUser) {
        throw new ApiError(404, "User not found");
    }

    const alreadyFollowing = creator.followers.some((id) => String(id) === String(currentUserId));
    if (alreadyFollowing) {
        creator.followers = creator.followers.filter((id) => String(id) !== String(currentUserId));
        currentUser.following = currentUser.following.filter((id) => String(id) !== String(userId));
    } else {
        creator.followers.push(currentUserId);
        currentUser.following.push(userId);
    }

    await Promise.all([creator.save(), currentUser.save()]);

    return res.status(200).json(
        new ApiResponse(200, {
            followedByMe: !alreadyFollowing,
            followersCount: creator.followers.length,
        }, alreadyFollowing ? "Creator unfollowed" : "Creator followed")
    );
});

export {
    shareProjectAsTemplate,
    getCommunityTemplates,
    getTemplateCategories,
    getCommunityTemplateById,
    useCommunityTemplate,
    toggleTemplateLike,
    addTemplateComment,
    addTemplateReview,
    toggleFollowCreator,
};
