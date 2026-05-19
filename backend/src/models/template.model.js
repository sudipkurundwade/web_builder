import mongoose, { Schema } from "mongoose";

const templateSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        category: {
            type: String,
            default: "Website",
            trim: true,
            index: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sourceProject: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },
        liveUrl: {
            type: String,
            default: null,
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
            type: [
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
            ],
            default: [],
        },
        remixSettings: {
            type: Object,
            default: null,
        },
        previewHtml: {
            type: String,
            default: "",
        },
        previewCss: {
            type: String,
            default: "",
        },
        isPublic: {
            type: Boolean,
            default: false,
            index: true,
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        rejectionReason: {
            type: String,
            default: "",
            trim: true,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        remixCount: {
            type: Number,
            default: 0,
        },
        likes: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },
        comments: {
            type: [
                {
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: "User",
                    },
                    text: {
                        type: String,
                        required: true,
                        trim: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            default: [],
        },
        reviews: {
            type: [
                {
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: "User",
                    },
                    rating: {
                        type: Number,
                        required: true,
                        min: 1,
                        max: 5,
                    },
                    text: {
                        type: String,
                        default: "",
                        trim: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now,
                    },
                    updatedAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

templateSchema.index({ isPublic: 1, approvalStatus: 1, createdAt: -1 });
templateSchema.index({ name: "text", description: "text", tags: "text", category: "text" });

export const CommunityTemplate = mongoose.model("CommunityTemplate", templateSchema);
