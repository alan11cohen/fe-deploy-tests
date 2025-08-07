import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { JoinTableRequest, JoinTableResponse, ApiError } from "@/types";

export const useJoinTable = () => {
  return useMutation<
    JoinTableResponse,
    ApiError,
    { code: string; data: JoinTableRequest }
  >({
    mutationFn: async ({ code, data }) => {
      const response = await apiClient.post<JoinTableResponse>(
        `/table-sessions/join/${code}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("currentSession", JSON.stringify(data.session));
    },
    onError: (error) => {
      console.error("Failed to join table:", error.message);
    },
  });
};
