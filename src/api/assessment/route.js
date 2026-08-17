import express from 'express';
import {
  createAssessment,
  getAssessment,
  getAssessmentRuns,
  runAssessment,
} from './controller.js';
import { validateAssessmentId, validateCreateAssessment } from './middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Assessments
 *   description: MVP intake and generated assessment reports
 */

/**
 * @swagger
 * /api/v1/assessments:
 *   post:
 *     summary: Create an assessment draft from the 5-step wizard
 *     tags: [Assessments]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [intakeData]
 *             properties:
 *               intakeData:
 *                 type: object
 *           example:
 *             intakeData:
 *               idea:
 *                 appName: Pantry
 *                 oneLiner: an app which help you manage pantry, groceries and recipes
 *                 elevatorPitch: an app which makes cooking fun and help you organize your kitchen
 *                 industryTags: [SaaS, Social, Food/Bev]
 *               users:
 *                 primaryUser: people who want to learn cooking and prepare their own meals
 *                 secondaryUsers: moms, kitchen managers
 *                 businessType: B2C
 *                 expectedUsersYear1: 1,000 - 10,000
 *               problem:
 *                 problem: people dont know what to cook and how to cook
 *                 currentSolution: youtube videos and suggestions
 *                 whyNow: healthy eating is a trend
 *               features:
 *                 coreFeatures: recipes based on your available food items
 *                 inspirationApps: ""
 *                 platform: [iOS, Android]
 *                 niceToHave: social feature like sharing what you cook
 *               business:
 *                 revenueModels: [Subscriptions]
 *                 budgetRange: Not sure
 *                 timeline: No rush
 *                 devTeamStatus: Yes — agency
 *                 additionalNotes: ""
 *     responses:
 *       201:
 *         description: Draft created
 *       400:
 *         description: Invalid intake payload
 */
router.post('/', validateCreateAssessment, createAssessment);

/**
 * @swagger
 * "/api/v1/assessments/{id}/run":
 *   post:
 *     summary: Run mock AI models and save the merged report
 *     tags: [Assessments]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric assessment id from POST /assessments
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Assessment completed with finalReport
 *       404:
 *         description: Assessment not found
 *       409:
 *         description: Already processing
 */
router.post('/:id/run', validateAssessmentId, runAssessment);

/**
 * @swagger
 * "/api/v1/assessments/{id}":
 *   get:
 *     summary: Get an assessment and its final report
 *     tags: [Assessments]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric assessment id from POST /assessments
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Assessment found
 *       404:
 *         description: Assessment not found
 */
router.get('/:id', validateAssessmentId, getAssessment);

/**
 * @swagger
 * "/api/v1/assessments/{id}/runs":
 *   get:
 *     summary: List per-model assessment runs (debug)
 *     tags: [Assessments]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric assessment id from POST /assessments
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Run list
 *       404:
 *         description: Assessment not found
 */
router.get('/:id/runs', validateAssessmentId, getAssessmentRuns);

export default router;
