import { LoginDTO, RegisterDTO } from "./../../../types/login/loginDTO";
import { loginMockDb } from "./login.mockDb";

export const loginMock = {
  login(payload: LoginDTO): Promise<string> {
    return loginMockDb.login(payload);
  },

  register(payload: RegisterDTO): Promise<string> {
    return loginMockDb.register(payload);
  },
};
