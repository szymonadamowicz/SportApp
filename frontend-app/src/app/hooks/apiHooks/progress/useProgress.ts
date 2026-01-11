"use client";

import { fetchProgressApi } from "@/api/apiMock/progress/progress.api";
import { progressKeys } from "@/api/keys/progress.keys";
import { mapProgressDTO } from "@/api/mappers/progress/progressMapper";
import { Progress } from "@/types/progress/progress";
import { useQuery } from "@tanstack/react-query";

export const useProgress = () => {
  const query = useQuery<Progress>({
    queryKey: progressKeys.all,
    queryFn: async () => {
      const dto = await fetchProgressApi();
      return mapProgressDTO(dto);
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
  });

  return {
    progress: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
