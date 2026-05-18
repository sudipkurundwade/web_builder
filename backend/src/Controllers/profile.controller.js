import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { CommunityTemplate } from "../models/template.model.js";

const safeUrl = (value = "") => {
    const url = String(value || "").trim();
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
};

const publicUserFields = "name email bio avatarUrl location socialLinks followers following featuredTemplates createdAt";

const serializeProfileTemplate = (template) => ({
    ...template.toObject(),
    likesCount: template.likes?.length || 0,
    commentsCount: template.comments?.length || 0,
});

const buildProfile = async (user, currentUserId) => {
    const userId = user._id;
    const currentId = String(currentUserId || "");
    const followerIds = (user.followers || []).map((id) => String(id));
    const featuredTemplateIds = (user.featuredTemplates || []).map((id) => String(id));

    const [projectCount, templateCount, templates, featuredTemplates] = await Promise.all([
        Project.countDocuments({ owner: userId }),
        CommunityTemplate.countDocuments({ owner: userId, isPublic: true }),
        CommunityTemplate.find({ owner: userId, isPublic: true })
            .select("name description category tags liveUrl previewHtml previewCss html css pages remixCount likes comments createdAt")
            .sort({ createdAt: -1 })
            .limit(12),
        CommunityTemplate.find({ _id: { $in: featuredTemplateIds }, owner: userId, isPublic: true })
            .select("name description category tags liveUrl previewHtml previewCss html css pages remixCount likes comments createdAt"),
    ]);
    const featuredById = new Map(featuredTemplates.map((template) => [String(template._id), template]));

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        location: user.location || "",
        socialLinks: user.socialLinks || { github: "", linkedin: "", website: "" },
        createdAt: user.createdAt,
        stats: {
            projectCount,
            templateCount,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0,
            followedByMe: currentId ? followerIds.includes(currentId) : false,
        },
        featuredTemplateIds,
        featuredTemplates: featuredTemplateIds
            .map((id) => featuredById.get(id))
            .filter(Boolean)
            .map(serializeProfileTemplate),
        templates: templates.map(serializeProfileTemplate),
    };
};

const getPublicProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid user ID format");
    }

    const user = await User.findById(userId).select(publicUserFields);
    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, await buildProfile(user, req.user?._id), "Profile fetched successfully")
    );
});

const updateMyProfile = asyncHandler(async (req, res) => {
    const { name, bio, avatarUrl, location, socialLinks = {} } = req.body;

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (bio !== undefined) update.bio = String(bio).trim().slice(0, 500);
    if (avatarUrl !== undefined) update.avatarUrl = safeUrl(avatarUrl);
    if (location !== undefined) update.location = String(location).trim().slice(0, 120);
    if (socialLinks !== undefined) {
        update.socialLinks = {
            github: safeUrl(socialLinks.github),
            linkedin: safeUrl(socialLinks.linkedin),
            website: safeUrl(socialLinks.website),
        };
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: update },
        { new: true }
    ).select(publicUserFields);

    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, await buildProfile(user, req.user?._id), "Profile updated successfully")
    );
});

const updateFeaturedTemplates = asyncHandler(async (req, res) => {
    const templateIds = Array.isArray(req.body.templateIds) ? req.body.templateIds : [];
    const uniqueIds = Array.from(new Set(templateIds.map((id) => String(id)).filter(Boolean))).slice(0, 3);

    if (uniqueIds.some((id) => !mongoose.isValidObjectId(id))) {
        throw new ApiError(400, "Invalid template ID format");
    }

    const ownedTemplates = await CommunityTemplate.find({
        _id: { $in: uniqueIds },
        owner: req.user?._id,
        isPublic: true,
    }).select("_id");
    const ownedIds = new Set(ownedTemplates.map((template) => String(template._id)));

    if (uniqueIds.some((id) => !ownedIds.has(id))) {
        throw new ApiError(400, "Featured templates must be your public templates");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { featuredTemplates: uniqueIds } },
        { new: true }
    ).select(publicUserFields);

    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, await buildProfile(user, req.user?._id), "Featured templates updated successfully")
    );
});

const toggleFollowProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid user ID format");
    }
    if (String(userId) === String(currentUserId)) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const profileUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);
    if (!profileUser || !currentUser) {
        throw new ApiError(404, "User not found");
    }

    const alreadyFollowing = profileUser.followers.some((id) => String(id) === String(currentUserId));
    if (alreadyFollowing) {
        profileUser.followers = profileUser.followers.filter((id) => String(id) !== String(currentUserId));
        currentUser.following = currentUser.following.filter((id) => String(id) !== String(userId));
    } else {
        profileUser.followers.push(currentUserId);
        currentUser.following.push(userId);
    }

    await Promise.all([profileUser.save(), currentUser.save()]);

    return res.status(200).json(
        new ApiResponse(200, {
            followedByMe: !alreadyFollowing,
            followersCount: profileUser.followers.length,
        }, alreadyFollowing ? "User unfollowed" : "User followed")
    );
});

export { getPublicProfile, updateMyProfile, updateFeaturedTemplates, toggleFollowProfile };
