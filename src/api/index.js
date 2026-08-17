import express from 'express';
import assessmentRoutes from './assessment/route.js';

const router = express.Router();

router.use('/assessments', assessmentRoutes);

export default router;
