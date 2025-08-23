import mongoose from "mongoose";
import ProjectModel from "../models/project.models";
import TaskModel from "../models/task.model";
import { NotFoundException } from "../utils/appError";
import { TaskStatusEnum } from "../enums/task.enum";

export const createProjectService = async (
  userId: string,
  workspaceId: string,
  body: {
    name: string;
    description?: string;
    emoji?: string;
  }
) => {
  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });
  await project.save();

  return { project };
};

export const getProjectByIdAndWorkspaceIdService = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id name emoji description");

  if (!project) {
    throw new NotFoundException("Project not found or does not belong to the workspace");
  }

  return { project };
};


export const getProjectAnalyticsService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or does not belong to the workspace"
    );
  }

  const currentDate = new Date();

  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [
          {
            $count: "count",
          },
        ],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: { $ne: TaskStatusEnum.DONE },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const _analytics = taskAnalytics[0];

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return { analytics };
};

export const updateProjectService = async (
  projectId: string,
  workspaceId: string,
  body: {
    name: string;
    description?: string;
    emoji?: string;
  }
) => {
  const {name, emoji, description} = body;
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException("Project not found or does not belong to the workspace");
  }

  project.name = name || project.name;
  project.emoji = emoji || project.emoji;
  project.description = description || project.description;

  await project.save();

  return { project };
};

export const deleteProjectService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException("Project not found or does not belong to the workspace");
  }

  await TaskModel.deleteMany({ project: project._id});
  await project.deleteOne();

  return { project };
};