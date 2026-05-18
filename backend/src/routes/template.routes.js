import { Router } from "express";
import {
    getCommunityTemplateById,
    getCommunityTemplates,
    addTemplateComment,
    addTemplateReview,
    shareProjectAsTemplate,
    toggleFollowCreator,
    toggleTemplateLike,
    useCommunityTemplate,
} from "../Controllers/template.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getCommunityTemplates);
router.route("/from-project/:projectId").post(shareProjectAsTemplate);
router.route("/creators/:userId/follow").post(toggleFollowCreator);
router.route("/:templateId").get(getCommunityTemplateById);
router.route("/:templateId/like").post(toggleTemplateLike);
router.route("/:templateId/comments").post(addTemplateComment);
router.route("/:templateId/reviews").post(addTemplateReview);
router.route("/:templateId/use").post(useCommunityTemplate);

export default router;
