import { Router } from "express";
import { 
    createProject, 
    getProjectById, 
    getUserProjects, 
    saveProject,
    publishProject,
    deleteProject,
    duplicateProject
} from "../Controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All project routes require authentication
router.use(verifyJWT);

router.route("/").post(createProject).get(getUserProjects);
router.route("/:projectId").get(getProjectById).put(saveProject).delete(deleteProject);
router.route("/:projectId/publish").put(publishProject);
router.route("/:projectId/duplicate").post(duplicateProject);

export default router;
