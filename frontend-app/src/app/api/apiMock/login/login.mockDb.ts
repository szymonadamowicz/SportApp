import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";
import { loginUserSeed } from "./login.seed";

const db: Array<{ login: string; password: string }> = [...loginUserSeed];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const loginMockDb = {
  async login(payload: LoginDTO): Promise<boolean> {
    await delay(150);
    if (!payload?.login || !payload?.password) return false;

    return db.some(
      (u) => u.login === payload.login && u.password === payload.password,
    );
  },

  async register(payload: RegisterDTO): Promise<boolean> {
    await delay(150);
    if (!payload?.login || !payload?.password || !payload?.repeatPassword) {
      return false;
    }

    if (payload.password !== payload.repeatPassword) return false;

    const exists = db.some((u) => u.login === payload.login);
    if (exists) return false;

    db.unshift({ login: payload.login, password: payload.password });
    return true;
  },
};
