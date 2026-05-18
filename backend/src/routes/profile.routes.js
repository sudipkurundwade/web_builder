import { Router } from "express";
import {
    getPublicProfile,
    toggleFollowProfile,
    updateFeaturedTemplates,
    updateMyProfile,
} from "../Controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/me").put(updateMyProfile);
router.route("/me/featured-templates").put(updateFeaturedTemplates);
router.route("/:userId").get(getPublicProfile);
router.route("/:userId/follow").post(toggleFollowProfile);

export default router;
