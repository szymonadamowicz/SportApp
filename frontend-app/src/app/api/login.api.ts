import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";
import { loginMock } from "./apiMock/login/login.mock";
import { loginReal } from "./apiReal/login.real";
import { API_MODE } from "./env";

const impl = API_MODE === "mock" ? loginMock : loginReal;

export const loginApi = (payload: LoginDTO): Promise<string> =>
  impl.login(payload);

export const registerApi = (payload: RegisterDTO): Promise<string> =>
  impl.register(payload);
