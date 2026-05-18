import mongoose, { Schema } from "mongoose";

const collectionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        templates: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "CommunityTemplate",
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

collectionSchema.index({ owner: 1, name: 1 }, { unique: true });

export const TemplateCollection = mongoose.model("TemplateCollection", collectionSchema);
