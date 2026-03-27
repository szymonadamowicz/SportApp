import { LoginDTO, RegisterDTO } from "./../../../types/login/loginDTO";
import { mockAuthService } from "@/mocks/services/mockAuth.service";

export const loginMock = {
  login(payload: LoginDTO): Promise<string> {
    return mockAuthService.login(payload);
  },

  register(payload: RegisterDTO): Promise<string> {
    return mockAuthService.register(payload);
  },
};
