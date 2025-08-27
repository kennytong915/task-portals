import { PermissionType } from "@/constant";
import { UserType } from "@/types/api.type";
import { WorkspaceWithMembersType } from "@/types/api.type";
import { useState, useEffect, useMemo } from "react";

const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
) => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  useEffect(() => {
    if (user && workspace) {
      const member = workspace.members.find(
        (member) => member.userId === user._id
      );
      if (member) {
        setPermissions(member.role.permissions||[]);
      }
    }
  }, [user, workspace]);
  return useMemo(()=>permissions,[permissions]);
};

export default usePermissions;
