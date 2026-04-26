import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllUIComponents,
  getAllPageBlocks,
  getBlockById,
} from "../Controllers/blocks.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/ui", getAllUIComponents);
router.get("/page", getAllPageBlocks);
router.get("/:id", getBlockById);

export default router;
