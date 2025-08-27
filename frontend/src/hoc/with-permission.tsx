import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// HOC (Higher Order Component) to check if the user has the required permission 
// if not, redirect to the workspace page
// HOC means a function that takes a component and returns a new component with additional functionality
const withPermission = ( 
  WrappedComponent: React.ComponentType,
  requiredPermission: PermissionType  
) => {
  const WithPermission = (props: any) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    useEffect(()=>{
      if (!user || !hasPermission(requiredPermission)){
        navigate(`/workspace/${workspaceId}`);
      }
    },[user, hasPermission, workspaceId, navigate]);

    if (isLoading) return <div>Loading...</div>;

    if (!user || !hasPermission(requiredPermission)){
      return;
    }

    return <WrappedComponent {...props} />;
  };
  return WithPermission;
};

export default withPermission;
