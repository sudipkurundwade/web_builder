import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

/**
 * User Model
 * Fields: name, email, password (hashed), plan
 */
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free",
        },
        bio: {
            type: String,
            default: "",
            trim: true,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            default: "",
            trim: true,
        },
        socialLinks: {
            github: {
                type: String,
                default: "",
                trim: true,
            },
            linkedin: {
                type: String,
                default: "",
                trim: true,
            },
            website: {
                type: String,
                default: "",
                trim: true,
            },
        },
        followers: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },
        following: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare plain password with hashed
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
