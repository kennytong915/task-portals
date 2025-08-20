import { PermissionsType } from "../enums/roles.enum";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./role-permission";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionsType[]
) => {
  const permissions = RolePermissions[role];

  // if the role doesn't exist or lacks required permissions, throw an error
  const hasPermission = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermission) {
    throw new UnauthorizedException(
      "You are not authorized to access this resource"
    );
  }
};
