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
import { optionalJWT, requireAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(optionalJWT, getCommunityTemplates);
router.route("/categories").get(getTemplateCategories);
router.route("/admin/review").get(verifyJWT, requireAdmin, getAdminTemplates);
router.route("/from-project/:projectId").post(verifyJWT, shareProjectAsTemplate);
router.route("/creators/:userId/follow").post(verifyJWT, toggleFollowCreator);
router.route("/:templateId/approval").patch(verifyJWT, requireAdmin, updateTemplateApproval);
router.route("/:templateId").get(optionalJWT, getCommunityTemplateById);
router.route("/:templateId/like").post(verifyJWT, toggleTemplateLike);
router.route("/:templateId/comments").post(verifyJWT, addTemplateComment);
router.route("/:templateId/reviews").post(verifyJWT, addTemplateReview);
router.route("/:templateId/use").post(verifyJWT, useCommunityTemplate);

export default router;
