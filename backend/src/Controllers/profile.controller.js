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

const publicUserFields = "name email bio avatarUrl location socialLinks followers following createdAt";

const buildProfile = async (user, currentUserId) => {
    const userId = user._id;
    const currentId = String(currentUserId || "");
    const followerIds = (user.followers || []).map((id) => String(id));

    const [projectCount, templateCount, templates] = await Promise.all([
        Project.countDocuments({ owner: userId }),
        CommunityTemplate.countDocuments({ owner: userId, isPublic: true }),
        CommunityTemplate.find({ owner: userId, isPublic: true })
            .select("name description category tags liveUrl previewHtml previewCss html css pages remixCount likes comments createdAt")
            .sort({ createdAt: -1 })
            .limit(12),
    ]);

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
        templates: templates.map((template) => ({
            ...template.toObject(),
            likesCount: template.likes?.length || 0,
            commentsCount: template.comments?.length || 0,
        })),
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

export { getPublicProfile, updateMyProfile, toggleFollowProfile };
