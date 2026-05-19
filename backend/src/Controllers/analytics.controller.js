import { AnalyticsEvent } from "../models/analyticsEvent.model.js";
import { CommunityTemplate } from "../models/template.model.js";
import { Project } from "../models/project.model.js";
import { TemplateCollection } from "../models/collection.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getDateRange = (days = 30) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - Number(days || 30));
    return { start, end };
};

const trackAnalyticsEvent = asyncHandler(async (req, res) => {
    const {
        type,
        project,
        template,
        path = "",
        device = "unknown",
        metadata = {},
    } = req.body;

    const event = await AnalyticsEvent.create({
        type,
        project: project || null,
        template: template || null,
        path,
        device,
        metadata,
        user: req.user?._id || null,
    });

    return res.status(201).json(
        new ApiResponse(201, { id: event._id }, "Analytics event tracked"),
    );
});

const getAnalyticsSummary = asyncHandler(async (req, res) => {
    const days = Math.min(Number(req.query.days || 30), 365);
    const { start, end } = getDateRange(days);

    const [
        usersCount,
        projects,
        templates,
        collectionsCount,
        eventsByType,
        eventsByDevice,
        topPaths,
        recentEvents,
    ] = await Promise.all([
        User.countDocuments(),
        Project.find().select("isPublished pages createdAt updatedAt").lean(),
        CommunityTemplate.find()
            .select("name category remixCount likes comments reviews createdAt updatedAt")
            .lean(),
        TemplateCollection.countDocuments(),
        AnalyticsEvent.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
        AnalyticsEvent.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$device", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        AnalyticsEvent.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, path: { $ne: "" } } },
            { $group: { _id: "$path", views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 5 },
        ]),
        AnalyticsEvent.find({ createdAt: { $gte: start, $lte: end } })
            .sort({ createdAt: -1 })
            .limit(8)
            .select("type path device createdAt")
            .lean(),
    ]);

    const eventCounts = eventsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});

    const publishedProjects = projects.filter((project) => project.isPublished).length;
    const totalPages = projects.reduce((total, project) => total + (project.pages?.length || 1), 0);
    const totalTemplateLikes = templates.reduce((total, template) => total + (template.likes?.length || 0), 0);
    const totalTemplateComments = templates.reduce((total, template) => total + (template.comments?.length || 0), 0);
    const totalTemplateReviews = templates.reduce((total, template) => total + (template.reviews?.length || 0), 0);
    const totalTemplateRemixes = templates.reduce((total, template) => total + (template.remixCount || 0), 0);

    return res.status(200).json(
        new ApiResponse(200, {
            range: { days, start, end },
            overview: {
                users: usersCount,
                projects: projects.length,
                publishedProjects,
                draftProjects: Math.max(projects.length - publishedProjects, 0),
                pages: totalPages,
                templates: templates.length,
                collections: collectionsCount,
            },
            events: {
                pageViews: eventCounts.page_view || 0,
                templateUses: eventCounts.template_use || 0,
                projectPublishes: eventCounts.project_publish || 0,
                conversions: eventCounts.conversion || 0,
            },
            templateEngagement: {
                remixes: totalTemplateRemixes,
                likes: totalTemplateLikes,
                comments: totalTemplateComments,
                reviews: totalTemplateReviews,
            },
            devices: eventsByDevice.map((item) => ({
                device: item._id || "unknown",
                count: item.count,
            })),
            topPaths: topPaths.map((item) => ({
                path: item._id,
                views: item.views,
            })),
            topTemplates: templates
                .map((template) => ({
                    id: template._id,
                    name: template.name,
                    category: template.category,
                    remixes: template.remixCount || 0,
                    likes: template.likes?.length || 0,
                    comments: template.comments?.length || 0,
                    reviews: template.reviews?.length || 0,
                }))
                .sort((a, b) => (b.remixes + b.likes + b.comments) - (a.remixes + a.likes + a.comments))
                .slice(0, 5),
            recentEvents,
        }, "Analytics summary fetched successfully"),
    );
});

export { trackAnalyticsEvent, getAnalyticsSummary };
