import { logger } from "../../utils/logger.js";
import assessmentService from "./service.js";

export const createAssessment = async (req, res, next) => {
  try {
    const assessment = await assessmentService.createAssessment(
      req.body.intakeData,
    );
    return res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    logger.error(`Create assessment controller: ${error.message}`);
    return next(error);
  }
};

export const getAssessment = async (req, res, next) => {
  try {
    const assessment = await assessmentService.getAssessmentById(
      req.assessmentId,
    );
    return res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    logger.error(`Get assessment controller: ${error.message}`);
    return next(error);
  }
};

export const getAssessmentRuns = async (req, res, next) => {
  try {
    const runs = await assessmentService.getAssessmentRuns(req.assessmentId);
    return res.status(200).json({ success: true, data: runs });
  } catch (error) {
    logger.error(`Get assessment runs controller: ${error.message}`);
    return next(error);
  }
};

export const runAssessment = async (req, res, next) => {
  try {
    const assessment = await assessmentService.runAssessmentById(
      req.assessmentId,
    );
    return res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    logger.error(`Run assessment controller: ${error.message}`);
    return next(error);
  }
};
