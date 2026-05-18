import { Router } from "express";
import { 
    createProject, 
    createRemixProject,
    getProjectById, 
    getUserProjects, 
    saveProject,
    publishProject,
    deleteProject,
    duplicateProject,
    getProjectVersions,
    restoreProjectVersion,
    duplicateProjectVersion
} from "../Controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All project routes require authentication
router.use(verifyJWT);

router.route("/").post(createProject).get(getUserProjects);
router.route("/remix").post(createRemixProject);
router.route("/:projectId").get(getProjectById).put(saveProject).delete(deleteProject);
router.route("/:projectId/publish").put(publishProject);
router.route("/:projectId/duplicate").post(duplicateProject);
router.route("/:projectId/versions").get(getProjectVersions);
router.route("/:projectId/versions/:versionId/restore").post(restoreProjectVersion);
router.route("/:projectId/versions/:versionId/duplicate").post(duplicateProjectVersion);

export default router;
