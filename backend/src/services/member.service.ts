import { Roles } from "../enums/roles.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string
) => {

  const workspace = await WorkspaceModel.findById(workspaceId);

  if(!workspace){
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({ userId, workspaceId })
    .populate("role");

  if (!member) {
    throw new NotFoundException("You are not a member of this workspace");
  }

  const roleName = member.role?.name;

  return { role: roleName };
};

export const joinWorkspaceByInviteService = async(
    userId: string,
    inviteCode: string
)=>{
    const workspace = await WorkspaceModel.findOne({inviteCode}).exec();

    if(!workspace){
        throw new NotFoundException("Workspace not found or invite code is invalid");
    }

    const existingMember = await MemberModel.findOne({
        userId,
        workspaceId: workspace._id,
    }).exec();

    if(existingMember){
        throw new BadRequestException("You are already a member of this workspace");
    }

    const role = await RoleModel.findOne({
        name: Roles.MEMBER,
    }).exec();

    if(!role){
        throw new NotFoundException("Member role not found");
    }
    const newMember = new MemberModel({
        userId,
        workspaceId: workspace._id,
        role: role._id,
    });

    await newMember.save();

    return {
        workspaceId: workspace._id,
        role: role.name,
    };
}
