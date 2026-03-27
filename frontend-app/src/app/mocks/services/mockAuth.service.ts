import { usersRepository } from "@/mocks/repositories/users.repository";
import { mockDelay } from "@/mocks/runtime/delay";
import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";

export const mockAuthService = {
  async login(payload: LoginDTO): Promise<string> {
    await mockDelay(150);

    if (!payload?.login || !payload?.password) return "";

    const user = usersRepository.getByLogin(payload.login);
    if (!user || user.password !== payload.password) return "";

    return `mock:${payload.login}`;
  },

  async register(payload: RegisterDTO): Promise<string> {
    await mockDelay(150);

    if (!payload?.login || !payload?.password || !payload?.repeatPassword) {
      return "";
    }

    if (payload.password !== payload.repeatPassword) return "";

    const created = usersRepository.create(payload.login, payload.password);
    if (!created) return "";

    return `mock:${payload.login}`;
  },
};
