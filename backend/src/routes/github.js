import { Router } from "express";

import { getIssues } from "../controllers/githubController.js";

const router = Router();

router.get("/issues", (req, res) => {
  const options = req.body.params || {};
  getIssues(options)
    .then((issues) => {
      res.json(issues);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

export default router;