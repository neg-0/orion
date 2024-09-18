import { Router } from "express";
import { getProjects } from "../controllers/projectController";
import { initializeProjectWorkspace } from "../controllers/workspaceController";

const router = Router();

router.get("/", (req, res) => {
  // Send a list of projecst
  getProjects()
    .then((projects: any) => {
      res.json(projects);
    })
    .catch((error: { message: any; }) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

router.post("/new", (req, res) => {
  const projectName = req.body.projectName;
  initializeProjectWorkspace(projectName)
    .then(() => {
      res.json({ message: "Project workspace initialized" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

export default router;