import { Router } from "express";
import { getWorkspaceFile, getWorkspaceFileStructure, saveWorkspaceFile, workspaceFileIsDirectory } from "../controllers/workspaceController";

const router = Router();

router.get("/files", (req, res) => {
  const projectName = req.query.projectName as string | undefined;

  if (!projectName) {
    return res.status(400).json({ error: "Project name is required" });
  }

  getWorkspaceFileStructure(projectName)
    .then((files: any) => {
      res.json(files);
    })
    .catch((error: { message: any; }) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

router.get("/file", async (req, res) => {
  const projectName = req.query.projectName as string | undefined;
  const filePath = req.query.filePath as string | undefined;

  if (!projectName) {
    return res.status(400).json({ error: "Project name is required" });
  }

  if (!filePath) {
    return res.status(400).json({ error: "File path is required" });
  }

  // If the given filePath is a directory, return an error
  if (await workspaceFileIsDirectory(projectName, filePath)) {
    return res.status(400).json({ error: "Cannot read a directory" });
  }

  getWorkspaceFile(projectName, filePath)
    .then((file: any) => {
      res.json(file);
    })
    .catch((error: { message: any; }) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

router.post("/save", (req, res) => {
  const projectName = req.body.projectName as string | undefined;
  const filePath = req.body.filePath as string | undefined;
  const code = req.body.code as string | undefined;

  if (!projectName) {
    return res.status(400).json({ error: "Project name is required" });
  }

  if (!filePath) {
    return res.status(400).json({ error: "File path is required" });
  }

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  saveWorkspaceFile(projectName, filePath, code)
    .then(() => {
      res.json({ message: "File saved" });
    })
    .catch((error: { message: any; }) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

export default router;