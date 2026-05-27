import dotenv from "dotenv";
import connectDB from "../db/index.js";
import { UIComponent, PageBlock } from "../models/block.model.js";
import { Project } from "../models/project.model.js";
import { CommunityTemplate } from "../models/template.model.js";
import { User } from "../models/user.model.js";
import { uiComponentsSeed, pageBlocksSeed } from "./blocks.seed.js";
import { starterTemplatesSeed } from "./starterTemplates.seed.js";

dotenv.config({ path: "./.env" });

if (!process.env.MONGO_URI && process.env.MONGODB_URI) {
  process.env.MONGO_URI = process.env.MONGODB_URI;
}

const runSeed = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      throw new Error("Database connection failed");
    }

    await UIComponent.deleteMany({});
    await PageBlock.deleteMany({});

    const insertedUI = await UIComponent.insertMany(uiComponentsSeed);
    const insertedPage = await PageBlock.insertMany(pageBlocksSeed);

    let seedUser = await User.findOne({ email: "templates@webbuilder.local" });
    if (!seedUser) {
      seedUser = await User.create({
        name: "Web Builder Studio",
        email: "templates@webbuilder.local",
        password: "password123",
        role: "admin",
        bio: "Starter templates maintained for the community library.",
      });
    }

    await CommunityTemplate.deleteMany({ owner: seedUser._id, tags: "starter-template" });
    await Project.deleteMany({ owner: seedUser._id, name: { $in: starterTemplatesSeed.map((template) => template.name) } });

    const insertedTemplates = [];
    for (const template of starterTemplatesSeed) {
      const project = await Project.create({
        name: template.name,
        owner: seedUser._id,
        html: template.html,
        css: template.css,
        pages: [{
          id: "home",
          name: "Home",
          slug: "index",
          title: template.name,
          description: template.description,
          html: template.html,
          css: template.css,
        }],
        isPublished: false,
        githubRepo: null,
        liveUrl: null,
      });

      insertedTemplates.push(await CommunityTemplate.create({
        ...template,
        owner: seedUser._id,
        sourceProject: project._id,
        projectData: {},
        pages: project.pages,
        previewHtml: template.html,
        previewCss: template.css,
        isPublic: true,
        approvalStatus: "approved",
        reviewedBy: seedUser._id,
        reviewedAt: new Date(),
      }));
    }

    console.log(`Seed complete: ${insertedUI.length} ui_components inserted`);
    console.log(`Seed complete: ${insertedPage.length} page_blocks inserted`);
    console.log(`Seed complete: ${insertedTemplates.length} community templates inserted`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

runSeed();
