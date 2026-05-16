import mongoose, {Schema} from "mongoose";

const projectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            index: true
        },
        projectData: {
            type: Object, // GrapesJS raw data
            default: {}
        },
        html: {
            type: String,
        },
        css: {
            type: String,
        },
        pages: {
            type: [
                {
                    id: String,
                    name: String,
                    html: String,
                    css: String
                }
            ],
            default: []
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        liveUrl: {
            type: String,
            default: null
        },
        githubRepo: {
            type: String,
            default: null  // Format: "username/repo"
        },
        remixSettings: {
            type: Object,
            default: null
        }
    },
    {
        timestamps: true
    }
)

export const Project = mongoose.model("Project", projectSchema)
