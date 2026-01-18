import { httpClient } from "@/api/httpClient";
import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";

export const loginReal = {
  login(payload: LoginDTO): Promise<boolean> {
    return httpClient<boolean>("/login", {
      method: "POST",
      body: payload,
    });
  },
  register(payload: RegisterDTO): Promise<boolean> {
    return httpClient<boolean>("/register", {
      method: "POST",
      body: payload,
    });
  },
};
