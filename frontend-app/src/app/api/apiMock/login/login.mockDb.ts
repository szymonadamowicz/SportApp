import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";
import { loginUserSeed } from "./login.seed";

const db: LoginDTO[] = [...loginUserSeed];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const loginMockDb = {
  async login(payload: LoginDTO): Promise<boolean> {
    await delay(150);
    if (payload) {
      db.map((u) => u.login == payload.login && u.password == payload.password);
      return true;
    }
    return false;
  },
   async register(payload: RegisterDTO): Promise<boolean> {
    await delay(150);
    if (payload) {
      db.map((u) => u.login == payload.login);
      return false;
    }
    db.unshift(payload)
    console.log(db)
    return true;
  },
};


