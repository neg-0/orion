import { Router } from "express";

// import { getIssues } from "../controllers/githubController";

const router = Router();

// router.get("/issues", (req, res) => {
//   const options = req.body.params || {};
//   getIssues(options)
//     .then((issues: any) => {
//       res.json(issues);
//     })
//     .catch((error: { message: any; }) => {
//       console.error(error);
//       res.status(500).json({ error: error.message });
//     });
// });

export default router;