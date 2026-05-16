import { Router } from "express";
import {
    getPublicProfile,
    toggleFollowProfile,
    updateMyProfile,
} from "../Controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/me").put(updateMyProfile);
router.route("/:userId").get(getPublicProfile);
router.route("/:userId/follow").post(toggleFollowProfile);

export default router;
