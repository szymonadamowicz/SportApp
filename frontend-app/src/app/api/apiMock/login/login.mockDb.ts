import { LoginDTO, RegisterDTO } from "@/types/login/loginDTO";
import { loginUserSeed } from "./login.seed";
import { UsersDb } from "@/types/login/login";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const USERS_KEY = "rf_mock_users_v1";

const safeRead = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const seedUsersIfEmpty = () => {
  const users = safeRead<UsersDb>(USERS_KEY, {});
  if (Object.keys(users).length > 0) return;

  const seeded: UsersDb = {};
  for (const u of loginUserSeed) {
    seeded[u.login] = { password: u.password };
  }
  safeWrite(USERS_KEY, seeded);
};

const readUsers = (): UsersDb => {
  seedUsersIfEmpty();
  return safeRead<UsersDb>(USERS_KEY, {});
};

const writeUsers = (db: UsersDb) => safeWrite(USERS_KEY, db);

export const loginMockDb = {
  async login(payload: LoginDTO): Promise<boolean> {
    await delay(150);
    if (!payload?.login || !payload?.password) return false;

    const users = readUsers();
    const u = users[payload.login];
    return !!u && u.password === payload.password;
  },

  async register(payload: RegisterDTO): Promise<boolean> {
    await delay(150);
    if (!payload?.login || !payload?.password || !payload?.repeatPassword) {
      return false;
    }

    if (payload.password !== payload.repeatPassword) return false;

    const users = readUsers();
    const exists = !!users[payload.login];
    if (exists) return false;

    users[payload.login] = { password: payload.password };
    writeUsers(users);
    return true;
  },
};
