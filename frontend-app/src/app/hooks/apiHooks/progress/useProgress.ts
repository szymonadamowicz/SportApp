"use client";

import { progressKeys } from "@/api/keys/progress.keys";
import { mapProgressDTO } from "@/api/mappers/progress/progressMapper";
import { fetchProgressApi } from "@/api/progress.api";
import { useAuth } from "@/hooks/auth/useAuth";
import { Progress } from "@/types/progress/progress";
import { ProgressScope } from "@/types/progress/progressDTO";
import { useQuery } from "@tanstack/react-query";

export const useProgress = (scope: ProgressScope = "all") => {
  const { isAuthenticated, isReady } = useAuth();

  const query = useQuery<Progress>({
    queryKey: progressKeys.all(scope),
    queryFn: async () => {
      const dto = await fetchProgressApi(scope);
      return mapProgressDTO(dto);
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    enabled: isReady && isAuthenticated,
  });

  return {
    progress: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
