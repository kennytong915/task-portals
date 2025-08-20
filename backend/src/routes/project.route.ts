import { Router } from "express";
import { createProjectController } from "../controllers/project.controller";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create", createProjectController);
projectRoutes.get("/workspace/:workspaceId/all", getAllProjectsInWorkspaceController);
export default projectRoutes;