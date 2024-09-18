// An index of all the routes in the application

import express from 'express';
import githubRoutes from './github';
import projectRoutes from './project';
import workspaceRoutes from './workspace';

const router = express.Router();

router.use('/github', githubRoutes);
router.use('/project', projectRoutes);
router.use('/workspace', workspaceRoutes);

export default router;