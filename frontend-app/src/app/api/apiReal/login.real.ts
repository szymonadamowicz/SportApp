import { httpClient } from "@/api/httpClient";
import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";

export const loginReal = {
  async login(payload: LoginDTO): Promise<string> {
    const res = await httpClient<{ token: string }>("/auth/login", {
      method: "POST",
      body: payload,
    });

    return res.token;
  },
  async register(payload: RegisterDTO): Promise<string> {
    const res = await httpClient<{ token: string }>("/auth/register", {
      method: "POST",
      body: payload,
    });
    return res.token;
  },
};
