import mongoose, { Schema } from "mongoose";

const versionPageSchema = new Schema(
    {
        id: String,
        name: String,
        html: String,
        css: String,
        slug: String,
        title: String,
        description: String,
        faviconUrl: String,
        ogImageUrl: String,
    },
    { _id: false },
);

const projectVersionSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        label: {
            type: String,
            default: "",
            trim: true,
        },
        action: {
            type: String,
            enum: ["save", "publish", "restore"],
            default: "save",
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        projectData: {
            type: Object,
            default: {},
        },
        html: {
            type: String,
            default: "",
        },
        css: {
            type: String,
            default: "",
        },
        pages: {
            type: [versionPageSchema],
            default: [],
        },
        remixSettings: {
            type: Object,
            default: null,
        },
        githubRepo: {
            type: String,
            default: null,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        liveUrl: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

projectVersionSchema.index({ project: 1, createdAt: -1 });

export const ProjectVersion = mongoose.model("ProjectVersion", projectVersionSchema);
