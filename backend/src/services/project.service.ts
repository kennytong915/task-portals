import ProjectModel from "../models/project.models";

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
