import { Router } from "express";
import {
    getCommunityTemplateById,
    getCommunityTemplates,
    getAdminTemplates,
    getTemplateCategories,
    addTemplateComment,
    addTemplateReview,
    shareProjectAsTemplate,
    toggleFollowCreator,
    toggleTemplateLike,
    updateTemplateApproval,
    useCommunityTemplate,
} from "../Controllers/template.controller.js";
import { requireAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getCommunityTemplates);
router.route("/categories").get(getTemplateCategories);
router.route("/admin/review").get(requireAdmin, getAdminTemplates);
router.route("/from-project/:projectId").post(shareProjectAsTemplate);
router.route("/creators/:userId/follow").post(toggleFollowCreator);
router.route("/:templateId/approval").patch(requireAdmin, updateTemplateApproval);
router.route("/:templateId").get(getCommunityTemplateById);
router.route("/:templateId/like").post(toggleTemplateLike);
router.route("/:templateId/comments").post(addTemplateComment);
router.route("/:templateId/reviews").post(addTemplateReview);
router.route("/:templateId/use").post(useCommunityTemplate);

export default router;
