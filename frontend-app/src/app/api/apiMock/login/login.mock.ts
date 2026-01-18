import { LoginDTO, RegisterDTO } from "./../../../types/login/loginDTO";
import { loginMockDb } from "./login.mockDb";

export const loginMock = {
  login(payload: LoginDTO): Promise<boolean> {
    return loginMockDb.login(payload);
  },

  register(payload: RegisterDTO): Promise<boolean> {
    return loginMockDb.register(payload);
  },
};
