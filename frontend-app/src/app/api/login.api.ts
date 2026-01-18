import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";
import { loginMock } from "./apiMock/login/login.mock";
import { loginReal } from "./apiReal/login.real";

const mode = process.env.NEXT_PUBLIC_API_MODE;
const impl = mode === "mock" ? loginMock : loginReal;

export const loginApi = (payload: LoginDTO): Promise<boolean> =>
  impl.login(payload);

export const registerApi = (payload: RegisterDTO): Promise<boolean> =>
  impl.register(payload);
