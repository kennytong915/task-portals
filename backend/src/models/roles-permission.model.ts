import mongoose, { Document, Schema } from "mongoose";
import { Permissions, PermissionsType, Roles, RolesType } from "../enums/roles.enum";
import { RolePermissions } from "../utils/role-permission";

export interface RoleDocument extends Document {
  name: RolesType;
  permissions: Array<PermissionsType>;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<RoleDocument>({
  name: {
    type: String,
    enum: Object.values(Roles),
    required: true,
    unique: true,
  },
  permissions: {
    type: [String],
    enum: Object.values(Permissions),
    required: true,
    default: function (this: RoleDocument) {
      return RolePermissions[this.name];
    },
  },
});

const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
export default RoleModel;
