import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { LoginRequest, LoginResponse, ApiError } from "@/types";

export const useLogin = () => {
  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<LoginResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      sessionStorage.setItem("firebaseToken", data.access_token);
      sessionStorage.setItem("userType", "logged");
      sessionStorage.setItem("user", JSON.stringify(data.user));
    },
    onError: (error) => {
      if (sessionStorage.getItem("firebaseToken")) {
        sessionStorage.removeItem("firebaseToken");
        sessionStorage.removeItem("userType");
        sessionStorage.removeItem("user");
      }
    },
  });
};
