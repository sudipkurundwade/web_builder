import mongoose, { Schema } from "mongoose";

const analyticsEventSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["page_view", "template_use", "project_publish", "conversion"],
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            default: null,
            index: true,
        },
        template: {
            type: Schema.Types.ObjectId,
            ref: "CommunityTemplate",
            default: null,
            index: true,
        },
        path: {
            type: String,
            default: "",
            trim: true,
            index: true,
        },
        device: {
            type: String,
            enum: ["desktop", "tablet", "mobile", "unknown"],
            default: "unknown",
            index: true,
        },
        metadata: {
            type: Object,
            default: {},
        },
    },
    {
        timestamps: true,
    },
);

analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ createdAt: -1 });

export const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);
