import { Router } from "express";
import {
    addTemplateToCollection,
    createCollection,
    getCollections,
    removeTemplateFromCollection,
} from "../Controllers/collection.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getCollections).post(createCollection);
router.route("/:collectionId/templates/:templateId")
    .post(addTemplateToCollection)
    .delete(removeTemplateFromCollection);

export default router;
