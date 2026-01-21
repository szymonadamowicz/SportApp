import { loginApi } from "@/api/login.api";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () =>
  useMutation({
    mutationFn: loginApi,
  });
