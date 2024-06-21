// An index of all the routes in the application

import express from 'express';
import githubRoutes from './github.js';

const router = express.Router();

router.use('/github', githubRoutes);

export default router;