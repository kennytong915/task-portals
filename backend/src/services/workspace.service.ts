import mongoose from "mongoose";
import { Roles } from "../enums/roles.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import WorkspaceModel from "../models/workspace.model";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.models";
import { Types } from "mongoose";
import { UserDocument } from "../models/user.model";

export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string;
    description?: string | undefined;
  }
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const ownerRole = await RoleModel.findOne({
    name: Roles.OWNER,
  });

  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = await WorkspaceModel.create({
    name,
    description,
    owner: user._id,
  });

  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });

  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;

  return { workspace };
};

export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  const workspaces = memberships.map((membership) => membership.workspaceId);

  return { workspaces };
};

export const getWorkSpaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const members = await MemberModel.find({ workspaceId }).populate("role");

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return { workspace: workspaceWithMembers };
};

export const getWorkspaceMembersService = async (workspaceId: string) => {
  // fetch all members of the workspace
  const members = await MemberModel.find({ workspaceId })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permissions")
    .lean();

  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();
  const totalTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
  });
  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });

  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics = {
    totalTasks,
    overdueTasks,
    completedTasks,
  };

  return { analytics };
};

export const changeMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string
) => {
  const role = await RoleModel.findById(roleId);

  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  });

  if (!member) {
    throw new Error("Member not found in the workspace");
  }

  member.role = role;
  await member.save();

  return { member };
};

export const updateWorkspaceService = async (
  workspaceId: string,
  name: string,
  description?: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;

  await workspace.save();

  return { workspace };
};

export const deleteWorkspaceService = async (
  workspaceId: string,
  userId: string
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const workspace = await WorkspaceModel.findById(workspaceId).session(
      session
    );

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    if (!workspace.owner.equals(userId)) {
      throw new BadRequestException("You are not the owner of this workspace");
    }

    const user = await UserModel.findById(userId).session(session);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Capture users whose currentWorkspace points to the soon-to-be-deleted workspace
    const affectedUsers = (await UserModel.find({
      currentWorkspace: workspace._id,
    })
      .session(session)) as UserDocument[];

    // Remove related entities
    await ProjectModel.deleteMany({ workspace: workspace._id }).session(
      session
    );
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session);
    await MemberModel.deleteMany({ workspaceId: workspace._id }).session(
      session
    );

    // Re-point currentWorkspace for affected users
    for (const u of affectedUsers) {
      const nextMembership = await MemberModel.findOne({
        userId: u._id as Types.ObjectId,
      }).session(session);

      u.currentWorkspace = nextMembership
        ? (nextMembership.workspaceId as any)
        : null;
      await u.save({ session });
    }

    // Finally delete the workspace itself
    await workspace.deleteOne({ session });

    const refreshedUser = await UserModel.findById(userId).session(session);

    await session.commitTransaction();
    return { currentWorkspace: refreshedUser?.currentWorkspace ?? null };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
