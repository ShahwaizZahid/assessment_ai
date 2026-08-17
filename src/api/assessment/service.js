import { prisma } from "../../configurations/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";
import { runAssessment } from "../../services/ai/orchestrator.js";

const toPublicAssessment = (row) => ({
  id: row.id,
  userId: row.userId,
  status: row.status,
  intakeData: row.intakeData,
  finalReport: row.finalReport,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const createAssessment = async (intakeData) => {
  try {
    const assessment = await prisma.assessment.create({
      data: {
        intakeData,
        status: "draft",
      },
    });
    return toPublicAssessment(assessment);
  } catch (error) {
    logger.error(`Create assessment failed: ${error.message}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to create assessment", 500);
  }
};

const getAssessmentById = async (id) => {
  try {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      throw new ApiError("Assessment not found", 404);
    }
    return toPublicAssessment(assessment);
  } catch (error) {
    logger.error(`Get assessment failed: ${error.message}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to get assessment", 500);
  }
};

const getAssessmentRuns = async (id) => {
  try {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      throw new ApiError("Assessment not found", 404);
    }

    const runs = await prisma.assessmentRun.findMany({
      where: { assessmentId: id },
      orderBy: { createdAt: "asc" },
    });

    return runs.map((run) => ({
      id: run.id,
      assessmentId: run.assessmentId,
      provider: run.provider,
      model: run.model,
      role: run.role,
      promptVersion: run.promptVersion,
      status: run.status,
      inputData: run.inputData,
      outputData: run.outputData,
      errorMessage: run.errorMessage,
      latencyMs: run.latencyMs,
      createdAt: run.createdAt,
    }));
  } catch (error) {
    logger.error(`Get assessment runs failed: ${error.message}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to get assessment runs", 500);
  }
};

const runAssessmentById = async (id) => {
  try {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      throw new ApiError("Assessment not found", 404);
    }

    if (assessment.status === "processing") {
      throw new ApiError("Assessment is already processing", 409);
    }

    await prisma.assessment.update({
      where: { id },
      data: { status: "processing", finalReport: null },
    });

    await prisma.assessmentRun.deleteMany({ where: { assessmentId: id } });

    let status;
    try {
      ({ status } = await runAssessment({
        assessmentId: id,
        intakeData: assessment.intakeData,
      }));
    } catch (error) {
      await prisma.assessment.update({
        where: { id },
        data: { status: "failed" },
      });
      throw error;
    }

    const updated = await prisma.assessment.findUnique({ where: { id } });
    if (!updated) {
      throw new ApiError("Assessment not found after run", 404);
    }

    if (status === "failed") {
      throw new ApiError("All model runs failed", 502);
    }

    return toPublicAssessment(updated);
  } catch (error) {
    logger.error(`Run assessment failed: ${error.message}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to run assessment", 500);
  }
};

export default {
  createAssessment,
  getAssessmentById,
  runAssessmentById,
  getAssessmentRuns,
};
