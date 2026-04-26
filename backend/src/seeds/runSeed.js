import dotenv from "dotenv";
import connectDB from "../db/index.js";
import { UIComponent, PageBlock } from "../models/block.model.js";
import { uiComponentsSeed, pageBlocksSeed } from "./blocks.seed.js";

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

    console.log(`Seed complete: ${insertedUI.length} ui_components inserted`);
    console.log(`Seed complete: ${insertedPage.length} page_blocks inserted`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

runSeed();
