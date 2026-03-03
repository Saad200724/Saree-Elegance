import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery<{
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  }>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const logout = () => {
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: false,
  };
}
